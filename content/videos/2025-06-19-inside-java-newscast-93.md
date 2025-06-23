---
title: "Java 25 Encodes PEM - Inside Java Newscast #93"
tags: [core-libs, java-25]
date: 2025-06-19
slug: inside-java-newscast-93
videoSlug: inside-java-newscast-93
description: "Java 25 previews an API that transforms PEM (Privacy-Enhanced Mail) texts into cryptographic objects like public or private keys, certificates, and certification lists and vice versa."
featuredImage: inside-java-newscast-93
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna take a closer look at an API that has its first preview in Java 25: encoding and decoding PEM texts.
What's a PEM, why is this important, and how do you use that API?
We'll get to all that.
Ready?
Then let's dive right in!

<!-- logo -->

## PEM Texts

PEM is specified by RFC 7468.
It's a textual representation of cryptographic objects like private and public keys, certificates, and certificate revocation lists.
You've very likely already used PEM texts, for example when you uploaded SSH or PGP keys to GitHub or artifact repositories.
They have a header and footer that each start with five dashes, the word "BEGIN" or "END", respectively, a textual description of what's being encoded, for example "PUBLIC KEY", followed by another five dashes.
The text's body is the cryptographic object's Base64-encoded binary representation.

```
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj
0DAQcDQgAEi/kRGOL7wCPTN4KJ
2ppeSt5UYB6ucPjjuKDtFTXbgu
OIFDdZ65O/8HTUqS/sVzRF+dg7
H3/tkQ/36KdtuADbwQ==
-----END PUBLIC KEY-----
```

PEM is short for _Privacy Enhanced Mail_ but as you can tell by where you've seen them, the format has left that context behind long ago.
Nowadays it's used by a wide range of services:

* development platforms like GitHub
* certificate authorities
* cryptographic libraries such as OpenSSL
* security-sensitive applications such as OpenSSH
* hardware authentication devices such as YubiKeys
* and, most importantly, in your applications to send and receive cryptographic objects via user interfaces, over the network, to and from storage devices, etc.

So, clearly, a general-purpose, batteries-included development platform like Java should allow encoding and decoding cryptographic objects as PEM texts.
And it does that already today but the process is manual and a bit tricky and the Java Cryptographic Extensions Survey in April 2022 confirmed the lack of an easy-to-use API as a pain point.
So OpenJDK set out to fix this and previews an API in Java 25 that promises just that.
Let's take a closer look.

## PEM API Basics

As I just mentioned, Java already provides the building blocks for PEM en- and decoding and the most fundamental one of these is the various cryptographic objects' abilities to convert themselves to and from binary data in the DER format, which make up the PEM texts' bodies.
Unfortunately, these capabilities are strewn around various unrelated types like `KeyPair` and `X509Certificate` without a uniform way to access them.

```java
KeyPair kp = // ...
byte[] encodedPublic =
	kp.getPublic().getEncoded();
byte[] encodedPrivate =
	kp.getPrivate().getEncoded();

X509Certificate cert = // ...
// throws CertificateEncodingException:
byte[] encodedCert = cert.getEncoded();
```

There's a wide range of design options that can bridge this gap and [JDK Enhancement Proposal 470](https://openjdk.org/jeps/470), which introduces this API, goes over a list of alternative designs and their shortcomings that I recommend diving into if this topic is near and dear to you.
Here, I'll skip them and focus on the chosen solution:

* an empty, sealed interface that all DER-encoding-capable types extend - aptly named `DEREncodable`
* the classes `PEMEncoder` and `PEMDecoder` that transform `DEREncodable` instances to PEM texts and vice versa

The encoder and decoder classes are immutable, reusable, and thread-safe and the basic use of this API is very straightforward:

* create an encoder or a decoder with the respective static factory method `of()`
* call `PEMEncoder::encode` or `encodeToString` with a `DEREncodable` instance to get a PEM text as either an ISO-8859-1 byte array or as a string
* and then call `decode` with a PEM text as string or ISO-8859-1-encoded input stream to get a `DEREncodable` instance back

```java
X509Certificate cert = // ...

PEMEncoder pe = PEMEncoder.of();
String pem = pe.encodeToString(cert);

PEMDecoder pd = PEMDecoder.of();
DEREncodable cert2 = pd.decode(pem);
```

There are of course a few details to consider that we'll go over now.

## `DEREncodable` and `PEMRecord`

First, what types are actually `DEREncodable`?
I could read out the list but that quickly turns into word salad, so you'll unfortunately have to stop making lunch, or folding laundry, or whatever else you're doing while watching Inside Java Newscasts, and glance at the screen for a moment to satisfy your curiosity.

* `AsymmetricKey` (with subtypes for private/public keys for DH, DSA, EC, RSA, etc.)
* `KeyPair`
* `PKCS8EncodedKeySpec`
* `X509EncodedKeySpec`
* `EncryptedPrivateKeyInfo`
* `X509Certificate`
* `X509CRL`
* `PEMRecord`

And while I have you here: I'm curious - what _do_ you do while watching?

The last class on that list, `PEMRecord`, is new.
It captures the PEM texts of cryptographic objects that the JDK doesn't have a type for, such as PKCS#10 certification requests, thus enabling you to process them, as well.
`PEMRecord` is indeed a record with three components:

* `String type` - the header text, like "PRIVATE KEY" for example
* `String content` - the Base64-encoded PEM body
* `byte[] leadingData` - that's any content preceding the PEM header

A `decode` call will return a `PEMRecord` if there's no Java platform type to represent the cryptographic object or if you explicitly ask for this type - we'll see how in a few minutes.
You may want to do that because it's the only way to access the data that precedes the PEM header.

```java
String pkcs10Text = // ...
PEMDecoder pd = PEMDecoder.of();
DEREncodable pkcs10 = pd
	.decode(pkcs10Text);

if (pkcs10 instanceof
		PEMRecord pem) {
    var der = pem.content();
	var dt = pem.leadingData();
}
```

## Private Keys and Passwords

When handling private keys, you can encrypt and decrypt them by upgrading the encoder and decoder to new instances that use a password.
A `PEMEncoder` that uses a password can only encode private keys, whereas such a `PEMDecoder` can still decode unencrypted objects, too.
When encoding a private key, consider calling `encode` instead of `encodeToString` because `encode` returns a byte array and that gives you more control over its lifecycle.

```java
PrivateKey key = // ...
char[] password = // ...

PEMEncoder pe = PEMEncoder
	.of()
	.withEncryption(password);
byte[] pem = pe.encode(key);

PEMDecoder pd = PEMDecoder
	.of()
	.withEncryption(password);
DEREncodable key2 = pd.decode(
	new ByteArrayInputStream(pem));
```

If you want to encrypt with non-default parameters, algorithms, or encryption providers, you need to use an instance of `EncryptedPrivateKeyInfo`.
This class already existed before the PEM API and was extended to better interact with it.
The idea is to turn an instance of `PrivateKey` into an instance of `EncryptedPrivateKeyInfo` with additional information like password, algorithm, etc. and then encode that to a PEM text.
Decoding then starts with that text and returns an instance of `EncryptedPrivateKeyInfo` that can be turned back into a `PrivateKey` with the correct incantation.

```java
PrivateKey key = // ...

char[] password = // ...
String algo = // ...
AlgorithmParameterSpec params = // ...
Provider provider = // ...

EncryptedPrivateKeyInfo encryptedKey =
	EncryptedPrivateKeyInfo.encryptKey(
		key, password, algo, params, provider);

PEMEncoder pe = PEMEncoder
	.of()

byte[] pem = pe.encode(encryptedKey);

PEMDecoder pd = PEMDecoder.of();
DEREncodable encryptedKey2 = pd.decode(
	new ByteArrayInputStream(pem));
if (encryptedKey2
		instanceof EncryptedPrivateKeyInfo e) {
	PrivateKey key2 = e.getKey(password);
	// ...
}
```

You can also use a specific cryptographic provider for decoding by again upgrading the decoder to a new instance.

## Decoding to Specific Types

The `PEMDecoder`'s `decode` methods that accept a string or input stream return an instance of `DEREncodable`.
This is intended for the general case where you don't know what cryptographic object the PEM text represents, and you can resolve that with pattern matching:
Simply switch over the decoded instance, handle the types you expect, and error-handle the remaining ones.

```java
String pem = // ...

PEMDecoder pd = PEMDecoder.of();
DEREncodable decoded = pd.decode(pem);
/* {+} */
switch (decoded) {
	case PublicKey key -> // ...
	case KeyPair kp -> // ...
	case PEMRecord rec -> // ...
	default ->
		throw new IllegalArgumentException();
}
```

Alternatively, if you expect a specific subtype of `DEREncodable`, you can pass that type to an overload of `decode` and then get back such an instance - or an exception, of course, if the types don't line up.
This is also how you can explicitly request a cryptographic object to be decoded to a `PEMRecord` instance even if the JDK has a specific type for it.

```java
String pem = // ...

PEMDecoder pd = PEMDecoder.of();
PublicKey decodedKey = pd
	.decode(pem, PublicKey.class);
PEMRecord decodedPem = pd
	.decode(pem, PEMRecord.class);
```

As mentioned, this API is in preview in JDK 25.
Since we're now in Ramp-Down Phase 1 and 25 is in feature freeze, everything new is included in [the current early access builds](https://jdk.java.net/25/), so if PEM texts or any of the other improvements - [I went over all of them two weeks ago](/inside-java-newscast-92/) - are interesting to you, give them a try.
And if your experiments pop up something noteworthy, be sure to report it to the mailing list - each JEP lists the corresponding one up top in its header.

I'll see you again in two weeks.
So long...

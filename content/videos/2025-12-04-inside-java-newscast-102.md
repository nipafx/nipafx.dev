---
title: "All Features in Java 26 - Inside Java Newscast #102"
tags: [java-26]
date: 2025-12-04
slug: inside-java-newscast-102
videoSlug: inside-java-newscast-102
description: "Java 26 enters rampdown phase 1, which sets its feature set in stone:  HTTP/3 support, performance and AOT improvements, new command-line flags to manage final field mutation, and more"
featuredImage: inside-java-newscast-102
---

What are you doing here?
I said not to click.
Yeah, [JDK 26](https://jdk.java.net/26/) is entering dampdown phase 1 today and its feature set is frozen, but it's just HTTP/3, better G1 performance, and a new AOT feature.
Oh, and new command-line flags about `final`, changes to structured concurrency and stable values, sorry lazy constants, and...
Ok, I can finish this later.
Jeez!

<!-- logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna check out all the new features, removals, and updated previews in Java 26.
Ready?
Then let's dive right in!


## HTTP/3 Support

Starting with JDK 26, Java's `HttpClient` supports HTTP/3.
At the API level, this addition is tiny:
You can now pass the new `HttpClient.Version` enum value `HTTP_3` to the builder method `version` when building an HTTP client or request.
You then go on to use the built instances as you normally would and almost everything else happens beneath the surface.

```java
var client = HttpClient
	.newBuilder()
	.version(HttpClient.Version.HTTP_3)
	.build();

var request = HttpRequest
	.newBuilder(
		URI.create("https://openjdk.org/"))
	.version(HttpClient.Version.HTTP_3)
	.GET().build();

var response = client
	.send(request, BodyHandlers.ofString());
```

But unlike HTTP/1 and /2, /3 is based on UDP instead of TCP, which means you cannot easily upgrade an existing connection.
Consequently, there's no obvious version for the initial connection, which makes it a bit tricky for the API to determine what HTTP version to use.
[JDK Enhancement Proposal 517](517) explains the process in detail, so give that a read to understand its tradeoffs and how to configure it.


## Improved G1 Performance

In videos like this one, where I summarize all changes in a new Java release, I do my best to present each topic succinctly, so we're not here for 40 minutes, but with enough details that you get an idea of what's going on.
Only, some changes seem purpose-built to eliminate that middle ground and this is one of them.

Here's the short version:
[JDK Enhancement Proposal 522](522) improves the throughput of Java's default garbage collector G1 by reducing contention and synchronization over an essential data structure called the _card table_.
This leads to performance gains of anywhere between a few and up to 15%, depending on how heavily the application modifies object-reference fields.

The more detailed version needs to explain some garbage collection basics, how a regional garbage collector works, what a card table and write barriers are, and how the just-in-time compiler is involved and all that before even getting to JEP 522.

> Ain't nobody got time for that.

Exactly!
I mean, if you do, check out Inside Java Newscast #99, but everybody else, let's move on to the next feature.

<contentvideo slug="inside-java-newscast-99"></contentvideo>


## AOT Caching With Any GC

As of JDK 26, Project Leyden's ahead-of-time cache does _not_ contain any instances of your classes.
But it _does_ contain instances of JDK classes, most prominently of `Class` for classes that were loaded and linked during the training run and of anything they reference, such as strings and arrays.
So far, these instances were stored in a GC-specific format that allowed using the cache together with Serial GC, Parallel GC, and G1, but notably _not_ ZGC.
For compatible GCs, the cached objects were mapped directly into memory, which is really fast if the cache file was in the filesystem cache.

To make AOT caching compatible with ZGC, [JEP 516](516) introduces a GC-agnostic format for cached objects.
Now, this can _not_ simply be memory-mapped.
Instead, objects are streamed into memory by a background thread, so the GC can lay them out according to its rules.
This requires some CPU time but allows the startup process to continue, which can actually make the startup faster than memory-mapping a cache file that's not in the filesystem cache.
So besides GC-compatibility, there's also a performance tradeoff here.

You can select GC-specific vs agnostic format with `-XX:+/-AOTStreamableObjects` and the JEP also describes a heuristic for what format is chosen when and I strongly recommend to give it a read if you're interested in improving startup time.

And that's it for new final features.
Yes, three, I told you not to click!
Let's move on to removals and then previews.


## Applet API Removal

> It is kind of amusing to note that Java managed to succeed despite having gotten almost all the defaults wrong.
> Right?
> That references are nullable by default, that fields are mutable by default, that the default visibility is not private, that classes are extensible by default, right?
> So we got all the defaults wrong and yet, still, somehow, Java was a successful language and people still wanna program in it.

That was Brian Goetz in a conversation I had with him for Java's 25th birthday in 2020 - there's a [link to that segment](https://www.youtube.com/watch?v=ZyTH8uCziI4&t=2277s) in the description.
The gist of what Brian was saying is that Java's initial design was shaped by influences and ideas that were en vogue at the time, but as times change quite a few of those didn't age well.
But while it's easy to look back at them from the present and consider them mistakes, that's a myopic perspective.
Quite a few of those "mistakes" were integral parts of Java's early success and, without them, there might well be no Java around today.

One of those "successful mistakes" was serialization, but we're not talking about that today.
Another were Java applets - little Java programs that you would download alongside HTML in bytecode form, that the Java browser plugin would run on a local runtime, and that could interact with the rest of the page.
Basically the JavaScript of the late 90s.
By the way, in a cosmic coincidence JavaScript turns 30 _today_ - welcome to the old people club, JS.

As JavaScript won out, browsers dropped support for powerful plugins like applets and so they became essentially unused.
JDK 9 deprecated them and now, a mere nine years later, JDK 26 removes them.
It will be the first Java SE release without the `java.applet` package.
If you're one of the unlucky few to still be using it or are interested in a bit of Java history, check out [JEP 504](504) and [Phil Race's recent article](https://inside.java/2025/12/03/applet-removal/) on inside.java.

Oh, and JavaScript, applets didn't quite make it to their 31st birthday.
Just saying, in case you want to start putting your things in order.


## Reflective Mutation Of Final Fields

Another almost-original sin that Java is working on fixing is the non-finality of the keyword `final`:

```java
void main() throws Exception {
	var box = new Box("element");
	IO.println(box); // ~> "[element]"

	var elementField = Box.class
		.getDeclaredField("element");
	elementField.setAccessible(true);
	elementField.set(box, "new element");

	IO.println(box); // ~> "[new element]"
}

class Box {

	final String element;

	Box(String element) {
		this.element = element;
	}

	public String toString() {
		return "[" + element + "]";
	}

}
```

In a future release, reflective mutation of final fields will fail unless explicitly allowed with the command-line option `--enable-final-field-mutation`.
Now, in JDK 26, it's still possible but you'll get a warning.
That behavior can be managed with the temporary option `--illegal-final-field-mutation`:

* `allow` lets you mutate final fields
* so does `warn`, which is the default on 26, but you'll get one warning per mutating module
* `debug` is like `warn` but for every mutation and with more details
* and finally, `deny` simulates the future where such mutation leads to an exception

For more details, check out [JEP 500](500) or the last Inside Java Newscast and if you're maintaining a code base that mutates final fields through reflection and are wondering what your alternatives are, keep an eye on inside.java - I'm currently in the middle of writing a detailed guide for that specific scenario.

<contentvideo slug="inside-java-newscast-101"></contentvideo>


## Primitive Patterns

Primitive patterns allow us to check whether a primitive value can be losslessly represented by a different primitive type.
For example, can a given `long l` be an instance of `int`?
Yes, if it's in the range from -(2^31) to 2^31-1.
Can the same `long` be represented by a `double` or even a `float`?
Now it gets more complicated.

```java
long l = // ...

// is this the same number?
int i = (int) l;
double d = (double) l;
float f = (float) l;
```

But thanks to primitive patterns all of those are simple checks, whether with `instanceof` or in a `switch`, for example when deconstructing records.
Then you can ask whether that, `JsonNumberNode` for example, contains a number that fits into an `int`.

```java
// use primitive patterns to check
if (l instanceof float f)
	// use `f`

switch (jsonNode) {
	case JsonNumberNode(int n) -> // ...
	case ...
}
```

[JEP 530](530) previews primitive patterns for the fourth time, trying to get the edge cases just right that are bound to pop with something tricky like an 8-by-8 conversion matrix between types plus the ability to match on specific values.
As an example for what changes in JDK 26 consider switching over a byte and having a label `case short s` followed by `case 42`.
Since 42 can be expressed as a `short`, if the variable is indeed 42, `case short s` will apply - this label dominates `case 42`, which is effectively unreachable.

```java
byte x = 42;
switch (x) {
	case short s -> // ... | applies for x=42
	case 42 -> // ...      | unreachable ⛔
	// ...
}
```

JDK 26 assumes a dead label like this is a mistake and won't compile.
If you want to learn more about details, like "type-based unconditional exactness", give the JEP a read.

<contentvideo slug="inside-java-newscast-66"></contentvideo>


## PEM Texts

A common way to exchange keys or certificates, particularly when a squishy human is involved, is to use the text-based PEM format.

```
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj
0DAQcDQgAEi/kRGOL7wCPTN4KJ
2ppeSt5UYB6ucPjjuKDtFTXbgu
OIFDdZ65O/8HTUqS/sVzRF+dg7
H3/tkQ/36KdtuADbwQ==
-----END PUBLIC KEY-----
```

The JDK comes with all the building blocks to turn these texts into cryptographic objects and vice versa but that required a decent amount of custom code.
Starting in JDK 25, Java previewed an API that makes these transformation much easier:

First, you create a `PEMEncoder`, then call `encode` with an instance of the new interface `DEREncodable`, which types like `AsymmetricKey` and `X509Certificate` extend.
And then you can then store or send the resulting byte array or string.
On the other end, a `PEMDecoder` instance can decode from a string or input stream and return a `DEREncodable` instance that you can pattern match over.

```java
X509Certificate cert = // ...

var pe = PEMEncoder.of();
var pemString = pe.encodeToString(cert);

var pd = PEMDecoder.of();
DEREncodable crypto = pd.decode(pemString);
```

Alternatively, you can specify to `decode` what exact type you expect and then either get that back or an exception:

```java
X509Certificate cert2 = pd
	.decode(pemString, X509Certificate.class);
```

You can also encrypt these objects and configure an alternative cryptographic provider:

```java
PrivateKey key = // ...
char[] password = // ...

var pe = PEMEncoder
	.of()
	.withEncryption(password);
byte[] pem = pe.encode(key);

var pd = PEMDecoder
	.of()
	.withEncryption(password);
PrivateKey key2 = pd
	.decode(
		new ByteArrayInputStream(pem),
		PrivateKey.class
	);
```

In JDK 26, [JEP 524](524) previews the API for a second time with a few changes, most notably the added support for `KeyPair` and `PKCS8EncodedKeySpec`.

<contentvideo slug="inside-java-newscast-93"></contentvideo>


## Lazy Constants

Another API that sees its second preview in JDK 26 are stable values.
Or rather lazy constants because while the API's core functionality (to provide exactly-once lazy initialization with great run-time performance) remains, its surface sees major changes, all the way to its name.
So much moved around that I'll dedicate another Newscast to it, either in two weeks or next year - subscribe if you don't want to miss it.
If you can't wait that long, check out [JEP 526](526).


## Structured Concurrency

After the structured concurrency API saw a big revamp in JDK 25, 26 is refining that new version and sending it out for another preview with a few small changes, most of them to the `Joiner` interface:

* it can now implement `onTimeout` and thus do some cleanup and define what exception should be thrown in that case
* `allSuccessfulOrThrow()` now returns a list of results rather than a stream of subtasks
* `anySuccessfulResultOrThrow()` dropped "result" from its name and it's now just `anySuccessfulOrThrow()`

As with all preview language features and APIs, if you want them sooner rather than later, the best way to get them to finalize is to try them out in as close to a production environment as you can and give feedback on the respective mailing list with what worked well for you and what didn't.


## Vector API

And that's it for today on the Inside Java Newscast.
Have fun with Java 26, I'll see you again in two ...

> _door opens_

Yeah?

> Haven't you forgotten something?

No.

> But the Vector API...

I said "no!".
I have not forgotten that, I skipped it intentionally.

> But shouldn't you explain to your audience why

No, we're not doing [this](https://openjdk.org/jeps/529) - out.
Out!

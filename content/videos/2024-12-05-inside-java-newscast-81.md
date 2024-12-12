---
title: "Java 24 Language & API Changes - Inside Java Newscast #81"
tags: [java-24]
date: 2024-12-05
slug: inside-java-newscast-81
videoSlug: inside-java-newscast-81
description: "Java 24's feature list contains a whopping 24 JDK Enhancement Proposals. Here, we're going to look at the language and API changes."
featuredImage: inside-java-newscast-81-a
---

It's the time of the year again, where OpenJDK forks the next Java release off of the main development branch, thus freezing its feature development.
And it's high time it did that, because an unprecedented but fitting 24 JDK Enhancement Proposals have made it into the JDK 24 code base, way too many to cover in one Newscast.
How dare them not considering this YouTube show when picking JEPs?!

<!-- logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna go over the first half of the changes [JDK 24](https://openjdk.org/projects/jdk/24/) brings to Java.
Specifically, we're gonna look at language and API changes; next week it'll be performance improvements and deprecations/removals.
Ready?
Then let's dive right in!

* [JDK 24 Early-access builds](https://jdk.java.net/24/)


## Stream Gatherers

The [JEP 485](https://openjdk.org/jeps/485) is about adding a new feature to the Stream API called the Gatherer API.
It gives you three elements: an interface, a method on the `Stream` interface that takes a `Gatherer` as a parameter, and a factory class called `Gatherers`, with pre-made gatherers.
Imagine that you need to implement a `distinct()`-like behavior, but with your own way to compare object for equality.
Like comparing strings of characters, ignoring case differences.
You can map your strings to lower case, store them in a `HashSet` within your gatherer, and if they are not already in this `HashSet`, push the original element to the `downstream`.
A gatherer works on four elements: a mutable state, an integrator, a finisher, and a combiner.
They can be integrated in parallel streams, even if they do not themselves support parallelism.

* [Better Java Streams with Gatherers - JEP Cafe #23](https://www.youtube.com/watch?v=jqUhObgDd5Q)


## Class-File API

Another [API that got finalized in JDK 24](https://openjdk.org/jeps/484) is for reading and manipulating bytecode.
While few developers do that directly, most projects do it indirectly, and a lot.
Whether to analyze code and dependencies, inject aspects or performance counters, generate proxies or avoid reflection at runtime, there are plenty of ways to employ bytecode manipulation for the greater good.
The issue is that this requires libraries, like ASM, that understand Java's bytecode and since that can evolve from release to release, we end up in a situation where releases of those libraries don't work with JDK versions that were released later.
This is a big contributor to the need to upgrade dependencies when upgrading the JDK, which isn't the end of the world, but it's not great either.
By adding an API to read and manipulate bytecode to the JDK, all the use cases I just mentioned can code against that, which makes them much more robust against breakage from JDK upgrades.

With this API finalized in JDK 24, with a bunch of changes over its second preview in JDK 23, by the way, I recommend that all projects that work with bytecode develop a plan how to switch to this new API in the future to help their users more freely choose the JDK version they're running on.
That could be done by baselining against JDK 24 or later, a proposition that works particularly well for projects that adopted [a tip & tail release model](/inside-java-newscast-79), or by shipping [a multi-release JAR](/multi-release-jars-multiple-java-versions) that uses the new API on new JDKs.

* [New Class-File API will make Java Updates easier - Inside Java Newscast #56](/inside-java-newscast-56)


## Quantum Salad

JDK 24 includes three cryptographic JEPs and I'm not gonna stand here and pretend that I understand them very well.
Encryption is already complex enough and it doesn't help that two of those three JEPs ([JEP 496](https://openjdk.org/jeps/496) and [JEP 497](https://openjdk.org/jeps/497)) throw in quantum computing and some kind of modular salad.
lettuce lattice lettuce
Come January, Ana will go through these changes in a dedicated Inside Java Newscast - for this video, I'll stick to the high level.

To prepare for a future where quantum computers could break encryption algorithms like RSA and Diffie-Hellman, Java is adopting quantum-resistant alternatives.
These module-lattice-based algorithms were standardized by the US National Institute of Standards and Technology (NIST) and JDK 24 enables them for key encapsulation and digital signatures by making them available through the `KeyFactory`, `KeyPairGenerator`, `KEM`, and `Signature` APIs.
The new algorithm family is called _ML-KEM_ and _ML-DSA_, respectively, and using it follows the regular API flow.

```java
var kf_kem = KeyFactory.getInstance("ML-KEM");
var kf_dsa = KeyFactory.getInstance("ML-DSA");

var kp_kem = KeyPairGenerator.getInstance("ML-KEM");
var kp_dsa = KeyPairGenerator.getInstance("ML-DSA");

var kem = KEM.getInstance("ML-KEM");

var sig = Signature.getInstance("ML-DSA");
```

The two JEPs are final in JDK 24, which already brings us to the end of the list of finalized features for this episode.

You have a choice to make now:
You can keep watching for an update on all the language and API previews shipping with JDK 24 or you can subscribe for next week's Newscast, where I'll go over half a dozen performance-related features that JDK 24 comes with.
Sorry, what?
What's that?
Oh.
I'm just now being informed that you can also do both.
Crazy times.
Dogs and cats, living together!


## Key Derivation Function API

[The third cryptographic JEP](https://openjdk.org/jeps/478) first previews an API for key derivation functions; KDFs.
KDFs follow JDK 21's key encapsulation mechanism as a second step towards Hybrid Public Key Encryption, which enables the smooth transition to quantum-safe encryption algorithms.
KDFs, and let me read from the JEP here, ...

> make use of cryptographic inputs, such as initial key material, a salt value, and a pseudorandom function, to create new cryptographically strong key material.
> A KDF is often used to create cryptographic data from which multiple keys can be obtained.
> A KDF allows keys to be created in a manner that is both secure and reproducible by two parties sharing knowledge of the inputs.

The KDF API splits into two parts:

1. creating a KDF, initialized with specific parameters
2. deriving keys and data from those parameters as well as from provided key material and other optional inputs

```java
​// create a KDF object for the specified algorithm
var hkdf = KDF.getInstance("HKDF-SHA256");

SecretKey initialKeyMaterial = // ...
byte[] salt = // ...
byte[] info = // ...
// create an ExtractExpand parameter specification
var params = HKDFParameterSpec
		.ofExtract()
		.addIKM(initialKeyMaterial)
		.addSalt(salt)
		.thenExpand(info, 32);

// derive a 32-byte AES key
SecretKey key = hkdf.deriveKey("AES", params);
```

If you have any questions about this, please don't put them in the comments - I'm already way out of my depth here.
More details await you in Ana's Newscast in January.


## Structured Concurrency

Structured Concurrency is still in the same state as in the JDK 23.
The [JEP 499](https://openjdk.org/jeps/499) brings no change, to continue getting feedback on the current state of the API.
That being said, you can also check [the early access version of the Loom project](https://jdk.java.net/loom/), to get a glimpse at what could come, and also provide feedback on it.

In this early access version, you can create instances of the `StructuredTaskScope` class using an `of()` factory method, that can take a `Joiner` object as a parameter, or a `Config` object, to configure the virtual threads this `StructuredTaskScope` can create.
You can use the different implementations of the `Joiner` interface the API gives you, or implement your own.
Among other things, the scope object can give the results of the tasks you submitted in a stream.
You can produce your final result from that stream, or you can interrupt it if you're happy with what you already have, which is very handy.


## Scoped Values

The [JEP 487]( https://openjdk.org/jeps/487) is about `ScopedValues`, it is a preview feature, with no change compared with the JDK 23, to get more feedback from the community.
Scoped values may be seen as some kind of replacement for `ThreadLocal` variables, as they solve the same problem: being able to pass values to methods, without using their parameters.

A `ScopedValue` variable can be bound to a value.
This binding exists within the context of a method call.
That being said, scoped values can be shared between threads, as long as this thread has a period of execution that is bound to this method call.
This is the case for threads created by `StructuredTaskScope`, but not for threads created using `new`.
Because scoped value can be shared among threads, they should be non-modifiable.
But you can still rebind a given scoped value if this what you need.


## Vector API

[The vector API is still incubating](https://openjdk.org/jeps/489), still waiting for Valhalla, nothing changed, nothing to see, let's move on to language changes.


## Primitive Patterns

Since the introduction of type and record patterns, Java gained capabilities for reference types that aren't equally present for primitive types.
For example, having a `case int i` in a `switch` didn't use to compile and neither did an `instanceof int`.
It also wasn't possible to switch over `boolean`, `float`, `double`, or `long` values.
JDK 24 previews fixes for all of that.

```java
Object obj = // ...

switch (obj) {
	case Point p -> // ...
	// ✅
	case int i -> // ...
	// more cases
}

// ✅
if (obj instanceof int) {
	// ...
}

Boolean b = // ...
// ✅
switch (b) {
	case true -> // ...
	case false -> // ...
	case null -> // ...
}
```

While those fixes mostly just improve the uniformity of the language, I want to point out one specific addition that will significantly improve code that needs it and that's primitive conversion.
Say you have a `long l` and want to find out whether it fits into an `int` - you could do that with a range check or, with this preview feature, with an `l instanceof int i`.
Not quite a game changer, but now imagine you want to find out whether that `l` losslessly fits into a `float`.
Now it's suddenly no longer just a simple range check.
But `l instanceof float f`?
Still very simple.

```java
long l = // ...

// does `l` fit into `int`?
if (l instanceof int i) {
	// ... yes
}

// does `l` fit into `float`?
if (l instanceof float f) {
	// ... yes
}
```

These conversion checks also give meaning to a wider use of primitives in record patterns.
If your record has a `long` component and you write a record pattern, you had to use type `long` for that component.
With this change, you could, for example, use `int` and the pattern would only match if the number can be losslessly represented as an `int`.

```java
record Euro(long cents) { }

var amount = // ...
switch (amount) {
	// matches if `amount.cents()`
	// fits into `int`
	case Euro(int ct) -> // ...
	// matches remaining `Euro`s
	case Euro(long ct) -> // ...
}
```

[Primitive patterns are in their second preview](https://openjdk.org/jeps/488) and unchanged over their first preview in JDK 23.

* [Java 23: Restoring the Balance with Primitive Patterns - Inside Java Newscast #66](/inside-java-newscast-66)


## Flexible Constructor Bodies

This one is straightforward:
Constructor bodies can now contain a so-called _prologue_, code before an explicit call to another constructor with `this()` or `super()`.
This can be almost arbitrary code - the only exception is that it cannot use the instance under construction, except to initialize fields that do not have their own initializers.

Flexible constructor bodies allow for easier validation, preparation, and sharing of arguments before passing them to another constructor, which comes in particularly handy when chaining record constructors as all but the canonical one are forbidden from assigning fields themselves and _must_ forward to the canonical constructor.

```java
record Name(String first, String last) {

	// compact (canonical) constructor
	Name {
		// check `first` and `last`
	}

	// not all these constructors can exist
	// at the same time but that doesn't
	// matter for the examples

	Name(String last) {
		// validation before `this()`
		if (last.length() == 0)
			throw new // ...
		this("", last);
	}

	Name(String f, String m, String l) {
		// preparation before `this()`
		var fullFirst = f + " " + m;
		this(fullFirst, l);
	}

	Name(String full) {
		// sharing for `this()`
		var names = full.split(" ");
		this(names[0], names[1]);
	}

}
```

Somewhat surprisingly, this feature also became important for Project Valhalla and its exploration of null-restricted types, but no time to dwell on that here - Brian's recent Valhalla update has more details on that.

[Flexible constructor bodies are in their third preview]( https://openjdk.org/jeps/492) and are unchanged over the last one in JDK 23.

* [Java 22 Previews Statements Before `super(...)` and `this(...)` - Inside Java Newscast #62](/inside-java-newscast-62)

<contentvideo slug="jvmls-2024-valhalla"></contentvideo>

## Module Import Declarations

In most circumstances most Java developers prefer the precision and clarity of single-type imports but not only are there some devs who generally prefer star imports...
Some men just want to watch the world burn.
... there are also situations where star imports' downsides barely matter and their ease of use reigns supreme - experiments, demos, scripts, early learning are some of them.
Module imports are a smarter and more powerful mechanism to mass import types.
With an `import module $moduleName`, developers can import a module's full public API.
That's smarter because unlike a star import of a single package, this isn't just a slice of an API and its more powerful because it imports more.
And a source file that starts with, say, `import module java.sql` and `import module java.xml` couldn't communicate more clearly what the code is dealing with.

[Module imports are in their second preview](https://openjdk.org/jeps/494) with two small changes:

1. Modules can now `requires transitive java.base`, which apparently they couldn't before?
   (This feels like something I should know but didn't.)
   This allows _java.se_ to `requires transitive java.base`, which in turn means that an `import module java.se` will make the entire Java SE API available, which is super neat.
2. Star imports are now considered more specific than module imports, which means the former can shadow the latter.
   So if you import modules that have conflicting simple type names, like `java.util.List` from _java.base_ and `java.awt.List` from _java.desktop_, a star import like `import java.util.*` can specify which one you intend to import just like you could already do with a single-type `import java.util.List`.
   I would _not_ recommend mixing module and star imports like that, but nonetheless the hierarchy "module, star, single-type" (getting more specific) makes sense.

```java
import module java.base;
import module java.desktop;

// one of the following two imports is needed
// to disambiguate `List`; I strongly
// recommend the single-type import!
import java.util.*;
import java.util.List; // <~ do this!

void main() {
	var greet = List.of("Hello", "World");
	println(greet);
}
```

Speaking of recommendations, I see no reason not to generally prefer module imports over star imports.
In fact, I struggle to see _any_ reason to use star imports once this feature is standardized.

* [Module Imports in Java 23 - Inside Java Newscast #69](/inside-java-newscast-69)

## Simple Source Files and Instance Main Methods

Here's another feature that targets learners, scripters, explorers, and demo-ers (demonstrators?).
If you don't intend to write a larger program, the classic `public static void main(String[] args)` inside a whole class is a lot of overhead, syntactically but also just by how many concepts are referenced - classes, `static`, visibility, parameter lists, etc.
Why not get rid of that all and allow a simple `void main()`?
You can even omit the surrounding class and for such simple source files you get an `import module java.base` for free, so you can dive right in with collections, I/O, math, dates and times, and more.

```java
// OPTION #1 - THE WHOLE SHEBANG
import java.util.List;

class Hello {

	public static void main(String[] args) {
		var greet = List.of("Hello", "World", "!");
		System.out.println(greet);
	}

}
```

```java
// OPTION #2 - SIMPLIFIED MAIN METHOD
import java.util.List;

class Hello {

	void main() {
		var greet = List.of("Hello", "World", "!");
		System.out.println(greet);
	}

}
```

```java
// OPTION #3 - SIMPLE SOURCE FILE (WITHOUT CLASS)
void main() {
	var greet = List.of("Hello", "World", "!");
	println(greet);
}
```

[Simple source files and instance main methods are in their fourth preview](https://openjdk.org/jeps/495) and unchanged over the last one in JDK 23.

* [Script Java Easily in 21 and Beyond - Inside Java Newscast #49](/inside-java-newscast-49)


## Performance

JDK 24 also ships with a bunch of performance-related improvements:

* Project Leyden ships its first feature, namely ahead-of-time class loading and linking
* virtual threads now synchronize without pinning
* the garbage collectors Shenandoah and ZGC further embrace the generational hypothesis and G1 got a late barrier expansion
* we get experimental compact object headers
* full JDK runtime images can be a bit smaller

But more details on all of in the next Inside Java Newscast, next week.
I'll see you then, so long...

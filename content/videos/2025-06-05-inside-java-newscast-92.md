---
title: "Java 25 Brings 18 JEPs 😱 Inside Java Newscast #92"
tags: [java-25]
date: 2025-06-05
slug: inside-java-newscast-92
videoSlug: inside-java-newscast-92
description: "Java 25 will be released on September 16th. Its feature set has been frozen today and it is impressive: 11 finalized features in language, APIs and the runtime plus 7 that are brewing."
featuredImage: inside-java-newscast-92
---

JDK 25 is driving me mad!
Another release with so, so, so many additions!
I'll have to think about how, now that the feature set is frozen, I can stuff all of that into one episode.

<!-- logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna go over _everything_ that JDK 25 brings to Java - and it's a lot!
Here's how we're gonna fit all that into the time we have:
A bunch of the features come out of a series of previews that I've covered extensively in the past.
And I will keep coverage of them short, very short.
In fact, this short:

## Flexible Constructor Bodies

JDK 25 finalizes the addition of a so-called _prologue_ to constructor bodies before an explicit call to another constructor with `this()` or `super()`.
The code it contains can do whatever it wants except reference the instance under construction for anything but field assignments.
The prologue is great for easier validation, preparation, and sharing of arguments before passing them to another constructor, which comes in particularly handy when writing records as they _require_ constructor chaining.

```java
record Name(String first, String last) {

	// VALIDATION
	Name(String last) {
		if (last.length() == 0)
			throw new IllegalArgumentException();
		this("", last);
	}

	// PREPARATION
	Name(String f, String m, String l) {
		var fullFirst = f + " " + m;
		this(fullFirst, l);
	}

	// SHARING
	// yes, can't coexist with `Name(String last)`
	// it's just an example :)
	Name(String full) {
		var names = full.split(" ");
		this(names[0], names[1]);
	}

}
```

* [JEP 513: Flexible Constructor Bodies](https://openjdk.org/jeps/513)
* [Java 22 Previews Statements Before `super(...)` and `this(...)` - IInside Java Newscast #62](https://www.youtube.com/watch?v=cI-fY9YlmH4)


## Intro Part 2

Yeah, that was quick.
But I linked JDK enhancement proposals and deeper dive videos in the description that you can check out.
Or, if you don't want to trawl older videos, wait for the summer when we'll cover every final feature between Java 21 and 25 in a dedicated video series.
But for today, it's just JDK 25 - final and preview, first language, then APIs, then runtime, which has seen a surprising number of pretty cool, last-minute additions.
Ready?
Then let's dive right in!

## Module Import Declarations

With a simple `import module $moduleName` you get to import the full public API of the named module, which is superior to star imports because it fully imports a coherent API instead of just a random slice of it.
Whether they're preferable over the precision and clarity of single-type imports remains a matter of taste, but there are situation where that hardly matters: experiments, demos, scripts, early learning are some of them and here you should probably default to module imports.
This feature is final in JDK 25 without change.

* [JEP 511: Module Import Declarations](https://openjdk.org/jeps/511)
* [Module Imports in Java 23 - Inside Java Newscast #69](https://www.youtube.com/watch?v=WHknBEhzB0k)

## Compact Source Files and Instance Main Methods

This one's a bit of a mouthful: "compact source files and instance main methods".
Instance main methods allow the entry point to a program to be just `void main`, meaning neither public nor static nor needing arguments.
And compact source files contain a `main` method but no class declaration and they auto-import _java.base_, so collections, dates and times, file I/O, system interaction, etc. all are readily available.
And then there's the new class `IO`, which makes it simpler to write to and read from the terminal - and it is now backed by `System.out` and `in`, by the way.

```java
// FROM THIS
import java.util.List;

class Main {

	public static void main(String[] args) {
		System.out.println(List.of("Hello", "World"));
	}

}

// TO THIS
void main() {
	IO.println(List.of("Hello", "World"));
}
```

All this is is final in JDK 25 and that's great for beginners but also for the growing crowd of Java ponies like me who use it to write scripts.
In Java.
Java scripts, so to speak.

* [JEP 512: Compact Source Files and Instance Main Methods](https://openjdk.org/jeps/512)
* [Finalizing the Java On-ramp - Inside Java Newscast #90](https://www.youtube.com/watch?v=4WjXTe_FKO4)

## Primitive Patterns

This last language feature is still in preview in JDK 25 and unchanged over 24 - still looking for more feedback.
It's about adding primitive types to patterns, `instanceof`, and switch, which primarily files off a few weird edge cases the language would otherwise have but is also handy when doing primitive conversion or pattern matching over types that contain primitives or their wrappers.

```java
Object obj = // ...

switch (obj) {
	case Point p -> // ...
	// ✅ primitive pattern
	case int i -> // ...
	// more cases
}

// ✅ primitive pattern
if (obj instanceof float f) {
	// matches, e.g., `obj = 1L`
}

Boolean b = // ...
switch (b) {
	// ✅ primitive pattern
	case true -> // ...
	case false -> // ...
	case null -> // ...
}
```

For example, with a `switch(bool) case true case false case null` you can now kick that non-binary Boolean's butt!

* [JEP 507: Primitive Types in Patterns, instanceof, and switch (Third Preview)](https://openjdk.org/jeps/507)
* [Java 23: Restoring the Balance with Primitive Patterns - Inside Java Newscast #66](https://www.youtube.com/watch?v=_afECXGjfDI)

## Key Derivation Function

With language features covered, let's turn towards APIs.
_clearing throat_

> Key Derivation Functions (KDFs) make use of cryptographic inputs, such as initial key material, a salt value, and a pseudorandom function, to create new cryptographically strong key material.
> A KDF is often used to create cryptographic data from which multiple keys can be obtained.
> A KDF allows keys to be created in a manner that is both secure and reproducible by two parties sharing knowledge of the inputs.

After the key encapsulation mechanism in JDK 21, the KDF API, which is final in JDK 25, is the second in a series of steps Java takes towards supporting Hybrid Public Key Encryption, which enables the smooth transition to quantum-safe encryption algorithms.
This is of critical importance for the platform - already now, so that data intercepted and stored today can not be readily decrypted in a world with quantum computing.

```java
// create a KDF object for the specified algorithm
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

* [JEP 510: Key Derivation Function API](https://openjdk.org/jeps/510)
* [Java Resists Quantum Attacks - Inside Java Newscast #85](https://www.youtube.com/watch?v=4k23rwIdJas)

## Scoped Values

Scoped values have been in preview for four releases now and are finally final in JDK 25.
This API is about sharing immutable references to data with callees within a thread and within child threads in a way that is easier to use, more comprehensible, robust, and performant than thread-locals.
This comes at the expense of only passing data one way and within a predetermined scope, which is by far the most common use case.

```java
static final ScopedValue<Integer> ANSWER =
	ScopedValue.newInstance();

void main() {
	ScopedValue
		.where(ANSWER, 42)
		// prints "42"
		.run(() -> IO.println(ANSWER.get()));

	// ~> NoSuchElementException
	ANSWER.get();
}
```

If you stumbled over the term "child threads", let's talk about structured concurrency next.

* [JEP 506: Scoped Values](https://openjdk.org/jeps/506)
* [Scoped Values in Java 24 - Inside Java Newscast #86](https://www.youtube.com/watch?v=7tfUJLUbZiM)

## Structured Concurrency

The structured concurrency API rethinks how to organize concurrency.
It hinges on the idea that if a task splits into concurrent subtasks, the task should await their completion, and process their errors or results in the same scope.

```java
try (var scope = StructuredTaskScope.open()) {
	// fork subtasks
	var user = scope.fork(this::fetchUser);
	var order = scope.fork(this::fetchOrder);

	// wait for completion
	scope.join();

	// process results
	IO.println(user.get() + order.get());
} catch (Exception ex) {
	// process errors
}
```

This structure comes with a number of benefits:

1. clarity of code that always follows the same procedure:
   * set up the subtasks
   * wait for them to either complete or be cancelled
   * decide whether to succeed or fail
2. error handling with short-circuiting, where a failing subtask can cancel other, ongoing subtasks
3. cancellation propagation, where if a task gets canceled, so do all of its subtasks, potentially down a large tree of tasks
4. parent-child relationships between the thread running the task and those running the subtasks
5. observability, where a thread dump clearly displays this thread/task hierarchy

The API is in its fifth preview in JDK 25 and has seen a noticeable revamp over its earlier previews.
If you have the chance, give it a try and report your experience to the loom-dev mailing list.

* [JEP 505: Structured Concurrency (Fifth Preview)](https://openjdk.org/jeps/505)
* [Structured Concurrency Revamp in Java 25 - Inside Java Newscast #91](https://www.youtube.com/watch?v=vLJDPmXufQw)

## Stable Values

The stable values API offers lazy, exactly-once initialization that, at the same time, enables aggressive just-in-time performance optimizations.
This comes from close cooperation with the runtime where the reference to the instance, once it gets created, is truly final and can't even be changed through reflection - something that is also true for record fields but not for final fields in regular classes.

The API follows a functional approach where invocations of, for example, `StableValue::supplier` return a `Supplier` of the desired instance.
Similar methods exist that return lazily populated collections.

```java
​// STABLE VALUE :: SUPPLIER
private final Supplier<Answer> answer =
	StableValue.supplier(() -> new Answer(42));

Answer getAnswer() {
	// constant computed on
	// first `get` invocation
	return answer.get();
}

// STABLE VALUE :: LIST
private final List<Answer> answers =
	StableValue.list(42, Answer::new);

// list with indices 0-41
List<Answer> getAnswers() {
	// each constant is first computed on
	// `answer.get(index)` (or similar)
	return answer;
}
```

Stable values are new in JDK 25 and in their first preview.

* [JEP 502: Stable Values (Preview)](https://openjdk.org/jeps/502)
* [Stable Values in Java 25 - Inside Java Newscast #88](https://www.youtube.com/watch?v=H8ynXgMrP8M)

## PEM Encodings of Cryptographic Objects

I'm sure you've seen these textual representations of cryptographic keys that start with five dashes, then in all-caps "BEGIN PUBLIC KEY", for example, followed by another five dashes.
Then comes a Base64-encoded representation of the key before the whole thing ends similarly to how it started.

```
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD
QgAEi/kRGOL7wCPTN4KJ2ppeSt5UYB6u
cPjjuKDtFTXbguOIFDdZ65O/H8TUqS/s
VzRF+dg7H3/tkQ/K36dtuADbwQ==
-----END PUBLIC KEY-----
```

The most likely place where you handled them is when you uploaded SSH or PGP keys to GitHub or artifact repositories.
Those text blocks were originally standardized to exchange cryptographic objects via email and so the standard is called _Privacy Enhanced Mail_, or _PEM_ for short.

Starting as a preview in JDK 25, Java gets an API that can convert between PEMs and cryptographic objects that have standard representations in the binary formats PKCS#8 1.2 and 2.0 as well as X.509.
This includes private and public keys, certificates, and certificate revocation lists.

```java
public sealed interface DEREncodable permits
	// these types already exist;
	// they now implement `DEREncodable`
	AsymmetricKey, KeyPair,
	PKCS8EncodedKeySpec, X509EncodedKeySpec,
	EncryptedPrivateKeyInfo,
	X509Certificate, X509CRL,
	PEMRecord {
		// no methods
}

public final class PEMEncoder {

	public String encodeToString(DEREncodable so);

	// [... more API ...]

}

public final class PEMDecoder {

	public DEREncodable decode(String str);

	// [... more API ...]

}
```

* [JEP 470: PEM Encodings of Cryptographic Objects (Preview)](https://openjdk.org/jeps/470)


## Vector API

...

* [JEP 508: Vector API (Tenth Incubator)](https://openjdk.org/jeps/508)
* [Learn how to write fast Java code with the Vector API - JEP Café #18](https://www.youtube.com/watch?v=42My8Yfzwbg)


## Generational Shenandoah

Ok, let's talk about runtime improvements and we'll start with garbage collection.
Shenandoah gained an experimental generational mode in JDK 24 and after many stability and performance improvements, it's no longer experimental in 25 but considered production-ready.
It is _not_ the default mode of Shenandoah, though, and still needs to be enabled with `-XX:ShenandoahGCMode=generational`.
THis is in addition to `-XX:+UseShenandoahGC`, of course.
What you don't need anymore is `-XX:+UnlockExperimentalVMOptions`.

* [JEP 521: Generational Shenandoah](https://openjdk.org/jeps/521)

## AOT Method Profiling

Project Leyden pushes out its second launch time improvement, this one focused on warmup time - the time between the first useful unit of work and peak performance.
One thing the JVM does during that time is profiling methods to find out which are worth optimizing and how.
If that happens during the training run and the profiles are stored in the AOT cache, they can be loaded from there instead of being collected in production and the JIT compiler can generate native code immediately upon application startup.

In JDK 25, this happens automatically during the AOT workflow, doesn't add any new constraints nor require code changes, and just like class-loading and linking will also be overruled at runtime if it turns out that the cached information doesn't line up with reality.

* [JEP 515: Ahead-of-Time Method Profiling](https://openjdk.org/jeps/515)

## AOT Command-Line Ergonomics

So that new AOT optimization doesn't change the workflow, but this feature does.
The AOT command triad is:

1. observe a training run to create a cache configuration
2. create a cache from it
3. run the application with the cache

```bash
# training (⇝ profile)
$ java -XX:AOTMode=record
	-XX:AOTConfiguration=app.aotconf
	-cp app.jar com.example.App ...
# assembly (profile ⇝ AOTCache)
$ java -XX:AOTMode=create
	-XX:AOTConfiguration=app.aotconf
	-XX:AOTCache=app.aot
	-cp app.jar
# production (AOTCache ⇝ 🚀)
$ java -XX:AOTCache=app.aot
	-cp app.jar com.example.App ...
```

Starting in JDK 25, this workflow can be optionally shortened by combining the first two steps into one, so the result of the training run isn't a configuration, but the actual cache, ready to be used in production.

```bash
# training (⇝ AOTCache)
$ java -XX:AOTCacheOutput=app.aot
	-cp app.jar com.example.App ...
# production (AOTCache ⇝ 🚀)
$ java -XX:AOTCache=app.aot
	-cp app.jar com.example.App ...
```

This will cover all simple and many advanced cases but more complex configurations may still need to manually invoke all three steps.

* [JEP 514: Ahead-of-Time Command-Line Ergonomics](https://openjdk.org/jeps/514)

## Compact Object Headers

Every object on the heap has a so-called _header_ that the JVM uses to track certain information, for example for typing, locking, and garbage collection.
From the point of view of the application, the additional memory consumption is overhead and ideally would be zero, but that's not going to happen.
But compact object headers, which were introduced as an experimental feature in JDK 24, provide an alternative object header layout that reduces the overhead by a third to half, which reduces overall memory consumption by 10-20% in typical cases.

After thorough validation through extensive testing and production runs this feature is now considered production-ready.
On JDK 25, you can enable it with the flag `-XX:+UseCompactObjectHeaders`.
While this has a really good chance to reduce memory consumption and even CPU times (through denser memory layout and reduced pressure on garbage collection), this is not guaranteed to be the case, so observe your application carefully and verify that it actually helps.

* [JEP 519: Compact Object Headers](https://openjdk.org/jeps/519)
* [Save 10-20% Memory With Compact Headers - Inside Java Newscast #48](https://www.youtube.com/watch?v=r2G4ed2E4QY)

## JFR Method Timing & Tracing

To make it easier to time and trace invocations, be it to identify performance bottle necks in production, to optimize code, or to debug production issues, two new JDK Flight Recorder events are introduced: `jdk.MethodTiming` and `jdk.MethodTrace`.


```shell
# time the execution of all static initializers:
$ java '-XX:StartFlightRecording:method-timing=::<clinit>,filename=clinit.jfr' ...
$ jfr view method-timing clinit.jfr

                                 Method Timing

Timed Method                                           Invocations Average Time
------------------------------------------------------ ----------- ------------
sun.font.HBShaper.<clinit>()                                     1 32.500000 ms
java.awt.GraphicsEnvironment$LocalGE.<clinit>()                  1 32.400000 ms
java2d.DemoFonts.<clinit>()                                      1 21.200000 ms
java.nio.file.TempFileHelper.<clinit>()                          1 17.100000 ms
sun.security.util.SecurityProviderConstants.<clinit>()           1  9.860000 ms
java.awt.Component.<clinit>()                                    1  9.120000 ms
sun.font.SunFontManager.<clinit>()                               1  8.350000 ms
sun.java2d.SurfaceData.<clinit>()                                1  8.300000 ms
java.security.Security.<clinit>()                                1  8.020000 ms
sun.security.util.KnownOIDs.<clinit>()                           1  7.550000 ms
...
```

```shell
# profile `HashMap::resize` to determine what causes resizes:
$ java -XX:StartFlightRecording:jdk.MethodTrace#filter=java.util.HashMap::resize,filename=recording.jfr ...
$ jfr print --events jdk.MethodTrace --stack-depth 20 recording.jfr
jdk.MethodTrace {
    startTime = 00:39:26.379 (2025-03-05)
    duration = 0.00113 ms
    method = java.util.HashMap.resize()
    eventThread = "main" (javaThreadId = 3)
    stackTrace = [
      java.util.HashMap.putVal(int, Object, Object, boolean, boolean) line: 636
      java.util.HashMap.put(Object, Object) line: 619
      sun.awt.AppContext.put(Object, Object) line: 598
      sun.awt.AppContext.<init>(ThreadGroup) line: 240
      sun.awt.SunToolkit.createNewAppContext(ThreadGroup) line: 282
      sun.awt.AppContext.initMainAppContext() line: 260
      sun.awt.AppContext.getAppContext() line: 295
      sun.awt.SunToolkit.getSystemEventQueueImplPP() line: 1024
      sun.awt.SunToolkit.getSystemEventQueueImpl() line: 1019
      java.awt.Toolkit.getEventQueue() line: 1375
      java.awt.EventQueue.invokeLater(Runnable) line: 1257
      javax.swing.SwingUtilities.invokeLater(Runnable) line: 1415
      java2d.J2Ddemo.main(String[]) line: 674
    ]
}
```

They allow execution times and stack traces to be recorded for specific methods, which are selected on the command line, in configuration files, with `jcmd`, or JMX and, unlike sample-based profilers, they record complete and exact statistics.
But this can impose a larger CPU overhead than the 1% JFR generally aims for and should be used for a few methods at a time - for larger numbers, sampling-based approaches remain recommended.
Which brings us to our second JFR improvement.

* [JEP 520: JFR Method Timing & Tracing](https://openjdk.org/jeps/520)

## JFR Cooperative Sampling

When sampling data, it's essential to prevent selection biases.
If, for example, I'd ask all of you to post your favorite programming mascot's name in the comments, I couldn't really expect a representative outcome, now, could I?
So when JFR samples stack traces to create execution-time profiles, it's important to do that in regular intervals, but the issue is that the stack can only be reliably parsed in what's called a safepoint.
This essentially jiggles the sample points into these safepoints, which results in what's called _safepoint bias_, where a frequently executed span of code might not even show up in the profile because it doesn't contain a safepoint.

JFR currently works around this by parsing the stack in fixed intervals with an unreliable heuristic and hoping that this works out often enough to lead to good results.
Starting in JDK 25, JFR combines the best of both worlds by emitting sample requests in regular intervals that are then reliably reconstructed to full stack traces at the next safepoint.

* [JEP 518: JFR Cooperative Sampling](https://openjdk.org/jeps/518)

## JFR CPU-Time Profiling

Editing Nicolai here, bringing you a feature that was targeted to JDK 25 just an hour ago at time of recording this: JFR CPU-time profiling.
Based on a kernel signal that is emitted at fixed intervals of _CPU time_, JFR can now create CPU-time profiles for Java programs.
They differ from the more common real-time profiles in that they do not include the time spent waiting for memory, the file system, network I/O, etc.
Neither of these profiles is strictly better than the other - real-time profiles are most helpful to reduce latency whereas CPU-time profiles are crucial to identifying CPU-intense methods, which can limit throughput.

For now, this feature only works on the best of operating systems and is experimental.
Check JEP 509 for details, give it a try, and let the folks on the hotspot-jfr-dev mailing list know about your experience.

* [JEP 509: JFR CPU-Time Profiling (Experimental)](https://openjdk.org/jeps/509)

## 32-bit x86 Removal

And finally, bad news for everyone who's using 32-bit x86 hardware, although that's not gonna be a lot of you, if any.
That port of the JDK was removed entirely in JDK 25, which means that new features like virtual threads, FFM, or the vector API no longer need to implement 32bit fallbacks, which was a major opportunity cost.
It also simplifies the JDK's build and test infrastructure.

* [JEP 503: Remove the 32-bit x86 Port](https://openjdk.org/jeps/503)

For more details, check the JEP that I linked in the description, which I did for all of these features, by the way, or wait for an upcoming episode of the Inside Java Podcast, where I discuss this and other deprecations and removals with the one and only Dr. Deprecator.

Until then, be sure to check out the JDK 25 EA builds, and I'll see you again in two weeks.
So long...

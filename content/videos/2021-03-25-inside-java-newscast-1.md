---
title: "Java 16 Rundown, First Of Java 17 - Inside Java Newscast #1"
tags: [java-16, java-17]
date: 2021-03-25
slug: inside-java-newscast-1
videoSlug: inside-java-newscast-1
description: "Java 16 got released, so I go over most of the additions like records, Stream APIs, Unix Domain Socket support, and much more. Then there's a first glimpse at Java 17."
featuredImage: inside-java-newscast-1
---

## Intro

Hi everyone,

I'm nipafx (but you can call me Nicolai) and today it's gonna be you, me, and the first episode of the Inside Java Newscast.
Here we cover recent developments in the JDK, drawing from JDK Enhancement Proposals, design documents, the mailing list, and the occasional chicken bone.

Today we're covering the recent weeks up to today, March 23rd 2021, and we have two larger topics:

* the release of Java 16 and
* the first few proposals aimed at Java 17

We'll go all the way from language features to API and tooling to deprecations, ports, performance, and security.

For the parts on Java 17 and the upcoming JEPs, keep in mind that we're discussing _proposals_, so none of this is decided and everything can still change.
And please take a look at the relevant links in the description before making up your mind on any of these.

With that out of the way, let's dive right in!

## Java 16

_[... snip this part - [my Java 16 guide][NFX] gives a more exhaustive overview with more examples ...]_

[NFX]: java-16-guide

<!--
The biggest news is of course the release of Java 16 last week.
No way can I explain all the features in detail - let alone the myriad of bug fixes - but I can give you a brief intro to most of the additions with lots of links in the description, so you can follow up on what you find most interesting.
Here we go, Java 16!

[JPC]: https://inside.java/2021/03/16/podcast-015/

### 1

Let's start with language features.
Records are data-centric types that don't need encapsulation.
You declare so-called components (in parenthesis behind the class name) and the compiler will create a final field and accessor for each as well as a constructor, `equals`, `hashCode`, and `toString` methods that use all components.
If you don't want to change any of the default behaviors, you can get away with a complete record definition that fits into one line.

[R1]: https://openjdk.java.net/jeps/395
[R2]: https://www.infoq.com/articles/java-14-feature-spotlight/
[R3]: https://inside.java/2021/03/12/simpler-serilization-with-records/

### 2

With type pattern matching you can check whether a variable is of a certain type and, if so, create a new variable of that type, so you can use it without casting.
All you need to do is append the new variable's name after a regular `instanceof` check.

[PM1]: https://openjdk.java.net/jeps/394
[PM2]: https://www.infoq.com/articles/java-14-feature-spotlight/
[PM3]: https://nipafx.dev/java-type-pattern-matching

### 3

Sealed classes, which are in their second preview in Java 16, give you a fine-grained way to manage inheritance between Java's default free-for-all and the very restrictive `final` keyword (leaving out shenanigans with package-visible constructors).
When declaring a sealed class or interface, you must list all the types that can directly extend it - the compiler will then make sure no other type does the same.

[SC1]: https://openjdk.java.net/jeps/397
[SC2]: https://www.infoq.com/articles/java-sealed-classes/

### 4

We're coming to API additions.
The stream API was extended with two new methods:
`mapMulti` is essentially a more imperative `flatMap` for very specific situations.
`toList` can replace the more verbose `collect(toList())` (and potentially be faster) wherever you can live with the stream's results ending up in a list that's `null`-tolerant and shallowly immutable (or unmodifiable).

[API]: https://javaalmanac.io/jdk/16/apidiff/15/
[S1]: https://nipafx.dev/java-16-stream-mapmulti
[S2]: https://bugs.openjdk.java.net/browse/JDK-8180352
[S3]: https://marxsoftware.blogspot.com/2020/12/jdk16-stream-to-list.html

### 5

The HTTP/2 API also gets two additions:
If you have an `HttpRequest` and want to create a similar one, you can now clone it to a new builder with an overload for `HttpRequest::newBuilder`.
If you have several `BodyPublisher`s whose output you want to concatenate, `BodyPublishers::concat` is there for you.

[H1]: https://bugs.openjdk.java.net/browse/JDK-8252304
[H2]: https://bugs.openjdk.java.net/browse/JDK-8252382

### 6

The `ServerSocketChannel` and `SocketChannel` classes can now use Unix domain sockets, which are faster and safer than the TCP/IP stack yet limited to connections on the same host.
This works on Linux, Mac, and - despite their name - Windows 10 and Windows Server 2019.

[U1]: https://openjdk.java.net/jeps/380
[U2]: https://www.morling.dev/blog/talking-to-postgres-through-java-16-unix-domain-socket-channels/
[U3]: java-unix-domain-sockets

### 7

.. is a three-for-one because that's how many APIs Project Panama currently has in incubation:

* the foreign-memory access API lets you operate on, well, foreign memory, meaning native, persistent, and managed heap memory
* the foreign linker API builds on that and wants to replace JNI with a better, pure Java variant
* the vector API unlocks SIMD programming in Java with vector computations that reliably compile at runtime to optimal vector hardware instructions on supported CPU architectures

[FM1]: https://openjdk.java.net/jeps/393
[FM2]: https://inside.java/2020/12/11/podcast-009/
[FM3]: https://inside.java/2021/01/25/memory-access-pulling-all-the-threads/

[FL1]: https://openjdk.java.net/jeps/389
[FL2]: https://inside.java/2020/12/21/podcast-010/
[FL3]: https://blog.arkey.fr/2021/02/20/a-practical-look-at-jep-389-in-jdk16-with-libsodium/

[V1]: https://openjdk.java.net/jeps/338
[V2]: https://inside.java/2020/11/17/podcast-007/
[V3]: https://www.morling.dev/blog/fizzbuzz-simd-style/

### 8

Switching to tooling, it is now possible to stream JDK Flight Recorder events over JMX.
A remote streaming connection from the server (which runs the app) to the client (which runs the JFR tool) writes the same kind of file as an app on the client would, so existing JFR tools, which operate on this kind of files, require little change.

Speaking of JFR, the profiling and diagnostics tool JDK Mission Control uses it extensively and its newest version 8 was released in February.

[JFR1]: https://bugs.openjdk.java.net/browse/JDK-8253898
[JFR2]: https://www.morling.dev/blog/rest-api-monitoring-with-custom-jdk-flight-recorder-events/
[JMC]: https://github.com/openjdk/jmc

### 9

jpackage came out of incubation.
With it, you can create platform-specific packages that can then be installed as is common for each OS, for example with a package manager on Linux systems or double-clicking on Windows.
As for packaging formats, it supports deb and rpm on Linux, pkg and dmg on macOS, and msi and exe on Windows.

[JP1]: https://openjdk.java.net/jeps/392
[JP2]: https://www.infoq.com/news/2019/03/jep-343-jpackage/
[JP3]: https://inside.java/2021/02/11/podcast-012/

### 10

Then there's performance.
As with each Java version, 16 ships with a lot of performance-related work.
Hotspot, Parallel GC, G1, ZGC, Shenandoah - they all got better.
If you're in the cloud, more performance equals fewer costs - if nothing else, maybe this convinces your CTO to let you get past 11.

[PERF]: https://nipafx.dev/java-16-guide/#performance

### 11

As with performance, security improves as well.
From cryptographic algorithms like SHA-3 and new certificate authorities to improved JAR signing, there's a number of additions.
Removals are always part of the security story as well and so root certificates with 1024-bit keys have been removed and TLS 1.0 and 1.1 are now disabled by default.

[SEC]: https://seanjmullan.org/blog/2021/03/18/jdk16

### 12

This is a quick one, there are two new ports.
The JDK codebase now supports Windows on ARM64 as well as Alpine Linux.

[WARM]: https://openjdk.java.net/jeps/388

### 13

.. and last but not least, there are two new important deprecations/limitations:
First, primitive wrapper constructors are deprecated for removal and synchronizing on such instances yields warnings.
Second, the module system now strongly encapsulates internals for code on the class path, i.e. `--illegal-access=deny` becomes the default.
That means without further configuration, the module system will no longer allow code from the class path to access internal JDK APIs.
Keep in mind that this does not impact the use of the infamous `sun.misc.Unsafe` because, for the time being, it is actually exported by a module called _jdk.unsupported_.

And that's most of Java 16, one of the larger recent releases.
Records are of course the big star, but I gotta say, I really like the first step towards pattern matching and `Stream::toList` - a very welcome and seemingly straightforward addition with a surprisingly tricky history.
Do you have a favorite feature?
Let me know in the comments.

[DEPR]: https://openjdk.java.net/jeps/390
[ENC]: https://openjdk.java.net/jeps/396
-->


## Java 17

With Java 16 out the door, what's next?
Java 17 of course!
Two JDK Enhancement Proposals are already targeted for the upcoming release in September and there's a fair chance that a third one will be soon.
Let's go over the list.

### Another Port

Following the Windows ARM64 port in Java 16, [JEP 391] proposes to make JDK 17 run on macOS on ARM64.

[JEP 391]: https://openjdk.java.net/jeps/391

### Applets For Removal

After all browser vendors dropped support for Java plugins (or are at least planning to) and Java 9 deprecated the Applet API, the next step is to mark it for removal.
This is done by [JEP 398] and means the API can be removed in any Java version after 17.

[JEP 398]: https://openjdk.java.net/jeps/398

### Sealed Classes

Then there's [a draft JEP][SC3] that aims to finalize sealed classes in Java 17.
While it's not formally targeted at the upcoming version yet, it says it "proposes to finalize Sealed Classes in JDK 17" - we'll follow that closely in the coming months.

[SC3]: https://openjdk.java.net/jeps/8260514

## Outro

Wow, I just threw a lot of references at you.
With Java 16 just out and a number of new JEPs proposed in its aftermath, that's somewhat unavoidable, but not what this show is all about.
When I see you again in two weeks, there's probably a bit less going on, so we can take some time to look at a few things in more detail.
If there's something specific you'd like to get more insight on, let me know in the comments and I'll see what I can do.

And that's it for today on Inside Java Newscast.
I'll see you again in two weeks.

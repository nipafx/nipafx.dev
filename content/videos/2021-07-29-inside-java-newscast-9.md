---
title: "Random Numbers and JDK Flight Recorder - Inside Java Newscast #9"
tags: [java-16, java-17, random, performance, tools]
date: 2021-07-29
slug: inside-java-newscast-9
videoSlug: inside-java-newscast-9
description: "The new API for random number generation in Java 17 - why it needed to change and how the new API os more usable, extensible, and robust - and how to get started with JDK Flight Recorder, particularly on Java 16."
featuredImage: inside-java-newscast-9
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle and today, I got two topics for you:

1. random number generation - why the status quo had to change and how Java 17 makes the API more usable, extensible, and robust
2. JDK Flight Recorder - how to get started, what to look out for on Java 16, and where to get more information

Ready?
Then let's dive right in!


## Random (Number) Generators

### Status Quo

Java's API around random numbers is a bit muddied.
First and foremost, there's [the class `Random`][random], which has a solid API.
Then there are its subclasses `SecureRandom`, which is slower but a cryptographically strong random number generator, and `ThreadLocalRandom`, which is faster than `Random`, but not thread-safe.

Then, off to the side, [we have `SplittableRandom`][splittable], which is also not thread-safe, but has a method `split` that returns a new `SplittableRandom` that you can pass to a task in a newly spawned thread - this works great for fork/join-style computations.
The streams of random numbers `SplittableRandom` returns employ this functionality when used as a parallel stream.

But have you ever tried replacing `Random` with `SplittableRandom`?
They're unrelated, so it can be a bit cumbersome.
Then there are some methods, like the one where you pass an upper bound for the next number, that you can find on some of the classes but not others.
Apparently, these classes aren't doing great under the hood either with a few identical pieces of code in several classes and because there's no overarching interface, third parties can't easily provide drop-in replacements for these classes.
But all of this is about to change.

[random]: https://docs.oracle.com/en/java/javase/16/docs/api/java.base/java/util/Random.html
[splittable]: https://docs.oracle.com/en/java/javase/16/docs/api/java.base/java/util/SplittableRandom.html

### `RandomGenerator` And Other New Interfaces

Because thanks to the work done as part of [Java Enhancement Proposal 356][jep-356], Java 17 ships with a new and better [random generator API][random-api].
At its core is [the new interface `RandomGenerator`][random-generator] with an API that's basically that of `Random` plus a few methods it was missing - like the ones with the upper bound I mentioned earlier.
Its implementations are not required to be thread-safe or cryptographically secure.

The four preexisting classes we just discussed were all refactored to share more of their code and make future RNGs easier to implement.
They were also expanded to provide the full API of `RandomGenerator`, which they now implement.
All of this while being 100% backwards compatible of course.

Then there are five additional interfaces that extend `RandomGenerator`.
Their differentiating factor is how you can use one such generator to create another one that is statistically independent and individually uniform (or some approximation thereof), so you can pass them off to a new thread.

`StreamableGenerator` can return a stream of random generators.
This is helpful because if a generator can create a set of new generators all at once, it can make a special effort to ensure that they're statistically independent.
How can a generator create another generator?
That depends on the underlying algorithm.

Some can return a new generator by jumping forward a number of draws - depending on who many, they implement `JumpableGenerator`, `LeapableGenerator`, or `ArbitrarilyJumpableGenerator`.
Then we have `SplittableGenerator`, which prescribes the behavior I described earlier for `SplittableRandom`, meaning a generator that can split itself into two.

As mentioned before, all four existing classes extend the top-level interface `RandomGenerator`.
Furthermore, `SplittableRandom` also implements `SplittableGenerator`.
That means you can either keep using the existing classes or migrate towards the new interface to make it easier to exchange implementations.
Similarly to `List` vs `ArrayList` and `LinkedList`.

No new public classes were added, though, so how do you get an instance of, say, `LeapableGenerator`?

[jep-356]: https://openjdk.java.net/jeps/356
[random-api]: https://download.java.net/java/early_access/jdk17/docs/api/java.base/java/util/random/package-summary.html
[random-generator]: https://download.java.net/java/early_access/jdk17/docs/api/java.base/java/util/random/RandomGenerator.html

### Algorithm Selection

First of all, a few new algorithms have been implemented and more will likely come in the future.
I know next to nothing about this complicated field, though, so I'm not gonna speak to any specific algorithm.
Instead, I assume you know what you're looking for and will tell you how to get it.
Deal?

Generally speaking, all the new interfaces have a static `of` method that takes an algorithm name as a `String` argument.
If an algorithm of that name is implemented and adheres to the interface `of` is called on, it will return an instance of it.
Otherwise it throws an `IllegalArgumentException`.

```java
String algorithmName = "...";

RandomGenerator.of(algorithmName);
StreamableGenerator.of(algorithmName);
JumpableGenerator.of(algorithmName);
LeapableGenerator.of(algorithmName);
ArbitrarilyJumpableGenerator.of(algorithmName);
SplittableGenerator.of(algorithmName);
```

So to create a `LeapableGenerator`, you can call `LeapableGenerator.of("Xoshiro256PlusPlus")`.
Obviously.

The Javadoc contains a list of algorithms that all JDK implementations must contain, but any specific JDK may add more.
Due to advances in random number generator algorithm development and analysis, this list isn't set in stone, though.
Algorithms can be deprecated at any time and can be removed in major JDK versions.

So picking algorithms by name may not be the best way to write robust code.
If you don't have any specific requirements, you can call `RandomGenerator.getDefault()` to get an arbitrary algorithm.

```java
RandomGenerator generator = RandomGenerator.getDefault();
```

If you need more control, you can use the new class `RandomGeneratorFactory`.
It also has a static `of(name)` method, which returns a factory for a specific algorithm, but that doesn't help with writing more robust code.
For that you can call the static method `all`, which will return a stream of factories, one per algorithm.
The cool thing about that is that you can query factories for properties of the algorithm.
Is it jumpable, leapable, or splittable?
But also how many state bits it has, whether it uses a hardware device, or what its equidistribution is.
You can then filter by your specific requirements, find any factory that fulfills them, and use it to create a `RandomGenerator`.

```java
RandomGenerator generator = RandomGeneratorFactory.all()
	.filter(RandomGeneratorFactory::isJumpable)
	.filter(factory -> factory.stateBits() > 128)
	.findAny()
	.map(RandomGeneratorFactory::create)
//  if you need a `JumpableGenerator`:
//  .map(JumpableGenerator.class::cast)
	.orElseThrow();
```

Beyond the JDK, third parties can also implement random number generators.
The interface `RandomGenerator` is registered as a service, so any JAR can provide their own implementations of it.
By using the annotation `@RandomGeneratorProperties`, the information that I mentioned before - state bits, equidistribution, etc. - can be attached to it.
The JDK classes will then pick up these implementations and on the use site, they integrate perfectly with the mechanisms I described - be it the static factory `of` methods or the more robust `RandomGeneratorFactory` approach.

### Conclusion

So, in summary:

* a new hierarchy of interfaces makes it easier to identify key properties of an algorithm and to switch between implementations
* the four existing random number classes got refactored, slightly extended, and now implement those interfaces while their behavior stays as is
* new algorithms have been and will be implemented as internal classes
* factories can be used to robustly pick algorithms that fulfill specific requirements

And now, I'll hand you over to my colleague Billy who will give you a quick intro to the JDK Flight Recorder.


## JDK Flight Recorder

Thank you Nicolai.
Hey java developers, running into a difficult to debug production issue?
Frustrating performance issue?
Or just want to get a detailed understanding of how your application is performing in production?
All the above?
We have all been there at one point or another in our careers.

Well for these occasions JDK Flight recorder might be the tool for you!
JDK Flight Recorder, JFR, previously known as Java Flight Recorder before being open sourced as part of JDK 11, is a JVM tool for performing diagnostics and profiling of Java applications and the JVM.

### Using JFR

A key characteristic of JFR is it has very low overhead, often less than 1%.
Though this can vary depending upon system and how JFR is configured.
This means JFR can be used in production, even under heavy load, without meaningfully impacting performance.
Allowing you to use JFR to find those hard to detect performance issues or bugs that only seem to show up in production.
If you have a running Java application, you can actually try out a JFR right now, no really!

From your command line run `jcmd -l`.
You will get back a list of Java processes running on your system.
You can see an example of what this looks like right here.
You can take the pid of the java process you want to observe and then run `jcmd <pid> JFR.start` and JFR will start recording events across the entire stack, from the OS layer, to the JVM, to the Java application itself, giving you a good picture of what's happening.

The events are initially recorded to an in-memory buffer, which is part of how JFR is able to keep it's performance impact minimal.
To pull information from the buffer, it we again use JCommand With `jcmd <pid> JFR.dump`.
This will dump the data currently in the JFR buffer to the directory the java process is running from.

So what do we do with a JFR recording once we have it?

### Reading A JFR File

For lighter analysis of a JFR file, there is [the `jfr` command](https://docs.oracle.com/en/java/javase/16/docs/specs/man/jfr.html).
If you already have a concrete idea of what you are looking for, the `jfr` command can be a great way to quickly analyze a JFR file.
However for most analysis you will need a tool like [JDK Mission Control (JMC)](https://www.oracle.com/java/technologies/jdk-mission-control.html).

Opening our recording in mission control, we are given an overall report about performance, and then on the left side of the screen are several tabs for digging down into what is happening in the application and the JVM.
Threads, I/O, Garbage Collection, Class Loading, Method Profiling, and more can be analyzed.

If you look under memory, you might notice it looking a bit empty.
If you are using JDK 16, that is because of [a change](https://www.oracle.com/java/technologies/javase/16-all-relnotes.html#JDK-8257602) introduced in the latest version of Java.

### Missing Memory Allocation Reporting

With JDK 16, a new JFR event was added, `jdk.ObjectAllocationSample`, which allows low-overhead memory allocation profiling.
JMC 8.1 when released, will support rendering this event, but until then if we want to see memory allocation in JMC, we will need to update our JFC files.
This is good, as this will give us an opportunity to look at how to configure JFR.

### Configuring JFR

The JFC files are located under `<java_home>/lib/jfr` directory.
In this directory there are two provided JFC files, default, and profile.
Previously the events `jdk.ObjectAllocationInNewTLAB`, and `jdk.ObjectAllocationOutsideTLAB` have been used to track memory allocation, bBut have been disabled by default, both in the default and profile settings because they have somewhat high overhead.
By setting enabled to true for both of these, we can track memory allocations.

Old:

```xml
<event name="jdk.ObjectAllocationInNewTLAB">
	<setting name="enabled">false</setting>
	<setting name="stackTrace">true</setting>
</event>
<event name="jdk.ObjectAllocationOutsideTLAB">
	<setting name="enabled">false</setting>
	<setting name="stackTrace">true</setting>
</event>
```

New:

```xml
<event name="jdk.ObjectAllocationInNewTLAB">
	<setting name="enabled">true</setting>
	<setting name="stackTrace">true</setting>
</event>
<event name="jdk.ObjectAllocationOutsideTLAB">
	<setting name="enabled">true</setting>
	<setting name="stackTrace">true</setting>
</event>
```

Additional JFC files can be defined, and there is a lot of options for configuration, but that's beyond the scope of this segment.
For these to take affect, we will have to restart our Java application.
After doing so, and going through the earlier JCommand steps, we can check see that a more detailed memory allocation is provided.

So far when starting JFR with `jcmd`, we simply have simply done `JFR.start`.
However we are able to [pass in several values](https://docs.oracle.com/javase/8/docs/technotes/guides/troubleshoot/tooldescr006.html) that can modify JFR's behavior, which you can see over the right side of the screen.
There are a few key ones, filename, for providing a file path and name thats more descriptive than the generated one; settings, as expected default are the default settings used; we could also use profile, or the name of the file for any other JFC file we create.
`Maxsize` limits the size of the buffer JFR will write, the default is 250 MB, which is likely larger than needed in most cases

### Summary (And Graal)

For GraalVM users, JFR support was recently announced and is available in GraalVM 21.2.
A [link to a blog post on RedHat developer](https://developers.redhat.com/articles/2021/07/23/jdk-flight-recorder-support-graalvm-native-image-journey-so-far#) is in the description that covers this announcement.

We only scratched the sure of JFR today, there's a whole lot more to cover, we provided some links to some great talks in the description ([1](https://www.youtube.com/watch?v=xrdLLx6YoDM), [2](https://www.youtube.com/watch?v=Z6KbZ5OCRSA)), and this may be a topic we return in the future on this channel-
Until then this is Billy Korando with the Inside Java newscast, Nicolai back to you in the studio.


## Outro

Hah, that's pretty good advice.
Oh sorry, I was just watching one of Billy's one-minute videos on Twitter.
Because we don't have enough coffee-based puns yet, he calls them Sip of Java but that aside, they're really good.
He has one on switch expressions, on collection factories, `String` join APIs and look, there's one on JFR as well!
Go follow @BillyKorando on Twitter to get these nuggets of Java insights.

And that's it for today on the Inside Java Newscast.
If you have any questions about what we covered in this episode, ask ahead in the comments below and if you enjoy this kind of content, help us spread the word with a like or by sharing this video with your friends and colleagues.
I'll see you again in two weeks.
So long...

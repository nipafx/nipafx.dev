---
title: "Java's Plans for 2023 - Inside Java Newscast #40"
tags: [project-amber, project-galahad, project-leyden, project-lilliput, project-loom, project-panama, project-valhalla]
date: 2023-01-19
slug: inside-java-newscast-40
videoSlug: inside-java-newscast-40
description: "A summary of what happened in 2022 and what will probably happen in 2023 for Projects Amber, Galahad & Leyden, Lilliput, Loom, Panama, and Valhalla"
featuredImage: inside-java-newscast-40
---

## Intro

Happy new year, -everyone-, and welcome to -the first Inside Java Newscast- in 2023.
I'm Nicolai Parlog, -Java developer advocate at Oracle- and today -we're gonna take a look ahead at-

No, stop!
What's going on here?!
Why am I here twice?

-Valhalla, Panama, Loom, and Amber - what they're about, where they are right now, and what their plans are for 2022 and beyond-

Oh, I get it now.
I did this before!
Right, last January, [we looked at those four projects][ijn#18] in quite some detail for 2022.
That's good, it means I can skip the introductions and just update you for 2023.
And in the time that saves, we can talk about projects Lilliput, Leyden, and Galahad.

Keep in mind that, as always when discussing anything that's not yet finalized, everything may still change, and some of what will keep the JDK developers busy this year is far from finalization.
Sometimes it's just an ongoing conversation without even a specific proposal having been made.
Ok?
Then let's dive right in!

[ijn#18]: https://www.youtube.com/watch?v=4Y3LijiBxRA


## Project Loom

Let's start with the star of 2022: [Project Loom][loom]!
It released virtual threads as a preview feature and structured concurrency as an incubating API in Java 19.
For Java 20 it merged [scoped values][jep-429], an incubating API to provide functionality that's similar to thread-local variables, but much more scalable with virtual threads.
Learn all about it in [Jose's excellent JEP Cafe on the matter][jep-cafe-16].

The main effort for 2023 will be in finalizing these features.
My personal guess is that at least for virtual threads we have a decent chance that will happen by JDK 21 - the rest, I'd put in 2024 the earliest.

Another area of work is making virtual threads less clingy to the carrier/platform/operating system threads executing them.
[As you know][ijn-23], virtual threads' scalability comes from their readiness to yield the carrier thread while waiting, so they don't hog an expensive resource when they're not using it.
But in the current preview in JDKs 19 and 20, there are three limitations to that:

* native frames on the stack
* synchronization
* file system access

All of them pin the virtual thread to the carrier thread, thus limiting scalability.
As far as I understand, nothing can be done about native stack frames.
The other two _can_ be tackled, though, and we can hope to see some progress on that in 2023.
For file system access, the keyword is _io_uring_ - Linux' asynchronous I/O interface.
When Java adopts that, virtual threads can yield while waiting for file I/O.

[loom]: https://wiki.openjdk.org/display/loom/Main
[jep-429]: https://openjdk.org/jeps/429
[jep-cafe-16]: https://www.youtube.com/watch?v=fjvGzBFmyhM
[ijn-23]: https://www.youtube.com/watch?v=6dpHdo-UnCg


## Projects Galahad and Leyden

As [announced at JavaOne][ijn#36], Oracle plans to contribute the GraalVM just-in-time compiler and Native Image to OpenJDK.

For the integration of the just-in-time compiler as an alternative to the existing JIT compiler of the HotSpot VM, the creation of a new Project Galahad [was proposed][galahad-mail] by Douglas Simon in December 2022.
The first goal is to move development of Graal's JIT into the OpenJDK community.
Once it matches or outperforms HotSpot's JIT on a selection of important metrics like memory footprint, warmup time, and compilation speed, it can be integrated into the JDK main-line repository, so it becomes an alternative to HotSpot's JIT.

Note that HotSpot's JIT is written in C++ whereas Graal's is written in Java and comes as bytecode.
Just-in-time compiling itself to optimized machine code is possible but interferes with application performance, so the next step for Galahad would be to bring in the necessary ahead-of-time compilation technology to make this new JIT compiler available instantly on JVM start and avoid any interference.
And here, the line to Project Leyden becomes a bit blurry.

[Leyden] has the goal to address the long-term pain points of Java's slow startup time, slow time to peak performance, and large footprint.
It picked up a bit of steam last year and in October project lead Mark Reinhold published [a very interesting white paper][shift-constrain].
I'll go into that and Leyden's approach in detail in a future episode - subscribe if you don't want to miss that.
For now, suffice it to say that while it plans to achieve its ultimate goal with static images like the ones Graal's AOT compiler can create, this will likely be the last step on a path from unconstrained, dynamic Java to a full closed-world constraint that allows for these static images.

So both of these projects are glancing at AOT in the distance and will tackle it from different angles in due time.
But they're still pretty young, so don't expect anything major in 2023 or probably even 2024.
But if you're interested in these topics, make sure to follow their mailing lists!
Although Galahad doesn't have one yet - [Leyden's][leyden-dev] is linked below.

[galahad-mail]: https://mail.openjdk.org/pipermail/discuss/2022-December/006164.html
[ijn#36]: https://www.youtube.com/watch?v=3M5o3hUH09A
[leyden]: https://openjdk.org/projects/leyden/
[shift-constrain]: https://openjdk.org/projects/leyden/notes/02-shift-and-constrain
[leyden-dev]: https://mail.openjdk.org/mailman/listinfo/leyden-dev


## Project Panama

[Project Panama][panama]'s vector API is extremely stable at this point - so much so that there weren't _any_ changes in JDK 20, so not even a JDK Enhancement Proposal was filed for it.
Still, it will stay incubating until Project Valhalla starts delivering features - more on that in a few minutes - because those allow significant improvements to the API.

Panama's second prong are its foreign memory and function APIs.
They went from incubating to preview in JDK 19 and there have been [a few small changes in JDK 20][jep-434], namely the removal of the class `MemoryAddress` in favor of `MemorySegment` and the split of `MemorySession` into `Arena` and `SegmentScope`.

For future work, let me quote from [a mail][state-of-panama] that project lead Maurizio Cimadamore sent to the Panama mailing list:

> [I]t's fair to say that more time (and feedback) is required to understand if lifetime management in the FFM API has reached its lowest energy state (which might, in turn, affect our chances to finalize the FFM API in 21).
> This is perhaps not surprising:
> one of the main challenges of the FFM API is that to bring timely *and* safe deallocation [to] a programming language that is built around the idea of *implicit* deallocation, managed by a garbage collector.
> As such, we should make sure we get this absolutely right.

And on jextract he wrote:

> [P]ossible areas of improvement [...] include adding first class support for capturing errno [...], improving the mapping for C structs, and investigate ways to reduce the static footprint of the jextract generated code

There are also additions to the linker API on the horizon, like possibly allowing Java code to pass heap segments directly to native calls.
They may be worked on in 2023 but won't be delivered before the FFM API is finalized.

[panama]: https://openjdk.org/projects/panama/
[jep-434]: https://openjdk.org/jeps/434
[state-of-panama]: https://mail.openjdk.org/pipermail/panama-dev/2022-December/018182.html

## Project Lilliput

I gave an intro to [Project Lilliput][lilliput] before - [check it out here][ijn#25].
The gist is that it tries to reduce the size of the object header in Hotspot from 128 or 96 bits to 32 bits.
This would free up 10-20% of your heap!
Not bad.

In May of 2022, Lilliput achieved its first milestone and reduced header size [to 64 bits][jep-64-bits].
And in December it published [a fork of jdk17u with those changes][lilliput-fork].
I don't think they released an early-access build but building your own JDK isn't even that complicated - there's [a link to the guide][build-jdk] in the description.

For 2023, project lead Roman Kennke sees a good chance [to achieve the 32 bit goal][kennke-32].
That would be very, very cool!
If you can't wait that long, check out [JOL] - or J. O. L.? - Java Object Layout, a toolbox to analyze object layouts in JVMs.
Aleksey Shipilëv recently [extended it][aleksey-jol] to simulate Lilliput's current state and its goal.
You can feed JOL a heapdump and get an estimate of Lilliput's effect on your project.

[lilliput]: https://wiki.openjdk.org/display/lilliput
[ijn#25]: https://www.youtube.com/watch?v=KuHhUDhIFYs&t=482s
[jep-64-bits]: https://openjdk.org/jeps/8294992
[lilliput-fork]: https://github.com/openjdk/lilliput-jdk17u
[build-jdk]: https://openjdk.org/groups/build/doc/building.html
[kennke-32]: https://twitter.com/rkennke/status/1611280231490281472
[jol]: https://github.com/openjdk/jol
[aleksey-jol]: https://twitter.com/shipilev/status/1615095410569232384


## Project Valhalla

Hm, [Project Valhalla][valhalla]... what can I say here.
It seems every time we check how far it's along, it's still as far from the finish line as the last time we checked.
It seems like nothing much is happening.

That's not the case, though.
In 2022, its proposals were consolidated and fleshed out and in November it published [an early access build][valhalla-ea] based on JDK 20 that presents a huge portion of its features.
This improved the understanding of the current proposal and, as it turns out, lead to the team not being very satisfied with primitive types as they are proposed by [JEP 401][jep-401].
They're working through alternative approaches in the language to surface the same functionality, which means changes to that JEP are probably coming.
Then we'll see where that leaves us for getting things delivered.

I know this can be frustrating.
Valhalla promises a revolution to the type system, a much more uniform and expressive language, as well as a considerable performance boost and all that while keeping billions of lines of existing Java code running as before.
You know, said like that, I kinda understand why it's taking so long.

[valhalla]: https://openjdk.org/projects/valhalla/
[valhalla-ea]: https://jdk.java.net/valhalla/
[jep-401]: https://openjdk.org/jeps/401


## Project Amber

As if to make up for Valhalla, the other project Brian Goetz leads - [Project Amber][amber] - can't stop producing ideas and features!
In 2022, it first previewed record patterns and progressed on pattern matching for switch and personally I see a good chance for both of them to be finalized in 2023.
As for the many ideas

(a) they are all very young with often indeterminate futures and
(b) I don't have the time to explain all of them anyway,

so I will just quickly enumerate them from most concrete to most pie in the sky - by my personal guesses:

* [string templates][jep-430] would make embedding expressions like variables or method calls in strings both more comfortable and more secure
```java
String property = "last_name";
String value = "Doe";

Statement query = SQL."""
	SELECT * FROM Person p
	WHERE p.\{property} = '\{value}'
	""";
```

* the single underscore may become the [unnamed pattern or variable][unnamed], marking variables that you need to assign for syntactic reasons but don't intend to use
```java
Optional<User> user = findUser();
user.ifPresent(_ -> System.out.println("Found!"));

record Address(String street, String city) { }
Object something = // ...
if (something instanceof Address(_, var city)) {
	// ...
}
```

* primitive types may become [legal in patterns][primitives]
```java
int i = ...;
switch (i) {
	case byte b -> /* use `b` */;
	case float f -> /* use `f` */;
	default -> /* ... */;
}
```

* it may [become possible][super-mail] to execute statements [before `super()` calls][super-jbs] in constructors
```java
public SuperUser(
		String firstName, String lastName,
		String street, String city,
		Permissions permissions) {
	Name name = createName(firstName, lastName);
	Address address = createAddress(street, city);
	super(name, address);

	this.permissions = permissions;
}
```

* _imperative destructuring_ is when you apply a destructuring pattern like record patterns on variable declaration and [it's coming][imp-destr]
```java
record Pair<L, R>(L left, R right) { }
public Pair<String, String> find2Strings() {
	/*...*/
}

// take return value apart into two
// newly-declared variables
Pair(var s1, var s2) = find2Strings();
```

* launching a Java program may become considerably simpler - also known as [paving the on-ramp][on-ramp]
```java
void main() {
	println("Hello, World!");
}
```

* we haven't heard about "[withers]" in a while but they're still on the road map and with record patterns out in preview I hope to hear more about this soon
```java
record User(String name, String address) { }
User user = getMeSomeUser();

// made up syntax
User newUser = user with {
	name = "John Doe";
}
```

At this point, I'm such an Amber fanboy, I want a jersey and one of those big foam hands to cheer it along!

[amber]: https://openjdk.org/projects/amber/
[jep-430]: https://openjdk.org/jeps/430
[unnamed]: https://openjdk.org/jeps/8294349
[primitives]: https://bugs.openjdk.org/browse/JDK-8288476
[super-mail]: https://mail.openjdk.org/pipermail/amber-dev/2022-October/007537.html
[super-jbs]: https://bugs.openjdk.org/browse/JDK-8194743
[imp-destr]: https://twitter.com/BrianGoetz/status/1599000138793771010
[on-ramp]: https://openjdk.org/projects/amber/design-notes/on-ramp
[withers]: https://github.com/openjdk/amber-docs/blob/master/eg-drafts/reconstruction-records-and-classes.md

## Outro

And that's it for today on the Inside Java Newscast.
If you enjoyed this episode, don't waste your time liking or subscribing - instead head over to inside.java right now.
It aggregates all the important news in a very timely manner and little of what I link in the description wasn't linked there before.
Take a look around and subscribe to the RSS feed.

I'll see you again in two weeks!
So long...

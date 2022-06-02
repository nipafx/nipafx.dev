---
title: "All About JDK 18 - Inside Java Newscast #21"
tags: [java-18, project-amber, project-panama, pattern-matching, tools, reflection, documentation]
date: 2022-03-10
slug: inside-java-newscast-21
videoSlug: inside-java-newscast-21
description: "Refinements in pattern matching and Panama's foreign and vector APIs; a new command `jwebserver` and a new IP address resolution SPI; preparing code for UTF-8 becoming the default character set and for the eventual removal of finalization; and a few more bits and pieces."
featuredImage: inside-java-newscast-21
---

## A Few Words

What's happening in Ukraine right now is terrible and saddening.
But I'm proud that on behalf of its 150,000 employees around the world and in support of both the elected government of Ukraine and for the people of Ukraine, Oracle suspended all operations in the Russian Federation, while our operations in Ukraine are active, and we are doing everything we can to support our Ukrainian customers.

I'm not personally involved in those efforts and, like most of us, can do little to support Ukrainians.
One thing we can do is donate to NGOs with feet on the ground, like Save The Children Ukraine or Red Cross for Ukraine, that can use that money to directly help people in need.
If you're living in Europe, particularly Eastern Europe, you may also be able to help with in-kind donations or even volunteer work to help refugees who are arriving in your town.
If you're in a position to help in those or other ways, it would mean the world to me.

You can also elevate the voices of those under fire.
My dear colleague Denis Makogon lives in Kharkiv and was there until a few days ago.
Our team's hearts and minds are with him and others who suffer because of unimaginable aggression and it's terrifying to read what he occasionally tweets.
Reading, feeling, and sharing his experiences would also mean a lot to us.
I'm leaving a link to his Twitter below.

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle and today we're gonna go all in on JDK 18, which will be released on March 22nd.

We'll talk about further refinements in pattern matching and Panama's foreign and vector APIs, the new `jwebserver` and IP address resolution SPI, how to prepare your code for UTF-8 becoming the default character set and for the eventual removal of finalization, and a few more bits and pieces.
We'll obviously not be able to go into full detail on all that, so as usual, I'll leave plenty of links in the description, primarily to the related JDK Enhancement Proposals, but also to previous Newscasts and other interesting sources.

You ready?
Then let's dive right in!


## Pattern Matching for `switch`

Project Amber's push for pattern matching in Java is one of several thrilling developments that are happening right now.
Thanks to the six-month release cadence, we've already seen a bunch of related features, like type patterns and switch expressions, and JDK 18 is taking the next step.
After pattern matching for `switch` was introduced as a preview in JDK 17, two details were changed for [a second preview in JDK 18][JEP 420]:

* constant case labels must now appear before guarded patterns of the same type
	```java
	Object obj = // ...
	switch(obj) {
		// special cases
		case -1, 1 -> // ...
		// positive integer cases
		case Integer i && i > 0 -> // ...
		// all the remaining integers
		case Integer i -> // ...
		// all the remaining cases
		default -> // ...
	}
	```
* exhaustiveness checking is now more precise when sealed classes and generics mix
	```java
	sealed interface I<T> permits A, B {}
	final class A<X> implements I<String> {}
	final class B<Y> implements I<Y> {}

	static int answer(I<Integer> i) {
		// exhaustive as no A case possible!
		return switch (i) {
			case B<Integer> bi -> 42;
		}
	}
	```

Ironing out all the details of this proposal isn't trivial, though, and Brian Goetz already announced on the Amber spec mailing list that [there will be more changes and a third preview][goetz].

If you want to see what you can achieve with pattern matching in practice, check out [Jose's Wordle Checker][cafe#10] - the part on pattern-matching has its own chapter.

[JEP 420]: https://openjdk.java.net/jeps/420
[goetz]: https://mail.openjdk.java.net/pipermail/amber-spec-experts/2022-February/003240.html
[cafe#10]: https://www.youtube.com/watch?v=5--tDQIMqhY


## Vector API

The vector API sees [its third incubation][JEP 417] in JDK 18.
One of these days, I'll get around to giving you a short intro here but if you can't wait until then, I strongly recommend [Paul Sandoz' presentation on this topic][sandoz].
In 18, support for the ARM Scalar Vector Extension (SVE) has been added and performance of vector operations that accept masks has been improved on architectures that support masking in hardware.
As I explained in [the Newscast on Java's plans for 2022][ijn#18], the vector API will probably keep incubating until Valhalla goes into preview because it needs primitive types.

[JEP 417]: https://openjdk.java.net/jeps/417
[sandoz]: https://www.youtube.com/watch?v=1JeoNr6-pZw
[ijn#18]: https://www.youtube.com/watch?v=4Y3LijiBxRA


## Foreign Function & Memory API

Another big ticket item, also from Project Panama, is the foreign function and memory API.
It's being developed to replace the Java Native Interface to make it easier to integrate non-JVM libraries in your Java code bases.
There are a number of projects out there, from Netty and Lucene to OpenGL and OpenSSL, that were already tested on it and just the other day there was a Reddit post that reported on [replacing JNI with Panama in the SQLite JDBC driver][sqlite].

There are [a few changes of the API in JDK 18][JEP 419]:

* support for more carriers in memory access var handles
* a simpler API to obtain downcall method handles
* a simpler API to manage temporal dependencies between resource scopes
* a more general dereference API
	```java
	MemorySegment segment = ...
	// before
	int i = MemoryAccess
		.getIntAtOffset(segment, 100);
	// after
	int i = segment
		.get(ValueLayout.JAVA_INT, 100);
	```
* a new API to copy Java arrays to and from memory segments
	```java
	MemorySegment segment = // ...
	int[] array = // ...
	// before
	segment.asSlice(dstStart, len)
		.copyFrom(MemorySegment
			.ofArray(array)
			.asSlice(srcStart, len));
	// after
	MemorySegment.copy(
		array, srcStart, segment,
		ValueLayout.JAVA_INT, len);
	```

The Panama team is confident that after two years of incubation, this API is ready to take the next step and move into its final packages for [its first preview in JDK 19][JEP 424].

[JEP 419]: https://openjdk.java.net/jeps/419
[JEP 424]: https://openjdk.java.net/jeps/424
[sqlite]: https://www.reddit.com/r/java/comments/t93pc2/replacing_jni_with_panama_in_the_sqlite_jdbc/


## Simple Web Server

Need an HTTP server to quickly host some static files?
Maybe to demonstrate, experiment, or test something?
JDK 18 is there for you!
It ships with a web server that you can start with the new command line tool `jwebserver`.

It only serves HEAD and GET requests and has no support for authentication, access control, encryption, etc.
It's super simple on purpose - all you can configure is:

* the address and port to bind to (by default it's localhost:8000)
* which directory to host (by default it's the current directory)
* the log level

And that's it.

There's also an API to customize the server.
Like `jwebserver`, it is based on the web server implementation in the `com.sun.net.httpserver` package.
With it, you can do a few more advanced things, like [host the contents of a ZIP file][boes].

For more on the simple web server, check out [Inside Java Newscast #16][ijn#16], [JEP 408], or [Julia Boes' article on inside.java][boes].
(There's also [an Inside Java Podcast][ijp#22]!)

[JEP 408]: https://openjdk.java.net/jeps/408
[boes]: https://inside.java/2021/12/06/working-with-the-simple-web-server/
[ijn#16]: https://www.youtube.com/watch?v=IsCEzP-inkU
[ijp#22]: https://inside.java/2022/03/04/podcast-022/


## Internet-Address Resolution SPI

I'll keep this one short and just read a few sentences straight from [JEP 418]:

> Define a service-provider interface (SPI) for host name and address resolution, so that `java.net.InetAddress` can make use of resolvers other than the platform's built-in resolver.
>
> The API currently [meaning, before 18] uses the operating system's native resolver, which is typically configured to use a combination of a local `hosts` file and the Domain Name System (DNS).
> Motivations for defining a service-provider interface for name and address resolution include Project Loom, emerging network protocols, customization, and testing.

The built-in resolver is the default, so out of the box, the runtime's behavior stays the same.

We'll go into a bit more detail on this in the next episode.
But, you might miss that one.
I mean, I know you're busy and all...
If only there was a way for you to get videos from this channel into your timeline, maybe even get a little reminder when it goes live.

[JEP 418]: https://openjdk.java.net/jeps/418


## Deprecating Finalization for Removal

Finalization was Java's first shot at resource management.
It allows us to implement the `finalize` method for classes whose instances might need to relieve resources like file handles.
The garbage collector will then at some point call this method, so it can do its clean-up.

In [Newscast #15][ijn#15] I went into details on finalization's flaws, their consequences, and what happens next.
Which is its deprecation for eventual removal, which happened in JDK 18 - the deprecation, not the removal.
But you can, and I strongly recommend you do, already foreshadow the removal by running your project with the command-line option `--finalization=disabled`.
To learn more, watch said Newscast or give [JEP 421] a read.

[JEP 421]: https://openjdk.java.net/jeps/421
[ijn#15]: https://www.youtube.com/watch?v=eDgBnjOid-g


## UTF-8 by Default

11110000 10011111 10010101 10001010

What's that?
Well, if you interpret it as a bit pattern that encodes a string in UTF-8, it's the peace dove "🕊️".
Whereas if you think it's Windows-1252 encoded, it's whatever "ðŸ•Š" could be.
As you can see (and probably already know), encoding matters, particularly for a language that's big on "write once, run anywhere".

That's why Java APIs that deal with reading and writing files usually have overloads that let you specify a file's encoding.
But you don't _have to_ specify one, in which case Java usually uses the so-called default charset.
This default used to be chosen based upon the operating system, the user's locale, and other factors.
In JDK 18, this default will always be UTF-8, so Java programs are more predictable and portable when relying on the default.

For most projects, this change will go unnoticed.
Those that embrace portability by passing charset arguments as well as those setting the system property `file.encoding` to UTF-8 will see no impact at all.
Those who do neither but target MacOS or Linux are most likely already using UTF-8 because it's usually the default on these operating systems.
This mostly leaves programs that target Windows and implicitly rely on its non-Unicode-encoding at risk.

The best way to fix any issues is to either switch to UTF-8-encoded files or always pass a character set to the relevant APIs.
When that isn't possible or desirable, take a look at [JEP 400] for how to use the new `file.encoding` value `COMPAT`, the new system property `native.encoding`, and the compiler's `-encoding` flag to tackle problems.
If you're not switching to JDK 18 any time soon, the best way to prepare is to set `file.encoding` to `UTF-8` now and shake out any issues over the coming weeks and months.

Besides JEP 400, there's also [a great article by Naoto Sato on this topic][sato] - linked below of course.

[JEP 400]: https://openjdk.java.net/jeps/400
[sato]: https://inside.java/2021/10/04/the-default-charset-jep400/


## Reflection via Method Handles

Up until JDK 18, there were three JDK-internal mechanisms for reflective operations:

* VM native methods
* dynamically generated bytecode stubs and Unsafe
* method handles

Every new language feature, for example records or the upcoming primitive objects, required updates to all three.
[JEP 416] eliminated the second of the three by refactoring that path to use method handles instead.
Overall, performance didn't change much, but they might in some specific circumstances, so if that's important to you and you use a lot of reflection in your code, keep an eye open for this.

[JEP 416]: https://openjdk.java.net/jeps/416


## Javadoc Code Snippets

API documentation benefits a lot from well-placed and well-written examples.
To make sure these not only look good but actually compile and even do what the docs claim they do, it is necessary to not write them as mere text, but place them into a source file that gets compiled and tested just like any other piece of code.
Thanks to [JEP 413], that is now possible with Javadoc.

By combining build tool configuration, the new `javadoc` command line option `--snippet-path`, and the new Javadoc tag `@snippet`, your documentation can reference external files or just selected parts thereof.
And there's more...

> You can highlight substrings and regular expression matches, in a single line or the entire region, as bold, italic, or highlighted, which is customizable via CSS.
> You can replace text, for example to to cut something short with an ellipses.
> You can link text like method calls or type names, again matching by substrings or regex, to their API docs.
> You can include other files than just Java sources.
> You can add HTML IDs, so URLs can link directly to a snippet.

... that was from [the last Newscast][ijn#20], which goes into a lot more details on all of this.
And keep in mind that all you have to do for that is run the JDK 18 Javadoc tool - you don't have even have to run your entire build on JDK 18, let alone migrate your code base to it.
For more on that as well as how to configure all this with Maven, check out [my blog post on the topic](javadoc-snippets-maven).

[JEP 413]: https://openjdk.java.net/jeps/413
[ijn#20]: https://www.youtube.com/watch?v=m2cVOYuVs1U


## Bits and Pieces

Most Java releases also add some methods to existing APIs, but JDK 18 isn't doing a lot here.
The most interesting additions I found are on the `Math` and `StrictMath` classes.
They both gained methods that combine division and modulo computations with rounding, for example to compute the result of 4 divided by 3, rounded up.

Another aspect of Java that sees regular improvements from release to release is its performance.
Billy will tell you all about that in the next episode.
If only there was a way for you... wait, we already did that.
Seriously, though, subscribe.


## Outro

And that's it for JDK 18 - I'm curious to learn which of these changes interests you the most.
If you have any questions about any of them, ask ahead in the comments below and if you enjoy this kind of content, help us spread the word with a like or by sharing this video with your friends and colleagues.
The next episode will be hosted by my colleague Billy Korando, so I'll see you again in four weeks.
So long...

---
title: "Java's Plans for 2024 - Inside Java Newscast #61"
tags: [project-amber, project-babylon, project-leyden, project-lilliput, project-loom, project-panama, project-valhalla]
date: 2024-01-18
slug: inside-java-newscast-61
videoSlug: inside-java-newscast-61
description: "In 2024, Java keeps evolving. Here's what the big OpenJDK projects (Amber, Leyden, Valhalla, and more) plan for this year and how that will push Java forward."
featuredImage: inside-java-newscast-61
---

Happy Gregorian new year, everyone, and welcome to the Inside Java Newscast, where we cover recent (and in this case future) developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about Java's plans for 2024.
Or, more specifically, what the big OpenJDK projects will be working on this year - of course, there's much more development going on.

And note that "working on this year" is very different from "releasing this year", not least because for a feature to be released in 2024, it has to be finished and merged into the JDK main line by mid June, so more than half of 2024's completed work won't even be released before 2025.
The last caveat is that nobody can predict the future, least of which software developers, which is why the smart folks in OpenJDK usually don't.
Luckily for us, I'm not that smart and so I'll predict all kinds of things in this video, which makes all errors mine.
Ready?
Then let's dive ...
Oh wait, by the way I recorded this in a city where I recently gave a talk at the local Java User Group - I'll let you guess where I was.
Now: Let's dive right in!

## Babylon

During the JVM Language Summit last August, [Paul Sandoz presented _code reflection_](https://www.youtube.com/watch?v=xbk9_6XA_IY), an expansion of the reflection API that allows access, analysis, and transformation of Java code inside a method.
Its goal is to allow developers to write Java code that libraries can then interpret as a mathematical function, for example to differentiate it, which is common in machine learning, or they can transform it to a GPU kernel, to part of an SQL statement, or to anything else, really.
I covered this in some detail in [Inside Java Newscast #58](https://www.youtube.com/watch?v=q8pxRkdKeR0).

Later in 2023 Paul's exploration led to the foundation of [Project Babylon](https://openjdk.org/projects/babylon/) and just this week he has pushed a prototype to the Babylon repository.
There's a link to [his email announcing that](https://mail.openjdk.org/pipermail/babylon-dev/2024-January/000004.html) and [some context](https://mail.openjdk.org/pipermail/babylon-dev/2024-January/000005.html) in the description.
Over the coming weeks, the Babylon team plans to publish work for a few use cases like auto differentiating, a C# LINQ emulation, and GPU programming in Java.
Babylon is still in its early stages, though, so I don't expect anything tangible in the main line in 2024.

<contentvideo slug="inside-java-newscast-58"></contentvideo>

## Loom

It feels a bit mean but I think it is fair to say that [Project Loom](https://openjdk.org/projects/loom/)'s days in the spotlight are coming to an end.
Virtual threads are final and the structured concurrency and scoped values APIs are in their second preview in JDK 22 and I expect them to finalize some time this year.
While we start using these features in our code, what remains to be done for the project are various improvements, either under the hood or as additions to these APIs.
And while they're minor relative to Loom's overall scope, that doesn't mean they're not important.

I hope specifically that there'll be progress on making synchronization non-pinning and file I/O non-capturing, at least on Linux with io_uring.
I don't know whether that progress will be sufficient for a release in 2024, though - the JDK 23 fork is just five months away, after all.
But maybe for the next release after that?
I'm crossing fingers - or rather, pressing thumbs, because that's what we do in Germany.

## Leyden

The [last time we walked through the snow](https://www.youtube.com/watch?v=QPWFjNroHls), I told you about [Project Leyden](https://openjdk.org/projects/leyden/)'s concept of condensers.

> A _condenser_ is an optional transformation phase that takes a code artifact (like bytecode) as input and produces another artifact as output that can contain new code (like ahead-of-time compiled methods), new data (like serialized heap objects), or new metadata (like pre-loaded classes).
> The condenser:
>
> * performs some of the computation expressed in the input artifact, thereby shifting that computation from some later phase to the current phase
> * applies optimizations enabled by that shift so the new artifact is faster, smaller, or otherwise "better"
> * and it possibly imposes constraints but more on that later

In 2023, Leyden made progress researching potential condensers and [at JVMLS Mark Reinhold and John Rose presented](https://www.youtube.com/watch?v=lnth19Kf-x0) some considerable performance improvements, where they shortened a Spring Boot app's time to "Hello World" by 50-80%.
And the cool thing about these improvements is that they require absolutely no constraints - they work with all of Java's features, even the most dynamic ones!
In 2024, Leyden works to bring these benefits out of their prototype state and to deliver them to us, but it's hard to say whether we can expect anything tangible to land this year.

<contentvideo slug="inside-java-newscast-43"></contentvideo>

## Amber

[Project Amber](https://openjdk.org/projects/amber/) stays the powerhouse behind Java's language evolution.
It currently has three features in preview:

* string templates
* simplified `main` (both in their second preview)
* statements before `this()` and `super()` (which is in its first preview)

I expect all three to finalize in 2024, although not necessarily in JDK 23.

One feature that isn't on that list yet and that I'm _very_ excited about are `with` expressions.
You know that anti-pattern of declaring setters for all fields?
(Yes, I called it an anti-pattern - don't @ me.)
This doesn't work when fields are final and so, in those situations, you'd want to create methods that accept a value and return a new instance where all fields have the same value as the current instance except for the one that was passed in.
So for a class `Name` with final fields `String first` and `String last`, you'd create a method `withFirst(String first)` that returns a `new Name(first, this.last)` and similarly `withLast(String last)` that returns a `new Name(this.first, last)`.

```java
public class Name {

	private final String first;
	private final String last;

	public Name(String first, String last) {
		this.first = first;
		this.last = last;
	}

	// [...]

	public Name withFirst(String first) {
		return new Name(first, this.last);
	}

	public Name withLast(String last) {
		return new Name(this.first, last);
	}

}
```

Methods like these, often called "withers", are useful but quite boilerplate-y, which is made worse by the advent of records which always have final fields and thus almost require withers.
To alleviate that, Brian Goetz' three year old white paper ["Pattern Matching in the Java Object Model"](https://openjdk.org/projects/amber/design-notes/patterns/pattern-match-object-model) described `with` expressions.
They start with a record reference followed by the situational keyword `with` and a code block.
At runtime, they take the record apart into its components and declare a mutable variable for each that is accessible in the code block, which then gets executed.
The block can contain arbitrary code but its main function will be to assign new values to at least one of the variables.
When it ran its course, the `with` expression will create a new instance of the record from those variables.
So when you have a `Name` instance called `userName`, you can create a copy with the same first but no last name, by running `var userFirstName = userName with { last = ""; };`.

```java
public record Name(String first, String last) { }

var userName = new Name("Jane", "Doe");
var userFirstName = userName with {
	// implicitly declared variables:
	//     String first = "Jane";
	//     String last = "Doe";
	last = "";
	// block returns:
	//    new Name(first, last)
};
```

So this feature has been in the pipeline for a while, but as far as I can tell, pattern matching was simply more important.
But now that the basic building blocks for that are all final in JDK 21, I'm really hoping for withers to be tackled next and to hear more details about them in 2024.

Speaking of pattern matching, though, you can see from the list of in-flight features that work on it took a little breather.
But Brian Goetz, Gavin Bierman, Angelos Bimpoudis, and the other folks working on this are already taking the next steps.
There's a JEP for a first preview of primitive types in patterns and it's already proposed to target JDK 23.
That's [JEP 455](https://openjdk.org/jeps/455), link below the like button, and I'll tackle it in a future Newscast, so make sure to subscribe.

And then there was [a really interesting mail from Brian Goetz](https://inside.java/2023/12/15/switch-case-effect/) on the Amber mailing list in December:
It considered expanding `switch` to handle exceptions that occur when evaluating the selector expression - that's the method calls you can put into the parenthesis after `switch`.
And Brian also promised us deconstruction assignments a while back!

Although at this point we might be crossing over from "plans for 2024" into "Nicolai's wishlist", so I'll stop here.
But it's clear that Amber's not slowing down and will keep shaping Java's evolution.

## Valhalla

I still remember the old days, when I was a young whippersnapper, and thought [Valhalla](https://openjdk.org/projects/valhalla/) is just around the corner and Brian Goetz was just too careful to admit it.
Now, three decades later (ok, it's not _that_ bad), I start to see his wisdom, though.
There have been a number of proposals that seemed good at the time but whenever one entered the home stretch, it turned out that this is a relay race and they weren't the last proposal after all.
Because with every new prototype, new revelations occurred and a better proposal was possible.
And I'm giving Brian and his team a lot of credit for not doing the easy thing and just shipping something to get Valhalla over the finishing line but to work out the best possible solution.

Is the current round of proposals it?
I wanna say yes, but maybe I'm just falling into the same trap again.
But either way, I can tell you what will be worked on - whether that'll be what ends up in the JDK or when that happens is beyond me.

Work will be focused on [JEP 401](https://openjdk.org/jeps/401): "value classes and objects".
Instances of value classes will be shallowly immutable and lack identity which will often make sense when modeling a domain, will categorically prevent certain kinds of bugs, and will give the JVM much more freedom to encode simple values in ways that improve memory footprint, locality, and garbage collection efficiency.

Beyond that there's the idea to enable nullness markers to get better heap flattening for value objects - [the issue](https://bugs.openjdk.org/browse/JDK-8316779) and [a conversation about that](https://www.youtube.com/watch?v=Re5HvyUtIJ0) are linked in the description - and of course generic specialization, but I doubt we'll see public progress on these as there's little reason to work on specifics until JEP 401 is stable.

## Panama

[Project Panama](https://openjdk.org/projects/panama/) has three irons in the fire:

* The vector API is very stable for now and basically production-ready but because it is very likely to change once Valhalla lands, it is still in incubation and sadly, I don't expect that to change in 2024.
* The foreign function and memory API, FFM for short, finalized in JDK 21 but is still being improved.
  For example, the team is currently working on a concept that allows user-friendly and performant mapping between native memory segments and Java abstractions such as records and interfaces.
* And then there's [jextract](https://github.com/openjdk/jextract), the tool that generates FFM bindings from native library headers.
  Improving it and the tooling around it will make working with native libraries much simpler than before and is the main focus of Panama in 2024.

## Lilliput

Every object on the heap has a header.
Project Valhalla aims to introduce optimizations that greatly reduce or even eliminate the need for header bits for specific value type instances and [Project Lilliput](https://openjdk.org/projects/lilliput/) aims to reduce header size for all regular objects, first to 64 and eventually to 32 bits.
I made [a Newscast about Lilliput](https://www.youtube.com/watch?v=r2G4ed2E4QY) last year and project lead [Roman Kennke gave a great talk about it at JVMLS](https://www.youtube.com/watch?v=9ioh6kprnPE), both linked in the description.
In 2023, Lilliput merged an alternative fast-locking scheme, which is needed to later allow the intended reduction of header size.
That scheme needs further improvements before it's ready for prime-time, though, and so Lilliput is currently working on that and it seems to me that that'll take much of the year, so I don't expect the header size improvements to land in 2024.

<contentvideo slug="inside-java-newscast-48"></contentvideo>

## Outro

And that's it for Java's plans in 2024.
Leaving Amber and Valhalla aside, I heard most of you are looking forward to Babylon the most.
I gotta say, from that list, my favorite is Leyden.
Let's see who gets to release an improvement first.

Talking about improvements, you may have noticed that the Inside Java Newscast changed its look and feel in recent weeks.
I got a bit bored by the old style and wanted to shake things up a bit.
I'm super interested to hear what you think about it.

I'll see you in the comments and on screen again in two weeks.
So long ...

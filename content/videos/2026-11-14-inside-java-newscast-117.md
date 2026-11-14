---
title: "Adaptive Heap Sizing + Numeric Conversion + Primitive Patterns - Inside Java Newscast #117"
tags: [performance, project-valhalla, project-amber, java-28]
date: 2026-11-14
slug: inside-java-newscast-117
videoSlug: inside-java-newscast-117
description: "ZGC gets adaptive heap sizing, value classes complicate numeric conversions, and primitive patterns are withdrawn as JDK 28 takes shape"
featuredImage: inside-java-newscast-117
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're going to look into how ZGC can strike a better balance between CPU use and memory consumption, how more custom numeric types make numeric conversion more painful, and what all that has to do with the tragic fate of primitive patterns.
Oh, and we'll check in one more time on JDK 28 before going over all the features in the next episode.
Ready?
Then let's dive right in!


## Adaptive Heap Sizing for ZGC

Let's start with a cool addition to ZGC in JDK 28: adaptive heap sizing, which aims to give you a better balance between CPU use and memory consumption with close to zero configuration.
But before we get to that, we need to lay a bit of groundwork.
Put simply, the goal of any GC is to allow the application to keep allocating memory and there are three currencies it takes as payment for this service:

* GC pauses when the collector needs to stop the application
* CPU utilization, which allows the GC to do its work
* and of course memory

ZGC specifically aims at ultra-low pause times, so we won't be paying much out of that pocket and we can cross it off the list.
This leaves us with CPU, which ZGC uses concurrently with the running application, and memory.
The essential observation about these two factors is that you can pay ZGC in a mix and the more you pay of one, the less you need to pay of the other.
That's because the work that goes into freeing up memory does not depend on the amount of freed or available memory but only on how much is usefully occupied.
This so-called _live set_ depends on the app itself and barely on the heap size (app-level caching and weak references complicate this a bit, but we can ignore that here).
So, every GC cycle requires a certain amount of CPU time but the more heap space you have, the more time goes by between cycles and thus the lower the overall GC CPU utilization.

Ideally you want to pay the GC with the more abundant resource.
If you have a CPU-intensive application on a system with a lot of free memory, that'd be heap size.
If memory is scarce, maybe due to the hardware itself, other services on the system, or an allocation spike in your app, you pay with more CPU.
But here's the thing:
What if, over an application's lifetime, you wander between these poles?

And here we finally come to adaptive heap sizing.
In a nutshell, if you activate this JDK 28 feature with `-XX:+UseZGC -XX:+ZAdaptiveHeapSizing`, ZGC observes the application and the system and balances these factors out.
If the application is keeping the CPU busy and memory is available, ZGC will expand the heap to minimize its own CPU demands.
To make the most of the available resources, this can go up to almost 100% of the system's memory if it doesn't push back through its own demands.
But when it does and memory pressure rises, particularly while the app's CPU needs are low, ZGC aims to clear out memory and return it to the OS.

There's a single abstract setting, `-XX:ZGCIntensity`, which allows us to configure the trade-off with a positive number.
The lower the value, the less intensively ZGC works, i.e. the less CPU but the more of the available memory it will try to use.
At 0, adaptive heap sizing would never use more CPU than it absolutely has to, so it'd effectively be turned off - the JVM will instead reset it to its default value 5 and tell you as much in a log message.
Beyond 5, the CPU gets ever busier in exchange for using less and less memory beyond the live set but expect starkly diminishing returns as the value grows.

[JDK Enhancement Proposal 546](https://openjdk.org/jeps/546), the one introducing this feature, contains a great example where a few JVMs are launched, some sequentially, some concurrently, and the resulting overall memory use as well as the split between the JVMs is measured and visualized.
But you can also play around with this yourself as it is already integrated into JDK 28 early access.
If you find anything surprising, the hotspot-gc-dev mailing list would love to receive your feedback!


## Meat Space

A quick update on a few upcoming Java events:

* The [FOSDEM](https://wiki.debian.org/Java/DevJam/2027/Fosdem) Java DevRoom is back in 2027, on January 30th in Brussels.
* [JVMLS](https://openjdk.org/projects/mlvm/jvmlangsummit/) will take place from Febraury 3rd to 5th in Dublin, so if you're working on the JVM, a JVM language, or tooling, but don't want to travel to the United States for this event, this is your chance!
* You can now get [tickets for JavaOne](https://www.oracle.com/javaone/register/) in California from March 23rd to 25th.
  They're $599 for past attendees and groups and $699 for solo newbies but only for a few more weeks before prices increase, so get them while they're hot.


## Value Classes, Numeric Conversions, Primitive Patterns

I'm super excited about value classes previewing in JDK 28, but, as you know, this is just the first of many steps that Project Valhalla aims to take.
Another one, one that is still mostly hidden in the fog obscuring the road ahead, is numeric conversion:
Say you create a value class `UnsignedInteger` and want to assign an instance of it to a `long` variable.
`long` encompasses all 4-billion-and-change non-negative numbers `UnsignedInteger` can express, so that should be straightforward, right?
Given the current language features, you'd add a `toLong()` method to the class.
And `toDouble()`?
Maybe also `toInt()` and `toFloat()`, although those conversions are potentially lossy.
To go the other way with a minimum of loss, you'd need a few constructors or static factory methods.
And if you want to let users check ahead of time whether a conversion succeeds without loss of information, you'd have to add some check methods to the API, too.
That's quite a large API surface, already, but it gets worse if your dependencies define additional numerical types that you want to fold into this conversion matrix, not least because you cannot add any methods to _them_.

Ok, so this is a bit of a mess.
What's happening here is that the surprisingly tricky topic of primitive conversion, which takes up quite [a few pages in the Java Language Specification](https://docs.oracle.com/en/java/javase/27/docs/specs/jls/jls-5.html), explodes into user space once we start adding custom numeric types much more liberally thanks to value classes.
For one, the conversion matrix grows larger, and then, on top of that, it spreads across multiple artifacts that generally aren't aware of each other.
This is a problem but Valhalla has an idea for how to fix this:
Type classes.

I don't want to dwell on how exactly that mechanic may work, though - it's still very early days.
There's a link to [a JVMLS talk by Brian Goetz](https://www.youtube.com/watch?v=Gz7Or9C0TpM&t=2018s) in the description where he presents the concept in detail.
Instead, I want to focus on how it may be structured:

* First, it would probably allow us to define conversions between types that we do not have control over, for example if `UnsignedInteger` and `UnsignedLong` come from different dependencies.
* And second, it will hopefully integrate with Java's language facilities on this topic and now we're coming to the reason why I'm telling you all this in the first place.

Because what _are_ Java's features for conversion?
Casting, of course, for the actual transformation, but what about the checks?
Project Amber is currently previewing primitive patterns, which match if a lossless conversion is possible and then create a new variable with the cast value.
But now Valhalla barges in and raises the question how this would work with custom numerical types and type classes.
And I'm afraid OpenJDK's honest answer is that they don't quite know, yet.

So, and let me know if this sounds familiar, instead of integrating a feature now that will in the foreseeable future have to integrate with another one whose shape is still very unclear, the feature in question will be withdrawn for now, so details can be worked out later.
And so JDK 28 will _not_ continue the preview of primitive patterns.
They had their fifth and final preview in JDK 27.
The draft JEP for the sixth preview will be withdrawn and the feature will be completely absent in 28 GA, although the current EA build still contains it.

Note that there will be no JEP describing this decision.
Preview features don't continue by default, they end by default, meaning unless a JEP extends or finalizes them, a JDK must not contain them.
But there was a [mail](https://mail.openjdk.org/archives/list/amber-spec-experts@openjdk.org/thread/UYEK3PGOHN6R56AHJTSLPGAY363K666S/) to the Amber mailing list, explaining the decision, linked in the description of course.
It points to a silver lining, quote:

> In the meantime, we plan to introduce a different feature, Constant Patterns.
> The Constant Patterns design already carries forward work from Primitive Patterns, including expanded primitive support in switch expressions and statements.

Not in 28, though, but hopefully in 29.


## JDK 28

Let's quickly check the [JDK 28 score board](http://openjdk.org/projects/jdk/28/).
As it currently stands, it:

* finalizes the structured concurrency and PEM APIs
* adds JIT'ed code to the AOT cache
* adds adaptive heap sizing to ZGC and also makes it start up and warm up faster (a very interesting topic that I hope to get Billy to do a Stack Walker episode on)
* makes the generational mode in Shenandoah the default
* previews value classes and strict field initialization for the first time
* incubates the JSON API for the first time
* and deprecates the MacOS x64 port for removal

With primitive patterns off the list and the fourth preview of lazy constants proposed to target, all that's left is the vector API, for which I expect another incubation.

More on all that in the next episode on December 5th, just two days after JDK 28 enters Rampdown Phase One, which means its feature set will be frozen.
So long...

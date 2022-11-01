---
title: "GraalVM In OpenJDK And More JavaOne Announcements - Inside Java Newscast #36"
tags: [community, java-8, java-17, openjdk, performance]
date: 2022-11-03
slug: inside-java-newscast-36
videoSlug: inside-java-newscast-36
description: "Oracle will contribute GraalVM's just-in-time compiler and native image technology to OpenJDK. It will also create EA and GA builds for JavaFX 20+ and is hard at work at creating generational ZGC to vastly improve ZGC's already impressive performance. And then there's the Java SE Subscription Enterprise Performance Pack, a drop-in replacement for JDK 8 with JDK 17 performance."
featuredImage: inside-java-newscast-36
---

## Intro

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today we're gonna look into JavaFX EA builds, GraalVM in OpenJDK, generational ZGC and one other JavaOne announcements.

Speaking of JavaOne, I had a blast!
I'm gonna talk a bit about that later.
But first the technical stuff.

Are you ready?
Then let's dive right in!


## JavaFX 20 EA Builds

One thing I found astounding about JavaFX in recent years is that, even though it's a full-blown, rich UI toolkit, it's also just a library that can (and must) be downloaded on its own.
It's developed under the OpenJDK project OpenJFX, with strong contributions by Gluon and Oracle.

That's all yesterday's news, though.
Today's news is that Oracle will begin producing JavaFX builds on the latest versions of Java.
And you can already download JavaFX 20 early access builds from jdk.java.net - just next to the Java 20 EA builds.
And when Java 20 turns GA, so will JavaFX 20.

By the way, if you're looking for a runtime that includes JavaFX, you can download both the JDK and JavaFX and then use `jlink` to create just that.

OpenJFX co-lead Kevin Rushforth from Oracle also confirmed that JavaFX will continue to see development and with a particular eye on making it easier for beginners to get started.
We think JavaFX is an important tool for education and learning to build things with Java, a topic that will become more important in Java's third decade.


## GraalVM Comes To OpenJDK

GraalVM has been developed by Oracle but outside of OpenJDK and that has caused differences in release schedules, features, and development processes.
To make sure those obstacles don't hinder adoption and participation in the development of GraalVM technologies, Oracle will contribute the GraalVM just-in-time compiler and Native Image to OpenJDK.

This way they will be developed with the same methods, processes, and schedules as Java.
That means two feature releases per year with support for the respective Java SE version as well as four quarterly critical patch updates per year.
Oracle will also offer long-term support for every fourth feature release.

But we're not there yet!
The plan is to create a new OpenJDK project that investigates the contribution of these technologies.
Native Image specifically will be evolved to track [Project Leyden][leyden] as it paves a path to fully-static images in a future release of Java SE.
When suitable portions of GraalVM are ready to be proposed for inclusion into the main-line JDK source code, that will happen through the usual JDK Enhancement Proposal process.
In the mean time, we might see early access releases on jdk.java.net just like for other important projects like Loom and Valhalla.

A few more insights on this are in [the official announcement][graal], link in the description, but many details will have to be worked out over the coming months and years.
If you don't want to miss anything, make sure you're subscribed to this channel and regularly check out our OpenJDK news aggregator at [inside.java].

[leyden]: https://openjdk.org/projects/leyden/
[graal]: https://www.graalvm.org/2022/openjdk-announcement/
[inside.java]: https://inside.java


## Java SE Subscription Enterprise Performance Pack

[Java SE Subscription Enterprise Performance Pack][epp] - a name that rolls off the tongue like a molten plastic spoon.
I'll just call it EPP for short, but don't you dare repeat that or I get into trouble!
So what is EPP?

In the seven years from Java 8 to 17 there have been a lot of memory management and performance improvements:
From garbage collection algorithms to compact strings, from lock contention to enhanced observability, there were dozens of optimizations.
Now, I've been telling everybody who listens and a lot who didn't to switch to Java 17 or later to get all that good stuff.
But if you absolutely don't want to update, if Java 8 is the hill you want your project to die on, then take a look into EPP.

It's a drop in replacement for JDK 8 that is available, at no additional cost, to all Java SE Subscription customers and OCI users.
It brings JDK 17 performance to JDK 8 server loads on 64-bit Linux on Intel and ARM.
For heavily loaded apps we've seen memory and performance improvements of about 40% and even apps not running near capacity may see an up to 5% improvement.

To opt-in today, check [the link][myos] in the description.

[epp]: https://blogs.oracle.com/java/post/introducing-the-java-se-subscription-enterprise-performance-pack
[myos]: https://support.oracle.com/portal/


## Generational ZGC

ZGC is a garbage collector that, in the trade-off between footprint and pause-times, went all in on minimizing pause-times.
It does an amazing job at that, but one trick it doesn't use so far is to rely on the weak generational hypothesis.
The weak generational hypothesis states that most objects only live a very short time and GCs can optimize for that pattern for better performance and lower foot-print.

The OpenJDK community is working hard on allowing ZGC to do just that, they call it _generational ZGC_, and preliminary benchmarks are looking fantastic.
In a Cassandra 4 benchmark straight from the lab, generational ZGC required just 25% of the memory to fulfill the same service requirements.
That's huge!
Or rather, tiny.

As an aside, Parallel GC and G1 of course also see continuous improvements and particularly the latter has seen a steep drop in native memory overhead from Java 8 to 19.

<!-- https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/generations.html -->


## JavaOne

So let's talk a bit about JavaOne.
As I said, I had a blast!
I could swoon over great talks and labs, over meeting community rock stars and OpenJDK luminaries, over group lunches, community get-togethers, or the parties.
Instead I want to tell you about... you!

Because the best thing was that I got to meet so many you, you amazing humans!
Talking to you about Java, the Newscast, or a project of yours is so damn cool and I'm really happy for every single conversation.
So wherever you see me, maybe at J-Fall later today, don't be shy, I love to talk to and hear from you.

Regarding catching up on JavaOne:
For now only the three keynotes are online.
I'm not sure whether more talks will be published, but if so, they'll all end up on this channel and specifically in the playlist that's linked below.

And if you want to do me a favor, give the community keynote a view.
It's the least interesting keynote from a technological perspective but I got to organize it with my colleagues Ana and Heather and am pretty proud of what we put together.
It talks about how the community and every single member of it like you, is the future of Java and wants to inspire you to contribute more.
How?
That's what it's about!
Go check it out.

## Outro

And that's it for today on the Inside Java Newscast.
Since you made it all the way to the end, do me a favor and hit that like button.
Also, subscribe, click the bell, and don't forget to share this video with your friends and enemies.
Newscasts will be coming every two weeks, but I'm gonna take a break to cure my hangover and meet you again mid December - Billy and Jose will be there for you until then.
So long...

---
title: "Java's Plans for 2025 - Inside Java Newscast #83"
tags: [project-babylon, project-leyden, project-lilliput, project-loom, project-panama, project-valhalla]
date: 2025-01-16
slug: inside-java-newscast-83
videoSlug: inside-java-newscast-83
description: "In 2025, Java keeps evolving. Here's how the big OpenJDK projects (Leyden, Valhalla, and more) sans Amber plan to push Java forward."
featuredImage: inside-java-newscast-83
---

Happy Gregorian new year, everyone, and welcome to the Inside Java Newscast, where we cover recent (and in this case future) developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about Java's plans for 2025 or, more specifically, what the big OpenJDK projects except Amber will be working on this year.

"Why 'except Amber'?" I cannot hear you ask.
Because, just like with the JDK 24 feature set, OpenJDK keeps being too productive for this show's format (kinda disrespectful if you ask me) and so I have to make another two-parter and Amber, plus a few miscellaneous developments that I'm aware of, will take up the whole second episode in two weeks!

Before we get started with this episode, I need to do a bit of housekeeping:

* I'll talk about what features these projects will _work on_ this year but that by no means implies that they're gonna be _released_ this year, so let's be patient.
* But if you want to speed things along, you actually can:
  Find a feature that interests you and is in some form of preview, try it out in anger, and give feedback - a bit more on the importance of that later.
* If you want to follow these developments along, make it a habit to check in on inside.java, where we publish updates as they appear.
* And of course, there are links to all projects, mailing lists, and everything I mention in the description.

Ready?
Then let's dive right in.


## Project Babylon

> [Project Babylon](https://openjdk.org/projects/babylon/)'s primary goal is to extend the reach of Java to foreign programming models such as SQL, differentiable programming, machine learning models, and GPUs.
> Babylon will achieve this with an enhancement to reflective programming in Java, called code reflection.

The code reflection prototype is available in the project's repo and is currently being carefully refactored to prepare for an eventual incubation.
Its further development is mainly being pushed by the ongoing work on HAT, the Heterogeneous Accelerator Toolkit, which offers an NDRange-based GPU programming model with idioms that are familiar to GPU developers.
Babylon is also exploring an ONNX-script-equivalent (of course in Java) - at this point mostly just to prove that it can be done.
And I heard rumors that there's _a chance_ (no promise!) that project lead Paul Sandoz can present a prototype at JavaOne in March.

Oh right, did I tell you that JavaOne is back?
(Again.)
Redwood Shores in the Bay Area, USA, March 18th to 20th.
Meet Paul, Brian Goetz, and many other OpenJDK leads and contributors.
Tickets still available - link in the description.

Code reflection, HAT, ONNX - all of this is still pretty early, though.
If you want to get a better understanding of the current state, I'll link two fairly recent emails
([1](https://mail.openjdk.org/pipermail/babylon-dev/2024-November/001929.html), [2](https://mail.openjdk.org/pipermail/babylon-dev/2024-October/001731.html))
with progress reports in the description.
You can also check out these three talks from the JVM Language Summit in August 2024:

* Paul presented [an update on code reflection](https://www.youtube.com/watch?v=6c0DB2kwF_Q)
* and [another on HAT](https://www.youtube.com/watch?v=szGiOvfTPfI), including a live-demo of computing the Game of Life on a GPU - very courageous
* Intel's Steve Dorhmann presented on [how to translate Java to SPIR-V](https://www.youtube.com/watch?v=GQLBzrbkiKA)

There are also some articles, including one about [neural networks with Triton](https://openjdk.org/projects/babylon/articles/triton) and another about [emulating C#'s LINQ](https://openjdk.org/projects/babylon/articles/linq), again both from Java of course.
Lots going on in Babylon, the tower is getting taller.


## Project Loom

After finalizing virtual threads in 2023, [Project Loom](https://wiki.openjdk.org/display/loom/Main) removed the biggest hurdle to straightforward adoption in 2024: pinning of virtual threads when interacting with object monitors, which means [no more pinning on `synchronized` blocks and on `Object::wait`](https://openjdk.org/jeps/491).
This will be shipped with JDK 24 in March.

The highest priority for 2025 is progress and hopefully finalization of the two preview APIs Loom has in the fire:

* [structured concurrency](https://openjdk.org/jeps/499) for a simplified concurrent programming model that treats groups of related tasks running in different threads as a single unit of work for a host of benefits over other threading models
* [scoped values](https://openjdk.org/jeps/487), which can be summarized as an improved and more virtual-thread-friendly variant of thread locals

The team is still looking for more feedback on these, particularly on the structured concurrency API, which will in all likelihood see a slight revamp in the next preview in JDK 25.
If you have the chance, please try these APIs and report back to [the Loom mailing list](https://mail.openjdk.org/mailman/listinfo/loom-dev).

Java developers frequently ask me how they can contribute back to OpenJDK and while most are thinking about writing code, an easier and much more valuable way to contribute is this - trying out previews in as close to a production environment as possible and reporting the results back to the respective projects.
Every project lead I talked to for this video asked me to ask you for more feedback.
To put it bluntly:
What makes your contribution unique isn't that you can code (the OpenJDK folks are kinda decent at that), it's that you can report real-life outcomes of putting new features into practice - that's much harder to achieve for OpenJDK in a matter that represents all niches of Java's gigantic ecosystem.

Beyond the structured concurrency and scoped values APIs, there's also work on less-impactful pinning issues and lock information in thread dumps.


## Project Leyden

Ahh, it feels like only yesterday that we watched [Project Leyden](https://openjdk.org/projects/leyden/) gurgle its first word (it was "condenser", by the way) and in just two months we can already use its first feature in production, namely [ahead-of-time class loading and linking](https://openjdk.org/jeps/483).
They're growing up so fast.
Again, if you have the chance, please kick the tires and [report back](https://mail.openjdk.org/mailman/listinfo/leyden-dev), particularly your experience with training runs.

As for 2025, there two features in the pipeline that will be worked on, namely ahead-of-time [method profiling](https://openjdk.org/jeps/8325147) and [code compilation](https://openjdk.org/jeps/8335368).
Very early JEP drafts exist for both and I can't wait for them to stabilize - once that happens we'll of course take a closer look at it here.


## Project Lilliput

[Project Lilliput](https://wiki.openjdk.org/display/lilliput) aims to reduce the memory consumption of object headers by shrinking them from 12 or 16 bytes on 64-bit systems to 8 bytes, with a stretch goal of just 4 bytes, which would free up 10-20% of the heap.
JDK 24 will ship with [experimental compact object headers](https://openjdk.org/jeps/450) of 8 bytes that you can put through the ringer and [report your findings](https://mail.openjdk.org/mailman/listinfo/lilliput-dev).

The main task for 2025 is to evaluate in practice the performance as well as the imposed limit on the number of classes.
This limit stems from the fact that each object header contains a so-called class pointer, which references a data structure describing the object's type, for example its field layout.
With fewer header bits, that pointer had to shrink to 22 bits, meaning a maximum of four million classes.
Sounds plenty, but keep in mind that some libraries and frameworks generate classes at runtime, which may make some applications surpass that limit.

Beyond that, there are also some implementation details to iron out.
The goal of all this work is to make compact object headers non-experimental and eventually the default.


## Project Panama

[Project Panama](https://openjdk.org/projects/panama/) has three irons in the fire:

First, [the vector API](https://openjdk.org/jeps/489).
It's very stable for now and some projects already use it in production but its finalization is still waiting for Valhalla.
You might've heard me say that it's waiting for universal generics, specifically, but it looks like I was wrong about that.
Instead it's about identity and specification:
It's important for the API's performance that vectors lack identity, which is currently achieved by bespoke optimizations in HotSpot but without value types, this behavior is unspecified.
So once Valhalla's JEP 401 starts the preview on value types, the vector API can lean on that and itself go from incubating to preview, which will include a thorough re-review of the API that may result in further changes.
If you've used it and found some operations missing or any other issues with it, please take it to the Panama mailing list.

Second, the foreign function and memory API was finalized in JDK 22 and has been very well received.
Since then, the project's focus has shifted to improving performance, specifically by making memory access as fast as possible across the board and by reducing the startup and warmup time from the use of method and variable handles.
They're also working on record mappers, which allow user-friendly and performant mapping between native memory segments and Java abstractions such as records and interfaces.
The core functionality is coming along well and various ways to express it are currently being explored.

And third, there's [jextract](https://github.com/openjdk/jextract), the tool that generates FFM bindings from native library headers.
The main focus there is to try and take advantage of the `StableValue` API to emit simpler bindings with fewer side classes.
Stable values are still in development and don't technically live under Panama's roof, but they visit often to hang out with their cool aunt.
I'll get to `StableValues` in the next video.


## Project Valhalla

Before going into the tech, we need to talk about the "Valhalla, when?" comments that pop up under _every_ video on this topic and quite a few others.
Love 'em, keep 'em coming.
Every time I see one, I forward it to Brian and I'm really happy that German labor laws protect me.

Ok, so [Project Valhalla](https://openjdk.org/projects/valhalla/) short and sweet:

1. [JEP 401's value types preview](https://openjdk.org/jeps/401) has become the tip of the spear and the main focus is on getting it out to you.
2. A somewhat surprising runner-up is the development of [null-checked](https://openjdk.org/jeps/8316779) [types](https://openjdk.org/jeps/8303099) - like `String!` and `String?` - also sometimes called emotional types, presumably not because they make people emotional even though they definitely do.
 Check out [this talk by Brian](https://www.youtube.com/watch?v=Dhn-JgZaBWo&t=1408s) to learn more about that - the link in the description is time-stamped to the respective chapter.
3. Some early explorations of improved numerics and primitives layered on top of value classes.

That leaves us with only one question:
Valhalla...

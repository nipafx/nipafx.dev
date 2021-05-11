---
title: "Vector API, Record Serialization, And Java 17 Release Schedule - Inside Java Newscast #2"
tags: [java-16, vector, java-17]
date: 2021-04-08
slug: inside-java-newscast-2
videoSlug: inside-java-newscast-2
description: "Short introduction to the Vector API (incubating in JDK 16) and an update on serializing records. Also, a quick mention of JEP 356 in JDK 17 and the proposed release schedule."
featuredImage: inside-java-newscast-2
---

## Intro

Welcome everyone,

to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today I got four topics for you:

* With JDK 16 out the door, we can take some time to take a closer at two of the exciting new additions, the incubating vector API and a detail on records.
* Then we'll peek towards JDK 17, where a new JEP just landed and the release schedule was published.

Ready?
Then let's dive right in!

## Vector API

We'll start with the vector API.
Recently, Paul Sandoz, Java Architect at Oracle, and Sandhya Viswanathan, Principal Software Engineer at Intel, gave a talk on this topic at Oracle Live.
I highly recommend to watch it!
Here, I'll cover the motivation for and current status of the API, so you can safely skip the first couple of minutes - I'll leave [a time-stamped link](https://www.youtube.com/watch?v=VYo3p4R66N8&t=7m7s) in the description below.

### SIMD Programming & Vector Instructions

So what is this API all about?
The Vector API deals with SIMD computing, which is short for _Single Instruction, Multiple Data_.

That means applying an operation (a single instruction), not just to one set of operands, but to multiple sets in parallel (that's where _multiple data_ comes from).
This is done by specialized CPU hardware offering so-called _vector instructions_ that execute these operations in about the same number of cycles for several sets of operands as it would take to execute the same operation on a single set of operands.
For example, instead of adding a single pair of numbers to one result, a vector instruction might add 8, 16, or more pairs to as many results without taking much longer.

Most common CPU architectures offer such vector instructions and the just-in-time compiler's auto-vectorizer already makes use of them wherever it can.
The problem is that it's far from perfect in identifying and reliably optimizing such scenarios.
So for performance-sensitive algorithms that adhere to the SIMD model, the new vector API offers a specialized programming interface.
It takes a "what you see is what you get" approach where the API closely resembles common vector instructions.
That guarantees that the just-in-time compiler can generate optimal hardware instructions across all supported CPU architectures.

Typical applications are linear algebra, image processing, character decoding - really anything that's heavy on basic arithmetic and needs to apply that to a lot of independent inputs.

### Status

The vector API is a cooperation between Oracle and Intel, spearheaded by Paul Sandoz and Sandhya Viswanathan.
It was first released in JDK 16 and is incubating in a module currently named _jdk.incubator.vector_.
That means in order to use it, you need to enable it with the command line flag `--add-modules=jdk.incubator.vector` at compile and run time.

The API will keep incubating for quite some time for three main reasons:

* To gather feedback - so if you have a use case for it, you can help make it better by trying it out and reporting your findings to [the Project Panama mailing list](https://mail.openjdk.java.net/mailman/listinfo/panama-dev) (link in the description).
* To provide more architecture-specific implementations, for example for ARM.
* To benefit from Project Valhalla's primitive objects once they arrive and from Panama's foreign memory.

<!--
### Basics

Ok, enough with the introduction, let's talk about how the API works.

First of all, there's a new class `Vector<E>` that represents, wait for it, a vector, meaning a bunch of numbers you want to operate on with a single SIMD instruction.
These instructions, or rather abstractions of them, are defined as methods on `Vector`, where you'll find `add`, `min`, `multiply`, and so forth.
The vector has an _element type_ `E`, which is the kind of data you want to work with.
There's one type corresponding to each of the six numerical primitive types - you can see the need for Valhalla's primitive classes right there.

https://www.youtube.com/watch?v=WBvTilbh8S0 (card)

Then there's the _shape_, which is the vector's size in bits.
It can be 64 bits, 128 bits, and so forth.
While you could pick one for yourself, your code's performance depends on how well this shape aligns with the specific CPU's hardware.
Some CPUs operate on 64 bit vectors, others on 128 bits, and so forth - even 2048 bits isn't unheard of.
Put a pin in that, we'll come back to it shortly.

The ratio between shape and element type size defines how many _lane elements_ a vector has, meaning how many elements fit into one vector.
For example, with a shape of 256 bits and an element type `long`, which is 64 bits wide, you get - 256 over 64 - four lanes.
If you can make do with `byte` instead of `long`, so 8 bits instead of 64, you get 32 lanes instead.
Now, why is that important?
Because the number of lanes has no impact on the time it takes to execute an instruction!
That means an addition of two 256-bit long vectors, each with four lanes, takes as much time as an addition of two 256-bit byte vectors, each with 32 lanes.
That's an 8-fold speedup if you can squeeze your data into bytes instead of longs!

Besides making your data small, you'll want to make the shape large, but remember that it needs to fit the underlying CPU for optimal performance.
So let's get back to that.
Together, element type and shape are called a _species_.
There's a corresponding class called `VectorSpecies<E>` and it acts as a factory for `Vector<E>`.
The crucial bit about species is that since it includes the shape and each CPU architecture has an optimal shape, each CPU architecture has a so-called _preferred species_.
You can request this preferred species from the vector API when putting together your vectors.
If you do that, you will always use the shape that's optimal for the architecture running your code and just-in-time compilation can reliably deliver optimal SIMD instructions and thus optimal performance.
-->

### More

At this point, I'd love to go into details and explain how the new types `Vector` and `VectorSpecies` interact, or what a species is for that manner.
Also, what a shape is, why it's important, and how you pick the correct one for your CPU architecture.
But I don't have time for it here, so you should really check out [Paul's and Sandhya's talk](https://www.youtube.com/watch?v=VYo3p4R66N8).
Beyond what I just outlined, Paul goes on to give an example how the vector API makes the JDK more performant and maintainable.
Sandhya has a lot more and pretty cool examples from dot product and matrix multiplication to image manipulation and Mandelbrot generation.

If, after that talk, you still don't have enough, check out [Inside Java Podcast Episode 7](https://www.youtube.com/watch?v=HARDCbSog0c) with John Rose, Java Virtual Machine Architect at Oracle, and Paul Sandoz as well as [_FizzBuzz – SIMD Style!_](https://www.morling.dev/blog/fizzbuzz-simd-style/), a blog post by Gunnar Morling, software engineer at Red Hat - links to both below.

## Record Serialization

Records were finalized in Java 16, so if you're on the recent release, you can go ahead and use them in production.
To productively use them, though, you need more than just the language - tools and dependencies need to play along as well.
For a data-centric feature like records that puts serialization high up on that list.

Quick aside, when I say _serialization_, I'm not just talking about Java's onboard serialization mechanism that turns instances into a byte stream and vice versa.
That one of course already works perfectly fine with records.
No, I'm talking about the wider concept where an instance gets turned into any kind of external representation, for example JSON or XML.
These and many more formats are under the purview of a number of frameworks and they need to be made aware of records as well.

So to give records a leg up, Chris Hegarty and Julia Boes, both working at the Java Platform Group at Oracle, engaged with three popular Java-based serialization frameworks, namely Jackson, Kryo, and XStream.
For Jackson, they helped with reviews, for Kryo and XStream they provided pull requests.
Thanks (in part) to their contributions, the recent versions of these three frameworks now support records.
By the way, as far as I'm aware so does Apache Johnzon.

If you're interested to learn more about why records and serialization are such a good match or how Julia and Chris implemented these features, check out [their blog post](https://inside.java/2021/04/06/record-serialization-in-practise/) on Inside Java - link below.


## JDK 17

I really like the changes that went into JDK 16 and will make sure to cover more of them in the coming episodes.
If you don't want to miss that, make sure to subscribe.
But I also want to take a look at the near future, which is JDK 17.
Two things happened here recently.

For one, [JDK Enhancement Proposal 356](https://openjdk.java.net/jeps/356) was just targeted at version 17 - in fact, it was [already merged](https://github.com/openjdk/jdk/pull/1292).
It streamlines, improves, and extends Java's various random number generators.

Then, [the release schedule](http://jdk.java.net/17/) was finalized:
JDK 17 will be forked from the main line on June 10th.
That means from that point on, development will prioritize bug fixes over new features.
The final release candidate is planned for August 19th and general availability for September 14th.


## Outro

And that's it for today on the Inside Java Newscast.
If you have any questions about what I covered in this episode, ask ahead in the comments below and if you like this kind of content help us spread the word with a like or sharing it with friends and colleagues.
I'll see you again in two weeks.
So long...

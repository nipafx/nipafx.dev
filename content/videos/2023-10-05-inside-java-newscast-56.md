---
title: "New Class-File API Will Make Java Updates Easier - Inside Java Newscast #56"
tags: [java-next, migration]
date: 2023-10-05
slug: inside-java-newscast-56
videoSlug: inside-java-newscast-56
description: "How the new class-file API that Brian Goetz presented at JVMLS will greatly improve the situation around Java updates"
featuredImage: inside-java-newscast-56
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're going to discuss how an API that you'll never use will make your life much easier... in, like, 3 or 4 years at the earliest.
For that to make sense, we need to quickly recap what bytecode is, how it's getting manipulated, why that complicates Java updates, and, finally, how the new class-file API can improve that situation.
If you already know some of that, remember that you can use chapters to navigate to what's news to you.

Ready?
Then let's dive right in!

## Bytecode Basics

Java bytecode is the instruction set for the Java Virtual Machine, consisting of operations like creating objects and arrays, copying variable values or references between stack and registers, invoking methods, computing arithmetic operations, etc.
Those `.class` files that the compiler generates from your Java code?
They contain bytecode.
And sooner or later we throw it at a Java runtime, where the class loader will load, parse, and verify it, before passing it on to the JVM, which executes it.
And that's your Java code doing its thing - in a simple world, the story would end there.

But in the real world, we want more!
More performance, for example.
So we have the just-in-time compiler that turns bytecode into machine code.
We have class-data sharing to cut down on the work the class loader has to do.
More on that in this excellent Stack Walker episode.
We have Graal native image that basically takes all of this and turns it into an executable.
But we can ignore all these optimizations today.

What we also want more of is flexibility and this is where bytecode manipulation comes in.

## Bytecode Manipulation Basics

Because bytecode can be generated, viewed, and changed every step of the way.
Frameworks like Micronaut and Quarkus generate bytecode when your project gets built to avoid reflection at runtime.
A tool like `jdeps` can parse it to analyze dependencies, many static analyzers like SpotBugs don't actually analyze source code but bytecode, and an agent may manipulate it when it's loaded into the class loader, for example to gather performance numbers like New Relic does.
And even, or rather particularly, at runtime tools and frameworks go ham, like Hibernate generating proxies to redirect calls and Mockito adding behavior according to your prescription.

<contentimage slug="class-file-api-bytecode" options="narrow bg"></contentimage>

What all of these tools have in common is that they need to understand the bytecode they're working with.
They mostly don't do that themselves, though, but rely on a set of bytecode libraries, which are dedicated to parsing, generating, and manipulating it.
A big player in this space is ASM, even if often only used indirectly: Mockito, for example, uses it via ByteBuddy, Spring, on the other hand, uses it via CGLIB.

So, in other words, bytecode libraries like ASM need to understand the bytecode they're working with.
Which would be no issue if bytecode never changed.
But it does and that _is_ an issue.

## Migration Pains

Java is evolving and that's not limited to the language and APIs.
Specifically, the bytecode evolves, too - in a backwards compatible manner of course but that doesn't preclude adding new operations or information.
In fact, the bytecode version, or "level" as it is more commonly called, is encoded in each class file and currently increases with each Java release - for Java 21, that's level 65.

And because the aforementioned bytecode libraries need to understand what they're processing, they look for that number and check whether they understand that level.
If they do, great!
If not, they have two choices and neither is really good:

* They can give up, which means the program that tasked them with working on the bytecode will very likely not be able to proceed.#
  You've probably seen those error stack traces.
* Or they can cross their fingers and hope nothing breaks when they do their thing, which... well, you can probably tell that that's not great either.

And herein lies the problem.
Imagine you have a Spring Boot app that depends on an ASM version that works up to bytecode level 65.
Then you're good to go up to Java 21.
But what happens when you want to move to 22 in March or to 25 in 2025?
Then you need to update at least ASM, which... you can't because Spring, like many many other frameworks, shades it.
So you need up update Spring Boot or in other words most of your dependencies, which... pardon my French, but that sucks!
You should absolutely be able to update the Java version without having to update the rest of your dependency tree!

<contentimage slug="class-file-api-web-app-asm" options="narrow bg"></contentimage>

But at the moment, that's still what is often necessary, which is why step zero is always: update your dependencies and tools.
So one ingredient in making Java updates easier is to decouple these frameworks from the bytecode level.
And that's where the new API comes in.

## Class-file API

At JVMLS, the Java Virtual Machine Language Summit, Brian Goetz presented the class-file API, a JDK API for reading, transforming, and generating bytecode.
The talk is super interesting and I strongly recommend you watch the recording - if not for the API itself, then just to see how Brian tackled the design process.

<contentvideo slug="jvmls-2023-class-file-api"></contentvideo>

I'm not gonna go into the API here, though.
If you want to learn how it works, there's a link to the JDK Enhancement Proposal in the description.
Or maybe Jose will make a JEP Cafe about it.
Let us know in the comments if you'd be interested in that.

## Alleviating Migration Pains

What we're focusing on here is its impact on the ecosystem.
Because this API has one critical advantage over ASM and the like:
It's always up to date with the bytecode!

That will not remove all update considerations:
Some use cases may still struggle when the API spits out bytecodes or constant pool entries or whatever that they're not aware of, but most use cases won't have a problem and so their update path is cleared.

Going back to our Spring Boot example:
If Spring Boot would already use the new API instead of ASM on Java 21 (which they can't, it*s just a hypothetical), the app can update to Java 22 or 25 without updating Spring Boot because it will of course use the new version of the API, which of course works just fine with the Java 22 or 25 bytecode.
So if the new API is good enough to allow frameworks like Hibernate and tools like ByteBuddy to move away from 3rd-party bytecode libraries, you won't have to update most of your dependency tree just because you want to move to a newer Java version.
And that's how it should be!

<contentimage slug="class-file-api-web-app" options="narrow bg"></contentimage>

## Timeline

So when will this happen?
At the time of recording, the JEP is not yet targeted but the JVMLS talk gave me the impression that the API is pretty mature, so I'm hoping for a preview in 2024 and hopefully a finalization by Java 25, the next version that gets long-term support.
Hopefully, during that time frame, frameworks and tools could start releasing multi-release JARs that use the new API, so when you do your update rush in late 2025 for Java 25, your stack could start working with the new API.
And it's the next Java update after that, either 26 in March 2026 or 29 in September 2027, when you start benefiting from it because then you have one less reason to bump anything but your Java version if that's what you want to do.
So... 3 to 4 years at the earliest - Java is definitely playing the long game.

## Outro

A note before we close this episode out with a fun quote from Brian:
I focused exclusively on the ecosystem aspect of this API but that is not at all the only reason it was introduced.
There's much more to it and the JEP and the JVMLS talk give details on that.

And that's it for today on the Inside Java Newscast.
In two weeks we'll answer the questions you sent us for the AMA - subscribe and click the bell, so you don't miss that.
And while you're down there, give this video a like - it really helps getting it in front of more Java developers.
Thanks and so long...

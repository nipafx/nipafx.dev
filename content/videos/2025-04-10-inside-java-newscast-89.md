---
title: "JavaOne'25 Highlights - Inside Java Newscast #89"
tags: [community, performance, maven, ai, valhalla]
date: 2025-04-10
slug: inside-java-newscast-89
videoSlug: inside-java-newscast-89
description: "JavaOne 2025 had lots of talks from OpenJDK insiders as well as from community experts - here are some of the highlights"
featuredImage: inside-java-newscast-89
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today I'm gonna share with you:

* an explanation for why _not_ to use unit tests for AOT training runs on JDK 24
* a garbage collection primer and comparison
* two tips on how to analyze your Maven build
* the announcement that `final` will eventually mean _really_ final and how to simulate that today
* a detailed look at how to build an advanced retrieval augmenter for querying AI models
* and last but not least, the roadmap for value types and null restriction, but no timeline, so don't get too excited

All of this and so much more was discussed at JavaOne 2025 a few weeks ago, where we had lots of talks from both OpenJDK insiders as well as from community experts.
A few recordings are already online, the others will be published over the coming weeks - subscribe or track this playlist if you don't want to miss them.

Ready?
Then let's dive right in.


## Unit Tests for AOT Training Runs

During one of our live streams, I talked to Dan Heidinga, who works on Project Leyden, about ahead-of-time class loading and linking in JDK 24 and specifically about training runs when he told me this:

> The big thing you want to avoid with a training run is loading classes that you don't need in your production run.
> So if your benchmark loads a whole bunch of classes that will never be used in production that may not be the best training run.

> That also excludes unit tests by definition right because like the entire unit testing framework and assertion libraries and all of that is in there.

> It does.
> There are probably ways you can configure things to make that more useful because what we've done so far and what we've shipped in JDK 24 optimizes the three built-in class loaders.
> So, the system loader, the application loader, and the extension loader.

So unit tests are not only questionable training runs because they execute the application code very differently from a production run, with a default configuration they also pollute the cache with lots of unnecessary classes.
I think the configuration Dan has in mind to fix this would load your application code into the application class loader but the testing framework, assertion library, etc. into a custom class loader that the AOT cache would ignore.


## GC Primer and Comparison

There were a bunch of really good talks about garbage collection.
The segment I picked here is pretty early in Stefan Johansson's talk.
He gives a high-level overview over GC performance aspects and the strengths of each OpenJDK GC:

> In many cases we talk about three different aspects here:
>
> * The first being _throughput_ - you care mostly about throughput.
>   And what we mean by that is the number of transactions that you can complete in a set amount of time.
> * Then we also have _latency_, which is more about a single transaction.
>   Is that affected by, say for example, a GC pause, the latency can be bad and the transaction can take a long time.
> * And then we have _footprint_ - the overhead caused by the GC algorithm.
>
> It's very hard to optimize for all of these at once, so usually we have to do a lot of trade-offs.
> And if we try to illustrate a trade-off, it can look something like this:
> We have a set of application threads.
> At some point, we realize we need to do garbage collection work.
> We do this in a GC pause using multiple threads, trying to make sure that the GC pause is as short as possible before letting the application threads run again.
>
> This is pretty good from a throughput perspective because when the application threads run, no GC work is going on, so you don't have to compete for CPU resources.
> On the other hand, from a latency point of view, it's not optimal because we have the GC pauses and they take a significant amount of time.
>
> So if we care more about latency, we can have something that looks a bit more like this:
> So, again, we have the application threads, but when we realize we need to do garbage collection work, we do a very short GC pause and instead do the heavy GC work concurrently with the Java application threads running.
> So from a throughput perspective, this might be a little bit worse because the GC threads and the application threads compete for the same resources.
> On the other hand, latency-wise it's much better because the GC pauses are much much shorter.
>
> In Open JDK today, we have five different garbage collectors:
>
> * We have _Serial_, which has a main focus on low memory overhead.
> * We have _Parallel_, which is a throughput-collector aiming to provide as good throughput as possible.
> * We have _G1_, or the _Garbage First_ collector, which has a balanced performance profile.
> * And then we have _ZGC_ and _Shenandoah_, which both aim at providing good low latency alternatives for Java

Stefan then dives deeper into performance improvements of these GCs across Java versions and recounts the positive outcomes Netflix, Mercado Libre, LinkedIn, and OCI had when upgrading their runtimes.
Another great talk in this space that I can recommend is from Erik Osterlund on ZGC.


## Analyze Your Maven Build

Have you ever been confused by your Maven build?
Maybe why it's taking so long?
If not, I can only assume, you've never used Maven - and I'm not hating on it, it's just that real-life projects tend to get messy and their builds are no exception.
Watch Richard Fichtner use an extension and a plugin to gain some insights.

> We need something special and this time it's not a Maven plugin, we need an extension.
> So what's the difference between a plugin and extension?
> An extension is better, bigger, and can see the class loader for the plugins because we need that to profile the plugins.
>
> Let me show you how this looks: looks something like this.
> We will create a file called `extensions.xml` - looks like this.
> So very similar to a plugin and you put it in the `.maven` folder of your project and it's in Git, so it's in version control, so you don't have to touch the build server, the CI, nothing.
> So this is now there.
> But be cautious as they have a lot of rights and access - don't trust everything.
> I know this is a good plugin because this is from Karl-Heinz Marbaise.
>
> And let's do `mvn verify` first, of course.
> Okay, we get some things.
> I get some numbers for my pizza backend and it tells me "okay, there's a lot of things going on" and how much each phase took.
>
> And to understand that a little bit better, we can use a build plan plugin to see what is happening.
> And this was very good for me to see this when I saw it the first time to better understand what is happening and this plugin has more goals with other outputs.
> And here you can see that in the _validate_ phase we have two plugins registered that will run when I do `validate`.
> When I do `compile`, basically everything before that runs and you can see actually what's going on.
> In this example, of course, this is easy, this is not the real world.
> Run this on your project that you're working on day-to-day and you will see crazy things if the project is older than maybe 10 days.

If you're wondering about the short burst of music during his build or why to prever `mvn verify` oder `mvn clean install`, don't miss his talk.


## Truly Final

I also recorded two long conversations that will end up as episodes of the Inside Java Podcast, which you can find pretty much everywhere but just to make sure, there's a link in the description.
One was with Mark Reinhold who dropped big news and then preempted their announcement here by publishing a JEP draft a few days after JavaOne.
Not cool, Mark!

> There's a new API called stable values, which does a few things, but mainly the idea is to have finality for something that is initialized late.
> But that then is really, _really_ final just like the record components are really, _really_ final and I'm going to go out and guess that probably Valhalla's value types' fields are also really, _really_ final.

> They are so final you wouldn't believe how final those fields are.

> Is there any way to backport that?
> Like, could you give me a flag where I say I want `final` to mean _final_ and, you know, screw the code in my codebase or my dependencies that doesn't respect that.
> Because, you know, in that case I guess `setAccessible` would throw an exception, so I would probably find out at runtime if I had a problem.

> There is a JVM flag...
> I forget what its name is... starts with the letters `XX`.

> Okay, we'll put it on screen, maybe here, in post-production.
> But, so, are there ideas to make TrustFinal an option or maybe even the default?

> Oh, no, we plan to make it the default over time and there is a JEP already to prepare to make final fields mean final.

> Oh really there's a JEP?
> A JEP draft, I hope at least, otherwise I would feel kind of ashamed that I don't know that.

> Okay, so just delete this in post-production - I'll look it up.


## Building Advanced RAG

As you can imagine, a big chunk of talks related to AI in some way, shape, or form.
From OpenJDK's code reflection and HAT to various frameworks, from the announcement of Oracle Code Assist to coding guidelines and security concerns - just so much AI.
I picked a short section from Lize Raes's and Mohamed Ait Abderrahman's presentation of a research agent where they explain how they build its advanced retrieval augmentation pipeline, which is essential to get the best possible replies from the AI model you'll eventually query.

> To mitigate all these little problems, we came up with this retrieval augmenter in LangChain4j, so instead of just a content retriever we now have the augmenter.
> It's all interfaces, so if you want to build your own version of it, you can.
> I've put underneath our default implementations that you can easily use.
>
> So let's start in the middle there with content retrievers.
> Instead of having one content retriever that searches in your documents, you can have multiple ones and they can also do more things.
> So we have an embedding store that's going to search in your documents but you also have graph RAG, SQL, and a web search engine coming out of the box.
> You can write your own one for any API calls, for example if you wanted a weather service.
>
> Now, how do we know which content retrievers to pick?
> There's a query router in front of that, typically also powered by an LLM, that's going to say "Oh given this query and given all these content retrievers I have, I'm going to send it there or there or to multiple at the same time."
> And it's going to also rewrite your query because a web search query of course is very different from an SQL query and LLMs can write proper queries.
>
> Then, in front we have this query transformer that I talked about before.
> The compressing query transformer will take your history into account to make a sensible question and not just "yes, please".
> Expanding query transformer will make it into even more questions so it's sure to find the answer.
>
> At the other side, once the content pieces are retrieved, we can just put them together in the default content aggregator - it's just going to put one after the other.
> But very often there are pieces in there that are irrelevant to the question after all and typically they will confuse your model and your model will answer something that had nothing to do with the original question, you will wonder why.
> Well it's because RAG found pieces that were, like for example, if it has started talking about the book it found there, it could have happened.
>
> So we also added a re-ranking content aggregator.
> It calls a small scoring model that has one function "How relevant is this piece of content to the question" and it will kick out everything that's not relevant enough.
>  Content injector will just add the original question and all the pieces of information that are important, too, and that's what is sent off to the model.


## Valhalla Roadmap

Even though he won't say it, Brian is giving off strong "Valhalla soon" vibes.
In his talk about Java's language evolution, he even went so far to show a roadmap, meaning a list of JDK Enhancement Proposals that cover Valhalla's first feature arc and the order in which he expects them to land.

> So, there's a bunch of JEPs on the road map, some of them have numbers, some of them don't yet have numbers.
> JEP 401 is the first piece - It's basically value classes and that's it.
> And that is well underway:
>
> * the spec has been stable for over a year
> * we're just polishing the implementation
> * there's a second early access coming out fairly soon
>
> And then, you know, looking a little farther down the road there's null restricted types as a concept on their own, there's null restricted types in the context of value types, which adds in some interactions and optimizations, and then there's sort of a cleanup-JEP to minimize the gap between the legacy primitives and the null-restricted variant of their box types.
> And I'm sure these are not going to be the only four.

Cool, cool, can't wait.
But now I'm heading off to a holiday, which means that in two weeks you'll have to make do with Billy.
Say "hi" to him from me, maybe make a joke about the monstrosity he calls a haircut, and I'll see you again in May.
So long...

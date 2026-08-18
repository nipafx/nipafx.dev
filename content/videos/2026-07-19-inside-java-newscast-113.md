---
title: "JDK 27 & Valhalla, Now! - Inside Java Newscast #113"
tags: [java-27, java-28, project-valhalla, project-babylon, project-leyden, community, meta]
date: 2026-07-19
slug: inside-java-newscast-113
videoSlug: inside-java-newscast-113
description: "JDK 27 entered RDP1, Valhalla's JEP 401 is being merged into JDK main, join our hackathon, and more"
featuredImage: inside-java-newscast-113
---

Hey, long time, no see.
It has been a while since I recorded an Inside Java Newscast - some of that pause was intentional, some not so much.
Either way, I still thought a lot about this little YouTube show because after going strong for over five years, the environment has changed to the point where I think it has to change with it.
I'll go into a bit more detail at the end of the episode - for now, you need to know that instead of going deep into a single topic, we'll instead go broader and touch on a few different ones.
I hope you appreciate the new format - either way, let me know in the comments.

<!-- intro -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're going to go over (in order):

* the JDK 27 feature freeze
* Valhalla's timeline for JDK 28
* a hackathon
* how AOT computation interacts with agents
* and how Babylon can make use of GPU tensor cores in a portable manner

As always, links to everything are in the description, right below the like button.
Ready?
Then let's dive right in!


## JDK 27

[JDK 27](https://openjdk.org/projects/jdk/27/)'s Ramp-Down-Phase 1 started in early June, which means its features are set in stone.

For the language, the only change is the fifth preview of primitive types in patterns.

The runtime sees two new defaults and one additions:

* G1 is now the true default garbage collector, being selected in all environments, even in those with only a single CPU or limited RAM, where Serial GC used to be selected.
  Serial is not going anywhere, though, so in case G1 doesn't suit your application, you can of course still select Serial GC.
* Similarly, compact object headers are now the default, which reduces heap space overhead and, through reduced GC pressure and better cache locality, can also improve overall performance.
  The old behavior remains configurable, in case of performance regressions.
  If you observe those, I recommend to report them to the HotSpot mailing list.
* And then there's JDK Flight Recorder's new data redaction, where JFR will automatically redact many kinds of sensitive information and will allow you to manually configure command-line arguments, environment variables, and system properties that should be redacted as well.

With that, we come to API additions, which make up the bulk of JDK 27:

* The JDK's TLS 1.3 implementation now supports three new post-quantum hybrid key exchange schemes.
* The PEM API sees a number of changes that require a third preview.
* The LazyConstant API also goes into its third preview with minor changes that remove its imperative API and add lazy sets.
* The structured concurrency API sees is seventh preview due to another set of interesting changes, one of them the addition of a generic type parameter for the type of exception thrown by `join`.
* And, finally, there's of course the vector API, which is still waiting for Valhalla's new value types.

Speaking of which, let's talk about the most exciting Java news of the year, so far.


## Valhalla, Now!

In June, right after JDK 27 branched off of the JDK's main line, Valhalla committer Lois Foltan sent [a mail to the jdk-dev mailing list](https://mail.openjdk.org/archives/list/jdk-dev@openjdk.org/thread/AIA3O3LHFZ6T7TIPH7KZT4WS4B6U72U5/).
In it, she announced the integration of JEPs [401 (that's value types)](https://openjdk.org/jeps/401) and [539 (strict field initialization)](https://openjdk.org/jeps/539) into main.
The mail linked to [a pull request](https://github.com/openjdk/jdk/pull/31120) that is about as large as you'd expect.
It has a bit over 2,900 commits that add over 200,000 lines in almost 1,900 files that touch pretty much everything in the JDK - from javac to JIT, from GCs to AOT, from APIs to tooling.
Specialists in these areas are currently reviewing the related changes and are slowly ticking off all the boxes for a merge.
Assuming nothing unexpected happens, this work should complete over the coming weeks, and then you can grab a JDK 28 early-access build, flip the preview switch and start creating value types.

I want to manage expectations, though.
JEP 401 gives us identity-less types that open up a lot of room for the runtime to optimize and some of those optimizations are already implemented in this pull request, but more language changes are required to enlarge that optimization space, particularly with regards to flattening references, and a lot of work still needs to be done to implement these optimization.
JEP 401 is neither intended nor capable to fulfill all expectations we may have for Project Valhalla at large.
So, this is just the first step to Valhalla and far from the last.


## Modern Java in the Wild

We just talked about JDKs 27 and 28, but the current release is 26 and if you want to show off what cool things you can build with it, I got something for you!
[_Modern Java in the Wild_ is a hackathon](https://www.hackster.io/contests/modern-java-in-the-wild) that invites you to develop a Java app in one of three large categories - health, hobby, or home - on any device you like, from smart watches to backend servers.
Whether you want to track running stats or the trajectory of NASA spacecraft, want to improve your rock climbing form or vacation planning, have an idea that uses AI or smart home devices - the sky is the limit.

_Modern Java in the Wild_ is hosted on hackster.io, link in the description, but you need to be 18+ and in the US to participate, limitations that we hope to lift the next time around.
Submissions close on August 2nd and winners are announced in early September.
Oh, and there are prizes to win, in case just the fame doesn't do it for you.


## AOT vs Agents

If you explored Project Leyden's ahead-of-time features that have been added in recent releases, you have probably come across their limitation with regards to agents - not the AI kind; the kind that you launch with your application or attach later and that can modify its behavior.
They're often called JVMTI agents or Java agents, which I recently learned are not exactly the same thing.
And I learned that from [an interesting JDK issue](https://bugs.openjdk.org/browse/JDK-8387190) that Ioi Lam opened and that documents the current state on agents and the AOT cache in good detail and a very approachable language.
I highly recommend you give it a read.
Here, I just want to quote the best practices it recommends.

> With JDK 27, we recommend doing the following:
>
> * In the AOT training run, do not use agents.
>   Agents may change the behavior of the application.
>   As a result, we may end up with an inaccurate profile that will affect the performance of the AOT cache.
>   This is especially true for agents that transform classes.
> * In the AOT assembly phase, do not specify agents.
>   (They will be ignored anyway.)
> * In the AOT production run, Java agents can be used.
>   Note that native agents aren't supported until [JDK-8387194](https://bugs.openjdk.org/browse/JDK-8387194) is fixed.

Link to the issue below.


## Exploiting GPU Tensor Cores

The last thing I have for you is an article by Juan Fumero, titled [_Exploiting GPU Tensor Cores from Java using Babylon_](https://openjdk.org/projects/babylon/articles/hat-tensors/hat-tensors).
From the abstract:

> The goal of this article is twofold.
> First, we show that Java programs can reach close-to-native performance for matrix-multiply computations on hardware with accelerated MMA support, such as NVIDIA GPUs.
> Second, we study how the same Java Tensor API can be mapped across different parallel programming models and vendors while remaining portable for both, source code and runtime scheduling parameters.
>
> To support this approach, we extended the Heterogeneous Accelerator Toolkit (HAT), a parallel programming framework to accelerate data-parallel workloads on hardware accelerators, with a tensor-aware API and a set of code transformations using the code reflection API from the OpenJDK Project Babylon.
>
> Finally, we evaluate the performance of the system using the HAT Tensor API from Java in the context of two GPU platforms, an Apple M4 Max GPU and an NVIDIA Ampere A10 GPU.
> We show that, by enabling tensor cores on supported hardware (NVIDIA), we can speed up the naïve matrix multiplication kernel from 240 GFLOP/s to 7.3 TFLOP/s, while the application remains portable to run on Apple M4 GPU via OpenCL 1.2, where with some parameter tuning, we can increase performance by 8x over the naïve matrix-multiplication.

If this is something that interests you, check out Juan's article, which is very well written, has a bunch of helpful diagrams, and a lot of code.


## Inside Java Newscasts

Ok, so let's talk about the show a bit.
I mentioned in the opening that the environment changed in the last five years - here's a quick rundown of what I mean by that, in no particular order:

* The rise of AI chat bots leads to an increasing number of people learning through them about new information instead of watching YouTube videos.
* The rise or at least the promise of competent coding agents means that fewer people feel the need to know all the details about a new feature or API and are more interested in its shape and use cases to know _when_ to employ it and not necessarily _how_ exactly.
* Then there's a general trend toward more short-form content, both on the audience and on YouTube's side.

Of course those three things don't necessarily mean that original, long-form content is doomed, but I want to point out that this show is not original.
Quite the opposite, by design it synthesizes and reframes publicly available information, something even AI pessimists like I must admit, chat bots are doing a good job of.
And if I felt something's lacking in a JEP or Javadoc or whatever, a more efficient way to get the knowledge out there is to write about it than to make a video.

On top of that come two internal evolutions:

* Technical conversations with Java architects and community members provide original insights and are well-received and so we expanded the Inside Java Podcast to the point where we will soon have ~3 episodes per month plus this show as a podcast.
  And that takes some time, of course.
* Oracle's layoffs meant that existing work had to be reshuffled and I simply have more items on my TODO list now than I had half a year ago.

So, taking all that together, it is harder for me to supply you with a biweekly show while at the same time, the interest in such a show is waning.
And so I decided to make a few changes:

* The Inside Java Newscast will become a monthly show and move to the weekend for easier consumption during down time.
* As you've already experienced, it will aim for the same ~10-minute run time but go broad on a few different topics that happened in the last month instead of diving deep into just one.

There's plenty more to say on all this but I don't want to bore you to death with inside baseball.
I'm super interested in your thoughts, though, so please share them with me in the comments.
See you down there - so long...

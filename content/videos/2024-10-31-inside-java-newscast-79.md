---
title: "Release Your (Java) Projects Like OpenJDK With Tip & Tail - Inside Java Newscast #79"
tags: [openjdk, community, migration]
date: 2024-10-31
slug: inside-java-newscast-79
videoSlug: inside-java-newscast-79
description: "\"Tip & tail is a release model for  software libraries that gives application developers a better experience while helping library developers innovate faster\""
featuredImage: inside-java-newscast-79
---

Every experienced developer knows, when it comes to managing dependencies, here be dragons.
Minor updates can come with major changes, unbreakable diamonds get you stuck, and seemingly small updates ripple through the entire dependency tree.
Being a dependency makes everything worse:
Now you're also worrying about release trains, feature backports, and security patches.

Much of this complexity is inherent in a rich and diverse ecosystem like Java's but that doesn't mean there isn't still room for improvement.
In 2018, OpenJDK itself set out to tame its dragon and a few weeks ago, it shared its success story.
Now it's time for us to do the same.

<!-- logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're going to discuss the "Tip & Tail" model, OpenJDK's solution to its own development and release challenges and its proposal for how the wider ecosystem may overcome theirs, too.
This is laid out in JDK Enhancement Proposal 14, which should be seen as a conversation starter on this topic.
Ready?
Then lets dive right in!

## Defining Tip & Tail

So what is "tip & tail" and how does it work?
The JEP does a great job at explaining that in its first few lines:

> Tip & tail is a release model for software libraries that gives application developers a better experience while helping library developers innovate faster.
> The _tip_ release of a library contains new features and bug fixes, while _tail_ releases contain only critical bug fixes.
> As little as possible is backported from the tip to the tails.

So in practice that means that a project following T&T has a main development branch, called the _tip_, from which new versions are released as they would be today: major, minor, patch versions (if you use semantic versioning) - doesn't matter.
But every now and then, at the maintainers' discretion, a new release branch is cut from the main branch and that's called a _tail_.
So those terms aside, so far, so common for every project that supports several release trains.
What's essential to T&T is what additions to the tip get backported to the tails: barely anything.

* no features
* no performance improvements
* only critical bug fixes
* but all security fixes

This means, there will only ever be patch releases from a tail.
I'll get to why that's so crucial in a minute but there's another important difference between tips and tails that you need to know about, too, and that's their dependencies:
A project's tip can pick and choose whether to require its dependencies' tip or tail releases - more about that choice later.
But a tail should only depend on the tail releases of each dependency.

So a tip has a development style, releases, and dependencies that are common for most projects today whereas the tails only see backports of security and critical bug fixes, only release what semantic versioning would call patch versions, and only depend on other tails.
And that's how you tame the dragon!

## Benefits for Users & Maintainers

Ok, that was tip & tail in a nutshell, now let's discuss why - why propose this, what are the intended benefits?
And let's start at the tail.
The minimal amount of backports plus the limitation of only depending on other tails means that users of a tail release are guaranteed continued and hassle-free security and critical bug fixes.

Imagine an application that either sets out with a conservative dependency management approach or adopts it when main feature development is done and it enters maintenance mode.
By picking tails of all of its dependencies, it can no longer run into issues where, for example, a fix for a critical bug or a vulnerability is only available in a new major version and now it has to make the difficult decision of either running an unreliable or unsafe dependency or accepting the churn that comes from updating.
Or the situation where a patch update pulls in a minor update of its dependency, which pulls in a major update of _its_ dependency, causing a butterfly effect that leads to an entirely different dependency tree and all the instability that comes with that.
So that's good for users interested in stability.

At the same time, the minimal amount of backports makes tail releases very cheap to maintain, to the point where even smaller projects can support multiple release trains.
That means they don't have to make their main development line, the tip, work across JDKs 8 to 23, for example.
Doing that is a continued drag on many projects as it keeps them from using JDK features that would make them more productive and from offering their users the best possible integration with new features.
Instead, a project can have a tip on, say, JDK 21 with tails for JDKs 8, 11, and 17.
That sounds like a lot more work, but remember that those tails cause minimal effort and the tip can use and support new JDK features directly, which makes development more efficient.

In this scenario, library maintainers can drive the tip ever-forward and deliver the best possible version of their idea without being held back by an outdated JDK.
Whether it's virtual threads, pattern matching, the FFM API, value classes once they come out - maintainers can adopt these features as soon as they're released, all the while ensuring that tails are safe and sound on older JDKs.

Users, on the other hand, can decide what they value most.
If it's stability, they can can get more of that by depending on tail releases.
If it's innovation they want, they can get more of that by depending on tip releases.
And if they want both, they can't have it (for the same dependency), and a decent chunk of the dependency management complexity comes from the illusion to the contrary, comes from users expecting and developers trying to maintain release trains that are stable and innovative, that work on JDK 8 but also support new language features and APIs and deal with ongoing deprecations and removals.
Tip & Tail accepts that stability and innovation are at odds and offers a method that allows users to decide what they prefer and maintainers to provide release trains for each demographic.
This, as JEP 14 puts it, "helps the Java ecosystem maintain the balance between innovating rapidly for new development and ensuring stability for long-term deployments".

## Managing Tip & Tail Dependencies

There's a lot more to talk about on this topic and I will get to a few aspects in a second but before that I want to implore you, particularly if you're maintaining an open source library, to read JEP 14 and consider adopting tip and tail for your projects.
I truly believe that this approach may solve some of the issues we've seen in the Java ecosystem over the last few years and make it more coherent, more well-structured, more innovative, _and_ more stable.

One aspect is probably very obvious, but let me state it anyway:
Since version 9, the JDK has followed this model.
It creates a new tip release every six months and every few releases (so far 11, 17, and 21) become tails with long-term support from multiple vendors, which is reflected in continuous security and critical bug fixes, usually as backports from the main branch.

So when I said tails should depend on tails, that included the JDK and a project's tail release should be baselined against a JDK version with LTS.
And it really is enough to work on one of those - tails don't need to work on a matrix of JDK versions, particularly not if a project indeed creates a tail per JDK with LTS.
If users upgrade form JDK 11 to 21, for example, they can be expected to upgrade other dependencies as well.

Speaking of dependencies, earlier I mentioned that a tip's dependencies can be either tips or tails.
Each project will have to figure out the details on their own, but here are a two observations to help with that:

1. The more tips your tip depends on, the more time it will take for them to release a respective tail when you want to create your own tail.
2. A tip is encouraged to update a dependency, including on the JDK, from an old tail to a newer one or from a tail even to a tip as soon as it can benefit from that, for example when:
	* the newer version offers a feature it wants to use or integrate with
	* the newer version contains a change, like the removal of a deprecated API, that makes it non-trivial to support the old and new version side by side

Remember, don't jump through hoops to support multiple versions.
Pick the newer one and consider a new tail for the older one you leave behind.

## Nomenclature & Lightning Round

One last thing before a quick lightning round:
While Tip & Tail can remove a chunk of the complexity of managing dependencies, there's still a lot of it left, not least because much of it is inherent in such a rich and diverse ecosystem.
The diamond problem, for example, will remain alive and well, a dragon for another day.

But what Tip & Tail also offers is structure and nomenclature - a shared vocabulary to express intent and expectations and to discuss challenges.
While investigating this topic, I came up with a number of "failure cases", where a T&T dependency tree would go up in flames, but I eventually realized that these cases exist regardless of T&T - it's just harder to clearly describe them and attribute a cause.
So even when it can't fix issues, Tip & Tail can help us understand them.

Ok, lightning round:

1. What I said about depending on the JDK tip vs tail, for example when to move on and not to jump through hoops to support multiple versions, also applies to a project's other dependencies.
2. Tip & tail does not specify when or why tail trains are created, nor when or why they are discontinued.
3. Tip & tail does not constrain a library's release cycle.
4. Tip & tail does not dictate a version numbering scheme - for example, it says nothing about semantic versioning even though I've used that as an example a lot in this video.
   It says nothing about the use of alpha/beta/release-candidate labels or any other metadata about the library.
5. I'll see you again in two weeks.
6. So long...

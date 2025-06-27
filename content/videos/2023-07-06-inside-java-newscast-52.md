---
title: "Java 21 is no LTS Version - Inside Java Newscast #52"
tags: [java-21]
date: 2023-07-06
slug: inside-java-newscast-52
videoSlug: inside-java-newscast-52
description: "Let's separate Java from JDK, OpenJDK from its vendors, and maintenance from support, so we better understand how the ecosystem functions and what long-term support really means."
featuredImage: inside-java-newscast-52
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and I'm bringing bad news: Java 21 is no long-term-support version.

Ok, I'm not gonna beat around the bush here.
You'll find plenty of JDK 21 builds that get free, timely updates for the coming years - Oracle JDK 21, for example.
And you will find plenty of companies that give you extensive support for their builds - Oracle, for example.
But that doesn't make Java 21 a _long-term support version_, just like 17 and 11 weren't _LTS versions_.

And while that detail doesn't matter if all you care about is writing code, you'd not be watching this channel if that were all you're interested in.
So let's geek out a bit and separate Java from JDK, OpenJDK from its vendors, maintenance from support, so we better understand how the ecosystem functions.
And lets get me some new milk while we're at it.
Ready?
Then let's dive right in!

## Java vs JDK

First things first:
Java 21 isn't anything, except possibly a shortcut for _Java Platform, Standard Edition 21_.

But you can't download that - it's not a binary, it's not code.
It's a set of specifications that define the behavior of a language, its API, a virtual machine, and a few more things.
The thing that gets new commits is the Java Development Kit, the JDK, in this situation specifically JDK 21.

That's a code base that contains the reference implementation of the Java SE 21 specification.
It's developed by OpenJDK and can hence be found on github.com/openjdk/jdk21.
That code base gets updates until JDK 21 is released.
At that point, OpenJDK no longer _has to_ concern itself with it.

By the way, I'm saying OpenJDK a lot.
In the briefest of terms, that's a place where a community of individuals work together to create the open source reference implementation of the Java Platform, Standard Edition as well as some related projects.
For much more details on that, I'll refer you to [Inside Java Newscast #28](inside-java-newscast-28).

So what happens when JDK 21 is released?
The fork jdk21 is archived and focus shifts to jdk21u, which contains all the fixes that the community wants to provide for JDK 21 after its release.
And this is where we need to start differentiating between maintenance and support.

<contentimage slug="java-21-no-lts-jdk"></contentimage>

## Maintenance

So what happens to jdk21u?
That's up to the OpenJDK community.
Since the six-month release cadence was implemented, Oracle's Rob McKenna, Project Lead of the JDK Updates Project, was lead maintainer for each jdk$VERSIONu project for its first six months.
After that, he steps down to work on jdk$VERSION+1u and offers the lead maintainer role for jdk$VERSIONu to any trustworthy community member who wants to step up.

For some versions, like 11, 17, and probably 21 that happens and the fork sees continued fixes.
But there are no guarantees that this happens, no contractually defined time span for how long it's kept up, and nobody who's obliged to fix your problem.
It's not an official term but I would call these versions _maintained_.
For other versions, nobody steps up, the fork is closed, and OpenJDK sees no more updates to that version.

Viewed from the perspective of OpenJDK, which version gets maintained and which doesn't appears random, though.
There's no rule that says jdk21u needs a maintenance lead and a community behind them and that jdk20u can't have that.
It just happens - or does it?

<contentimage slug="java-21-no-lts-maintenance"></contentimage>

## Support

Well, of course it doesn't _just happen_.
Maintaining a JDK version is a lot of work and thus requires a considerable amount of time from quite a few people.
Most or even all of them don't do that in their free time - their companies pay them to.
But why would they do that?
Why would companies and large corporations invest valuable resources into maintaining an old JDK update fork?

For many of them, the answer is that it makes business sense because, one way or another, they profit from a well-maintained JDK version.
Be it because they run it in their own cloud, offer software built on Java, sell Java support to their customers, or for a number of other reasons.

Let's focus on support, though.
Exactly which services and guarantees that entails, how much it costs, and how long it lasts differs from vendor to vendor, but the high-level view is that they build a JDK, possibly from the OpenJDK update fork we just talked about plus maybe local replacements or patches, and you pay them for support for that build - potentially for a long time.

And here we are - _this_ is long-term support:
A company's offer to provide services and guarantees for their certified Java implementation, that may or may not be built from an OpenJDK update fork.

<contentimage slug="java-21-no-lts-support"></contentimage>

## Maintenance in OpenJDK vs Support by Vendors

I hope you can see the distinction now.
OpenJDK will maintain JDK 21, the reference implementation of the Java Platform SE 21 specification, within its community and without any guarantees, services, or even builds for at least 6 months, in all likelihood for a few years.
Vendors, on the other hand, will build their own JDKs, often from the OpenJDK code base.
They may make them freely available and on top of them they may offer commercial support, which incentivizes them to contribute to the OpenJDK effort of maintaining these versions.

So instead of "Java 21 is an LTS version", it's "JDK 21 is a version, for which many vendors offer support".
This distinction, just like the one between maintenance and support, might appear pedantic, but it's important when you try to understand the roles of different community members.

Say you buy a carton of milk and upon opening it notice that it spoiled, where do you take it?
To the cows?
To the farmer who milked them?
No, you're going to the party that you paid - the supermarket - and demand from them to fix the problem.
There's probably a lesson in here about getting your milk from a roadside vendor who gives it away for free, but let's not go there.
Instead I want to get back to something I said earlier.

(But, and I know you're wondering:
Yes, the whole setup with the milk and with the hike was just to show you these two cows.
There're usually way more here on that field.
I hope it was worth it.)

<contentimage slug="java-21-no-lts-final"></contentimage>

## A Prisoner's Dilemma

I said earlier that vendors are incentivized to contribute to the OpenJDK effort of maintaining the jdk21u project.
Why is that?
Why do many of them share so much of their work with the wider community?
And why do they mostly support the same versions?
Come September, you won't be able to throw a rock without hitting a company that has offers for JDK 21, but you better not hope anybody will support JDK 20.

Again, there are several reasons, but an important one is that a JDK patch that a company has developed and not shared with the community is generally not an asset, but a liability.
It creates a divergence between their code base and OpenJDK's and the more of that and the larger they are, the more work they will cause.
And while that may be beneficial if a company commercialized a specific offer around such changes, in general such a patch has little benefit, since everybody else probably fixed the same problem.
So in most cases, companies are incentivized to upstream their own patch and, if it didn't make it, remove their own in favor of the one that did.

I like to describe this as an inverse prisoner's dilemma, where everybody profits if they cooperate.
And so while, in theory, every company could offer support for wildly different versions and time spans, they rarely do and instead settle on largely the same versions and time lines.
And I gotta say, given that many companies in the Java community are competitors, sometimes in more than one area, the level of coordination and cooperation this structure creates is astonishing.
Pretty amazing what's going on in the Java community...


## Outro

And that's it for today on the Inside Java Newscast.
I hope you liked it, if so, do all the YouTube things.
The next two episodes will be with Billy and Ana and _then_ the Newscasts are gonna take a little break because we'll have something special for you leading up to the JDK 21 release in September.
I'll probably see you again in a Newscast in October.
So long...

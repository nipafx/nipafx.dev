---
title: "Java 25 is ALSO no LTS Version - Inside Java Newscast #94"
tags: [java-25]
date: 2025-07-03
slug: inside-java-newscast-94
videoSlug: inside-java-newscast-94
description: "Java 25, much like Java 21, will be described as a \"long-term-support version\" despite the fact that that's categorically wrong."
featuredImage: inside-java-newscast-94
---

We've been here before - in this kitchen but also on this topic.
Two years ago, when Java 21 was about to be released, I made a video titled "Java 21 is no LTS Version", which explained how maintenance and support work in the Java ecosystem and why the statement "Java 21 is a long-term-support version" is wrong and should instead be be "JDK 21 is a version, for which many vendors offer long-term support".
It was generally well-received but there was a subset of the audience, some of them among the more widely-known and supposedly better-informed folks in the community, who pushed back against some aspect or other.
Back then I wrote a lengthy reply but then I decided I didn't want to start any drama and put it in the drawer.
Now, two years later, with stagnant Newscast viewership numbers, I need that dra...

Now, two years later, another Java version is about to be mislabeled and I think we could all do with a refresher.
One that sticks to the most salient points and learns from / addresses some of the criticism my first video received - chief among them why this distinction matters, why it is important to talk about this correctly.
This video will be self-contained, but if you want to learn more about OpenJDK or the details of how JDK maintenance and support are provided, check out these two Newscasts.
Now, time for some dra...

<!-- logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about Java 25 and why it's no long-term support version and about JDK 25 and why it's a version with a lot of long-term support - and we'll start with why the distinction matters.
Ready?
Then let's dive right in!

## Why it Matters

The term _support_ comes up a lot in the Java ecosystem, but not everybody who uses it means the same thing.
My understanding aligns with the definition given in the influential 2018 Java Champions article [Java Is Still Free](https://medium.com/@javachampions/java-is-still-free-3-0-0-ocrt-2021-bca75c88d23b):

> Support means a commitment to fix bugs, and it requires staff to answer users’ problems, which costs money.

I don't like to talk about the competition in detail, so forgive me if I keep this a little vague, but say you have some vendor's JDK 11, 17, 21, or soon 25 running on your premise and now something ugly happens that you need them to look at ASAP to fix it - you need support.
With the faulty assumption that these Java releases "are LTS version", that should be easy, right?
Spoiler: It's not.

Some JDKs come without any support, there's never anyone who is obliged to help you out - this is true for a number of free JDK distributions, for example Oracle's builds of OpenJDK that you can get at openjdk.org.
Then there are a bunch of JDKs that you can use for free but to get support, you need to enter some kind of contract.
That's true for Oracle JDK, for example, that you can get from oracle.com/java.
You may also get support if you run a vendor's JDK on their cloud infrastructure but not if you run it on your premise.
And finally, some JDKs are fully commercial, only available through a contract that then also includes support.

But also, beyond "LTS versions" 11, 17, 21, and 25, if you've been using JDKs 13 or 15, you could've gotten 2-3 years support for that from a vendor.
Just one though.
How dare they, these were no "LTS versions"!
Can they just do that?

And what's up with 2-3 years, can anybody just pick how long they maintain these versions?
Apparently, since different vendors offer different support timelines, even for 11, 17, and 21.
How's that all over the map?

Then, if certain Java versions are "LTS", how come the feature selection doesn't align with that?
Maybe those versions should finalize ongoing previews, yet JDK 25 has five non-final features, 21 had seven, and 17 had three.
Or maybe they shouldn't rock the boat, be a stabilization of the previous releases, yet 25 had seven features that showed up for the first time, three in preview, four directly final; 21 had six of those and 17 had five.
It's almost as if the people developing Java don't care about LTS!

There's a final point, more abstract and important, why the details matter and I'll get to that at the end of the video.
Let's leave this list here with the acknowledgment that none of these considerations and the confusion that comes from misunderstanding LTS concern everyday programming.
You can be a great Java dev and not think about any of this ever.
But if you want to understand not just the technology but how it evolves, how the ecosystem works, even just which JDK distribution to pick, this _is_ important.
And it's not very complicated either, you just have to accept that it's not dead simple and read, write, listen, and speak accordingly.
So let's do that!

### This vs That

First a few quick disambiguations, and we'll start with _Java 25_ vs _JDK 25_:
Java 25 isn't really anything, except likely a shortcut for _Java Platform, Standard Edition 25_.
But that's neither a binary nor code.
It's a set of specifications that define the behavior of a language, its API, a virtual machine, and a few other things.
The thing that gets new commits is the Java Development Kit, the JDK, in this situation specifically JDK 25.
It's the reference implementation of the standard and OpenJDK is developing it.
But they don't ship a binary!
(As an aside: that means nobody is "running OpenJDK".)
This is where vendors come in.

So, up next _OpenJDK_ vs _vendors_:
OpenJDK is the place where people collaborate on that reference implementation and related projects.
It has bylaws, development practices, a website, mailing lists, just so many mailing lists - more on all that in this video.
For many people in this community, their work on Java is a full-time job and they get paid for it by companies that do that out of the goodness of their heart.
Nah, I'm just kidding, they earn money with Java and as long as they do and are smart about it, they will keep pushing Java forward, which is a win-win in my book.
And one way how they earn  money is to build a binary that matches the standard, usually from the OpenJDK code base aaaand (thank you) offer support for it.

Remember that support costs money?
Specifically, your money if you choose to pay for it.
"But wait", some of you are typing in the comments, "I use a free distribution with support and don't pay anything".
Eh... you get timely updates for all important issues but you can't rely on getting help if you have a problem, so as per the earlier definition, you don't get support.
The Java Champions article calls this _updates_:

> Updates refer to the code patches (including security) that have gone into OpenJDK and Oracle JDK.

Personally, I prefer the term _maintenance_ but we mean the same thing.
And, by the way, this is more than enough for many people and organizations in the Java community - if you get by well with just updates/maintenance and without paying anybody for support, that's great and totally cool with me.
So that was the third distinction - _support_ vs _updates or maintenance_.

Now it's time to put the buildings blocks together and resolve the earlier misunderstandings.

## Long-Term Support

I didn't mention it before, but it's the Java Community Process that develops the standard technical specifications for Java and it's OpenJDK that, in tandem with the JCP, develops the reference implementation for it.
Then the vendors ship binaries and decide which versions to offer maintenance and/or support for.
They usually do end up offering that for similar time frames for the same versions, namely 11, 17, 21, and 25.
The "21 is no LTS"-video explains why that's the case and how the whole process of developing, upstreaming, and distributing patches works in detail.
But that convergence, while not really coincidental, is still decentralized and happens on the vendor level.
OpenJDK doesn't plan for it and neither does the JCP.

So it categorically can neither be Java nor "JDK", in general, that gets LTS, only specific distributions like Oracle JDK 25, for example.

And that quickly resolves all confusion:

* What level of maintenance or support you can expect from the JDK you use doesn't depend on which Java version "is LTS" but solely depends on the vendor who gave it to you.
  That includes for which versions and for how long.
* And it doesn't just seem like the people developing Java don't care about LTS, for their work in OpenJDK that's absolutely true.
  Java's feature development is unencumbered by support concerns.

## The Larger Goal

One common response I get to my insistence on phrasing this right is that that's too complex for the average Java programmer or that it would confuse business people.
Leaving the blatant elitism aside, if you look at the comments my last video got, it's clear that the confusion does not come from the facts I explain but from the contradiction between those facts and people's perception.
It's not the reality that's confusing, it's "Java 21 or 25 is an LTS version" because not only is that false, as we've just discussed, it's apparent simplicity is also a mirage that falls apart immediately when you try to apply it to the world around you.

And here we come to my final point.
Let's not forget that not everybody is a friend of the Java community and ecosystem.
There are lots of people and organizations, particularly outside of it, that would love to make a few quick bucks off of it or even see it fail.
And an effective way to do that is to drive a wedge in between the facts and people's perception of them and then use that as a lever to pry the community apart.
A great example for that happened in 2017 - I retell it in a pinned comment.
We defend ourselves against tactics like that not by _insisting_ that the perception _is_ real but by _ensuring_ that the perception _matches_ reality.
Namely: Java 25 is no LTS version.
But basically every JDK 25 distribution will get updates or even support for a long time.

Easy, right?
If not, ask away in the comments.
I'll see you down there or otherwise in two weeks.
So long...

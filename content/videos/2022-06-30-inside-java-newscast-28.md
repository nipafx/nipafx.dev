---
title: "What is OpenJDK? - Inside Java Newscast #28"
tags: [openjdk, community, java-basics]
date: 2022-06-30
slug: inside-java-newscast-28
videoSlug: inside-java-newscast-28
description: What's "OpenJDK" (or "the OpenJDK"?), how does it work, and what does it do? Here's the answer to these questions as well as explorations of JDK Enhancement Proposals, the Java Community Process, why there are so many JDK providers, and how long-term support works.
featuredImage: inside-java-newscast-28
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today we're gonna clear up the confusion around what the heck OpenJDK really is.
Can you download it?
Does it have long-term support?
Is it dangerous for your kids?

Now that openjdk.org is live, we need to answer these questions.
As usually, tons of links in the description - let's dive right in!


## OpenJDK

We'll start with the very basics:
What's _OpenJDK_?
Or is it _the OpenJDK_?
No, it's not.
It's either _the OpenJDK Community_ or just _OpenJDK_ - the two are synonymous.
It's a place where a community of individuals work together on the JDK project to create the open source reference implementation of the Java Platform, Standard Edition as well as related projects.
Let's explore that a bit.

### Place For A Community

As I said, OpenJDK is a community of individuals, so there are no companies.
Oracle, RedHat, Microsoft - they don't exist here.
Well, there's one exception - I'll call it out when I get to it.

So OpenJDK has to govern itself and it does that according to its [bylaws].
They define the overall structure and processes, roles, voting mechanisms, stuff like that.
And it's not very long - about 4.500 words, so about 20 minutes to read out loud.
*clears throat*

Preamble
The OpenJDK Community is...

So, to summarize, the OpenJDK community is structured as a set of groups (that are individuals around topics like the compiler or tooling) and a set of projects (that are collaborative efforts to create specific artifacts, like the project that works on JDK 19 or Project Amber).
There are community-wide roles (_Participant_, _Contributor_, and _Member_) as well as roles specific to Groups (_Member_ and _Lead_) and to Projects (_Author_, _Committer_, _Reviewer_, and _Lead_).

Take Stuart Marks, for example.
He's a member of OpenJDK itself and the core-libs group, reviewer on jdk, jdk-updates, and a few more and committer on a lot more projects like Panama and Valhalla.
Busy guy.
You can look that up in the [census], by the way, which, yes exactly, I'll link in the description below.

Another important role in the OpenJDK community plays the governing board.
It manages OpenJDK's structure and operation and consists of five contributors:

* the _Chair_, appointed by Oracle: Georges Saab
* the _Vice-Chair_, appointed by IBM: Annette Keenleyside
* the _OpenJDK Lead_, appointed by Oracle: Mark Reinhold
* two elected Members who serve for one year: at the moment, these are Andrew Haley from RedHat and Volker Simonis from Amazon

This was it, by the way!
The only place in OpenJDK where companies play a role is Chair, Vice-Chair, and OpenJDK Lead.

And that covers the community, now let's turn to what they're actually working on.

[bylaws]: https://openjdk.org/bylaws
[census]: https://openjdk.org/census

### The JDK Project

The OpenJDK community collaborates on a number of projects, most importantly the _JDK Project_, which is always lead by the OpenJDK Lead, so Mark Reinhold.
That's the code base that contains `ArrayList`, javac, HotSpot, etc.
It's hosted on GitHub under [openjdk/jdk][gh-jdk].
But the JDK project also controls the release repos, like jdk18 and jdk19, until they become generally available.
When that happens, when the Java Community Process spits out another version of Java SE, OpenJDK tags a commit in the corresponding fork... and abandons it.

Because maintenance is the task of another project, namely _JDK Updates_.
It controls the update repos, like jdk18u and jdk19u, and project lead Rob McKenna from Oracle leads maintenance for six months before passing the baton to a qualified OpenJDK member if one steps up.
So far, that has been the case for all odd-numbered releases since 10 - they all see regular merges and release tags.

There are way more projects, though, and you can find all of them in the census and all of their repos under the GitHub org [openjdk][gh-openjdk].
Projects like Amber and Loom usually get one or more repos, and ZGC and Shenandoah also each have one, and then there are repos for tools like jextract and Java Mission Control.

[gh-jdk]: https://github.com/openjdk/jdk
[gh-openjdk]: https://github.com/openjdk

### Java Enhancement Proposals

Each OpenJDK project governs itself and as the most important one, the JDK Project has the most formal process.
A key part of that are the famous JDK Enhancement Proposals, JEPs for short.
A few exceptions aside, each is an effort to design and implement a nontrivial change to the JDK code base.

There's a ton more that could be said about JEPs, for example [their workflow][jep-flow], how they relate to projects, how they form the JDK roadmap, and much more.
Since this episode focuses on OpenJDK, though, that would be a massive side track.
And I already read the full bylaws, so we're way over time anyway.
But if you're interested to learn more about the JDK development process, let me know in the comments, and I'll gladly discuss that in a future episode.
That's also a good opportunity to subscribe and turn on notifications, so you don't miss that video.

[jep-flow]: https://cr.openjdk.java.net/~mr/jep/jep-2.0-fi.png

### That's it?!

Indeed, that's it!
The Java Community Process, Java Specification Requests, binaries, distributions, vendors, long-term support - none of that is part of OpenJDK.
All of that are projects, processes, and organizations that work in parallel or on top of OpenJDK.
You can't download "the OpenJDK" because it produces no binaries - in case you wondered why I didn't talk about them, it's because there aren't any.
And while I've technically fulfilled my promise to tell you about OpenJDK, you'd probably feel short-changed if I left it at that, so let's touch on at least a few of those, namely the Java Community Process, why we have so many JDK distributions, and what's up with long-term support.


## NOT OpenJDK

### Java Community Process

The Java Community Process, or JCP for short, is its own beast that I can't do justice in a minute or two, but the tagline is:
It's the mechanism for developing standard technical specifications for Java technology.
Think of the Java Language Specification, for example.
So the JCP produces specifications that OpenJDK then provides the reference implementation for.

The JCP's main vehicle is the Java Specification Request (JSR).
In the past, we had lots of those, enshrining the changes proposed by large projects like Lambda and Jigsaw, but with the move to the faster release cadence and piecemeal delivery of features, nowadays there's mostly just one JSR for each Java release.
The one for Java SE 19, for example, is JSR 394.

Each JSR has at least one _Specification Lead_, for 394 those are Iris Clark and Brian Goetz, and for it to be released, one of their tasks is to provide a binary with the reference implementation.
So when the Java Community Process finalizes another version of Java SE, which technically is just an abstract platform as defined by the specification, the respective spec lead provides the reference implementation, a concrete and runnable JDK, built from the corresponding OpenJDK project.

These binaries, one for Linux and one for Windows, receive no updates and are not production-ready!
They serve as a reference for all implementors of the specification, like a kilogram weight sample in a museum, for example.
They are published under GPL version 2 with Classpath Exception under [jdk.java.net/java-se-ri/$VERSION][ri-java-18], which is different from [jdk.java.net/$VERSION][jdk-18] that you're probably familiar with.
Let's get to those!

[ri-java-18]: https://jdk.java.net/java-se-ri/18
[jdk-18]: https://jdk.java.net/18

### Binaries, Distributions, Vendors

Early access builds for OpenJDK projects, like Loom and Valhalla, can be created by anybody and Oracle often does that but so do others.
As I just explained, reference implementations are created by the spec leads.
But what about those under jdk.java.net/$VERSION?

Those are Oracle's builds of the jdk$VERSION Project in OpenJDK - or Oracle OpenJDK builds for short.
Remember when I said Rob McKenna leads each JDK Update repo for six months?
During those six months, Oracle distributes its OpenJDK builds under GPLv2+CE and they _do_ get updates during that time and are 100% production-ready, always the freshest features right out of the oven.
Definitely my choice of JDK!

But Oracle also offers Oracle JDK, no _Open_ in that name - as-is for free under its NFTC license or as part of the Java SE subscription if you need proper support.
Oracle builds these from internal repos that are mostly mirrors of the corresponding OpenJDK update repos, but can contain slightly different or additional patches.
And that's pretty much what most or even every other vendor does as well - they maintain mirrors of the update repos plus their own patches.
Many give their binaries away for free and then also offer commercial support for those who need it.

I know that this can get confusing.
Why are there so many build providers?
How do they differ?
And how to select vendors?

Well, like with Linux, there are multiple build providers because OpenJDK is open source and there are that many because the Java ecosystem is so large that all of these companies reckon they can earn good money - which is good because I'm not sure whether you've noticed but what I've described so far is pretty time-demanding and almost everybody who works on it does so on company time.
If there weren't any money in Java, there'd be no Java.

And how do you select vendors?
I really can't help you with that - working for Oracle, I'm clearly biased.

### Long-Term Support

Another often confusing issue is that of long-term support, or LTS.
What does it mean, who offers it, and how is it implemented, etc.?

As to what that means, that's surprisingly vague.
I personally like the distinction between _maintained_ and _supported_, where maintained means, you get regular updates, often for free, that include all relevant security fixes, and supported means that plus you can yell at someone on the phone if there's an issue.
For more details, you have to compare what vendors specifically describe as their service and support.

Because, and I probably should've lead with that, it's the build providers who decide what level of support they want to offer for what version.
So the concept of LTS lives outside the realm of JCP and OpenJDK and each company can do whatever they want.
And they do, but they also do want to coordinate.
Because maintaining a Java release is a lot of work and it gets a bit easier if it's split across more people.
That also means, companies have an incentive to upstream their patches and changes to the OpenJDK repo because the closer everybody stays to that, the more they can benefit from the work of others.
It's like a positive variant of the prisoner's dilemma, which is pretty impressive if you think about it and a major reason why Java has such a strong and diverse ecosystem.

So when Rob McKenna shifts his focus from leading one update repo to the next, he'll offer the repository lead role for the old one to other JDK Update Project members.
And since potential leads and contributors are probably doing their work on company time, I imagine their companies will make a decision what releases they see value in and want to pay for the maintenance of.
So the companies' decisions which versions to offer support for impact how many people can invest time into contributing to OpenJDK update repos.
And that's why, even though OpenJDK is LTS-agnostic, it's exactly the versions that have commercial support who see continued updates to their source code in OpenJDK after their first six months.
Makes sense?


## Outro

Uhm, I made a mistake and asked you on Twitter and Reddit for questions about OpenJDK before I wrote this script.
So I didn't know how long it would get and how few of your questions I could actually tackle.
So here's an idea, what do you think about an episode dedicated to just your questions?
About all things Java?
That could be fun!
Let me know.

And that's it for today on the Inside Java Newscast - do all the YouTube things and I'll see you again in two weeks.
So long ...

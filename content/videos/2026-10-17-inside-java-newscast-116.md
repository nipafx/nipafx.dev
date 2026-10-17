---
title: "OpenJDK Bug Fixing, JavaOne, and JDK 28 - Inside Java Newscast #116"
tags: [openjdk, community, java-28]
date: 2026-10-17
slug: inside-java-newscast-116
videoSlug: inside-java-newscast-116
description: "A critical bug in JDK 27 and how it was fixed, some conference news, and how JDK 28 is shaping up"
featuredImage: inside-java-newscast-116
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're going to look into a critical bug in JDK 27 and how it was fixed, some conference news, and how JDK 28 is shaping up.
Ready?
Then let's dive right in!

## A Critical Bug

On August 18th, 2026 a mail pops up on the hotspot-compiler-dev mailing list and it describes something that is not supposed to happen: a serious new bug in a JDK release candidate phase, just a few weeks before general availability.
Apparently, under very specific circumstances, some buffer contents aren't correctly copied and strings can get corrupted.
This is bad, very bad even, and obviously requires analysis and a fix.
And so this could be a technical story that dives deep into C2, the part of HotSpot's just-in-time compiler that is tasked with generating the best performing code and that caused the observed misbehavior.
But not only am I not the right person to tell that story, I also think there's another, equally interesting one to tell that teaches us a lot about how OpenJDK and the wider Java community collaborate to produce a safe and sound JDK.

That story begins in December 2025 when my colleague Quan Anh Mai files a [priority-3 bug](https://bugs.openjdk.org/browse/JDK-8373591) against C2 that has been lurking since JDK 9 - a detail we'll come back to.
On December 12th a [pull request for the bug](https://github.com/openjdk/jdk/pull/28789) is opened, still in time to potentially make it into JDK 26.
Now, as far as I am aware, nobody tried to make that happen, but we can learn a lot about the JDK's development process by exploring this hypothetical.

In mid December 2025, JDK 26 was already branched from the main development line and is in stabilization, which consists of rampdown-phases 1 and 2, followed by a release candidate phase.
During all of this, bugs are carefully vetted and labeled as _candidates_ or not, as _current_ or _targeted_, and maybe as _critical_.
As you can imagine, and without talking you through the entire process matrix that's on screen right now, more important bugs are more likely to get addressed, but the requirements for a bug to be addressed also become stricter as the phases progress _and_ there's an explicit deferral process for critical bugs that can't be fixed right away.
This triage, defined by [JDK Enhancement Proposal 3](https://openjdk.org/jeps/3), exists to direct time and attention towards the most important fixes while ensuring that less important fixes don't rock the boat on the last stretch towards a release.

So what does all that mean for our C2 bug if someone would've tried to push the fix into JDK 26?
In mid December, 26 is in rampdown phase 1 and our bug is P3, which would make it a candidate.
But it also matters how old it is and remember that this one would be well into elementary school by now, so it'd be merely a targeted bug - the category that is least likely to be fixed.
So it's no surprise that nobody rushes a fix and tries to get it into 26.
Instead, work on the pull request continues at a leisurely pace until May.

And May is a great time to merge PRs like this!
The weather is nice outside, maybe you take your laptop to the veranda or a cafe and, most importantly, JEP 3 is not curbing your enthusiasm, not even hypothetically.
JDK 26 has been shipped in March and 27 won't be forked off the main line until early June.
So the pull request gets merged, the bug closed, and everybody moves on.
But.. there's a new problem and it's about to show up in somebody's tests.

Fast forward to August.
Elastic recently started building against JDK 27's early-access builds and now observes a failing test - it seems like strings get corrupted because some buffer contents aren't correctly copied.
After exploring the issue with others on his team [Lorenzo Dematte takes](https://mail.openjdk.org/archives/list/hotspot-compiler-dev@openjdk.org/thread/5NVKBE3C5T5ULKVO5T3RTUQZDIXQMHBE/) to the hotspot-compiler-dev mailing list on the 18th.

> First of all, this is my first message here, so my apologies if it is the wrong place!

It isn't.
They analyzed the issue well, narrowed down the problem, and are bringing receipts in the form of a reproducer.
Thanks to their work, things can move quickly now.
A few hours later, Elastic's Chris Hegarty and Oracle's Tobias Hartmann [confirm the bug](https://mail.openjdk.org/archives/list/jdk-dev@openjdk.org/thread/EPJNIMIAROC2QELIZE5MAGU4D6S3FEVG/#K52LJL4HZJE565UBU465PT4ZBRC2XV4Y), track it back to C2, and, importantly, [assign P1](https://bugs.openjdk.org/browse/JDK-8390546) as a tentative priority.
That matters because on August 18th, JDK 27 is way past RDP 1 and even the stricter RDP 2 and in release-candidate phase, where only P1 bugs get addressed.
The main branch, on the other hand, can readily accept changes and so there the pull request from May [gets reversed](https://bugs.openjdk.org/browse/JDK-8390590) within hours and the reproducer is adapted into a test to guard against the new bug springing up again.
A day later, [Mark Reinhold confirms](https://mail.openjdk.org/archives/list/jdk-dev@openjdk.org/message/K52LJL4HZJE565UBU465PT4ZBRC2XV4Y/) the priority and approves the rollback for JDK 27, and so the reversal and new test get [backported](https://bugs.openjdk.org/browse/JDK-8390663).
27 is now in the same spot as JDKs 9 to 26, where the original bug exists but was never observed, except that it has an additional test - one more thing that can't go wrong down the line.

After this rush to address the glaring P1 bug within just a day, things calm down.
Over the next week, the original P3 issue [gets reassessed](https://bugs.openjdk.org/browse/JDK-8390617), an adapted pull request is merged and the whole thing is fixed on the JDK's main branch.
But it's still just a P3, a far cry from the critical P1 that is required to merge into JDK 27's release candidate, and so we have to download a JDK 28 early-access build to rid us of this bug.
Still, all's well that ends well.

I started this story by saying that this was not supposed to happen - a P1 bug in a release candidate phase that requires an urgent solution.
But there's another side to this:
Mistakes do happen and finding them before release _is_ what's supposed to happen and so OpenJDK is set up to foster discovery.
It delivers early access builds for the next version and, while that one is in stabilization, even the version _after_ that.
This allows projects small and large in the Java ecosystem to run their test suites against it and to catch regressions before their release.
Shout out to the [Quality Outreach Program](https://wiki.openjdk.org/spaces/quality/pages/18448461/Quality+Outreach), which encourages participation in this process.
Then there's the stabilization phases defined by JEP 3 that enforce a tapering towards ever-more critical fixes but do allow a reviewed rollback as we've seen here.
And of course there are the people in this community who take their work seriously and do it diligently and collaboratively.
Kudos.

If you want to dig deeper into what happened here and want to know the technical story, too, check out its trail on JDK mailing lists, its issue tracker, and GitHub - there are plenty of links in the description.

## Meat Space

A quick update for the weirdos among you who like to meet people in meat space:
JavaOne is back and will take place in Redwood Shores, California from March 23rd to 25th.
It'll once again have the largest gathering of OpenJDK contributors and architects as well as many luminaries from the community, all of whom are there to discuss Java's present and future with you.
There'll be keynotes, hands-on labs, a hackathon, a happy hour and a party, the irreplaceable hallway track, and of course plenty of talks.
Tickets will go on sale in November - check out [javaone.com](https://javaone.com) for more.

Oh, and speaking of conferences, Devoxx Belgium happened earlier this month and was great fun as always.
We took the opportunity to record a few new podcast episodes about patterns, string templates, value optimizations, and more and will publish them over the next weeks and months - if Java news are your jam, you don't want to miss this.
Track [inside.java/podcast](https://inside.java/podcast) or look for the Inside Java Podcast on your favorite platform.

## JDK 28

We'll dive deeper into JDK 28 in December, when its stabilization phase starts and features are set in stone, but I can already tell you now that this will be a big one!
[Back in August](inside-java-newscast-114), we already knew that it would preview value objects and primitive patterns as well as incubate the JSON API.
Since then, [quite a few features](https://openjdk.org/projects/jdk/28/) were added:

* the PEM API will finalize
* the structured concurrency API will finalize
* the AOT cache will contain JIT'ed code, which is pretty amazing - pause to check out these graphs
* Shenandoah makes its generational mode the default
* and ZGC will start up faster, warm up quicker, and adjust heap size dynamically in response to changes in the workload and the host system
* lastly, the MacOS x64 port is deprecated for removal and no longer maintained

What's still undecided are lazy constants, although a JEP draft speaks of a fourth preview without changes compared to 27, and the vector API, for which I expect another incubation.
Either way, I'll let you know in a future Newscast - so long...

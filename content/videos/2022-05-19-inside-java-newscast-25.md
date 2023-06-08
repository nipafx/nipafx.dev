---
title: "News Grab Bag: Loom Virtual Threads, Lilliput, Pattern Matching, ... - Inside Java Newscast #25"
tags: [project-loom, tools, project-lilliput, project-amber, pattern-matching, community]
date: 2022-05-19
slug: inside-java-newscast-25
videoSlug: inside-java-newscast-25
description: "Project Loom's virtual threads are merged and ship with JDK 19 - here's to prepare for them. Also, news on Project Lilliput, proposal for record patterns in pattern matching, some astonishing numbers from Sonatype on Maven Central, and the move of OpenJDK to openjdk.org."
featuredImage: inside-java-newscast-25
---

## Back to Conferencing

Wow, thank you.
It's nice to be here again.
Last time I was here was February 2020 and then, I don#t know, something happened.

I'm Nicolai Parlog, I'm a Java developer advocate with Oracle.

So, welcome everybody.
As I already mentioned, I'm Nicolai Parlog.

I gotta say, I really missed conferences.
Big thanks to all the organizers out there putting together these amazing events!
It's great fun to present and even greater fun to hang out and talk to you folks.
It was great meeting some of you in person and I want to thank you so much for all the positive feedback - that really means a lot to us.
Also, conferences give you a bunch of gifts and as long as they're black, I'm all in.


## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
... and today we're gonna go through this grab bag of topics and see what it has in store for us.
Ready?
Then let's reach right in!

Huh.


## Hello, Virtual Threads!

There's a ton of talk around Project Loom's virtual threads at the moment and it's well deserved!
I mean, have you looked [at the pull request][loom-pr]?
It touched 1,133 files across all garbage collectors, ports, the just-in-time compiler, virtual machine, Java Flight Recorder, and APIs from threading to executors to IO.
And it drew 230 comments from all OpenJDK teams who work in those areas!
It's linked in the description, check it out.

But the coolest thing is, it's merged!
Since May 7th 2022, Java officially has virtual threads that will ship with JDK 19 - as a preview, but nonetheless.
Which begs the question, what steps can you take to benefit from them?

[loom-pr]: https://github.com/openjdk/jdk/pull/8166/files

### Preparing Your Code

First of all, as you'd expect from Java, this change is 100% backwards compatible and all code that uses non-virtual threads works correctly and with the same performance and memory characteristics as before.
Then, if you run unchanged code in a virtual thread, it will also work correctly, particularly all threading related concepts, like thread locals for example, work perfectly fine in virtual threads.
But what about performance, particularly Loom's scalability promises?

Most code can immediately benefit from that without changes.
For example, everything that one way or the other ends up using the socket API will harmonize perfectly with virtual threads out of the box.
There are a few potentially limiting factors to this scalability boost, though.
In order of decreasing importance, here they are:

1. Wherever you're pooling threads, you're down to the throughput that pool can provide, so you should replace all of them with non-pooled virtual threads.
   If you want to limit access to a resource, for example a database, use semaphores instead.
2. Caching large objects in thread locals scales reasonably fine as long as there'll only be so many of them, but you probably don't want to have millions of them around or you'll run into memory issues.
   There is no single pattern that replaces thread locals, but the JDK managed to get rid of over 90% of theirs when preparing for virtual threads with a variety of strategies.
3. Synchronization pins the virtual thread to the carrier thread, making operations blocking that otherwise wouldn't be.
   Setting the system property `jdk.tracePinnedThreads` lets the runtime log messages when this happens.
   The solution is to guard the I/O operation with a reentrant lock instead, which doesn't pin.
4. Native frames on the stack will also pin, which is required for correctness - there's nothing to be done about that except not calling into native code.
5. Unfortunately, many file I/O operations are blocking carrier threads and again there's nothing to be done about that.
   Loom compensates by temporarily adding a carrier thread for each one that blocks this way.
   In the absolute worst case, where all your app is doing is waiting for file I/O, this brings scalability down to what you're used to with just platform threads.
   We may get lucky in the future, though:
   If OpenJDK adopts io_uring, file I/O won't block carrier threads on Linux - as far as I know there are no concrete plans for this, but it's on the radar.

To summarize:
To prepare your code base for virtual threads, stop pooling, reduce use of thread locals, and avoid I/O operations in synchronized blocks.
And keep in mind that native code pins threads and file I/O blocks carrier threads for now.

### Helping by Testing

Beyond these five concrete points, particularly servers and web frameworks may have baked in implicit assumptions about threads that need to be revisited.
Now's a great time to get started with that and experiment with how to get the most out of virtual threads.
Ideally, they'll also soon offer users an (experimental) option to switch to virtual threads, so they can test their code bases with them.

If you're a maintainer of an open source project, check out the Open JDK Quality Group, which, quote, "promotes the testing of FOSS projects with OpenJDK Early-Access builds as a way to improve the overall quality of the release."
I'll put [a link to their outreach][outreach] for testing of virtual threads in the description.
In a nutshell, you can help make sure that JDK 19 is the best it could possibly be by running your build and ideally performance benchmarks on early access builds.
With and without `--enable preview`.
If you can additionally already make use of virtual threads, that would be all the better!
If you find a regression or unexpected result, take it to [the Loom mailing list][loom-dev]. 👇🏾

But you app developers aren't off the hook either!
The same approach works for you as well, so give the JDK 19-ea builds a shot!

[outreach]: https://inside.java/2022/05/16/quality-heads-up/
[loom-dev]: https://mail.openjdk.java.net/mailman/listinfo/loom-dev

### Demos and Experiments

I've also noticed that some people already started experimenting with virtual threads and that's so cool to see!
I'll link to a few experiments in a pinned comment, like the one from Elliot Barlas where he achieves 5 million persistent connections with straight-forward Java code or the Helidon team's announcement of Helidon on virtual threads.
Reply with others, I wanna catch 'em all!

* Elliot's 5 million persistent connections: https://github.com/ebarlas/project-loom-c5m
* Elliot's comparison of platform vs virtual threads vs async: https://github.com/ebarlas/project-loom-comparison
* James Baker's experiments with Jepsen and Foundation DB: https://jbaker.io/2022/05/09/project-loom-for-distributed-systems/
* Helidon on Loom: https://twitter.com/m0mus/status/1526101284956393472
* my lab with some simple code snippets: https://github.com/nipafx/loom-lab

Now, what's next?


## Maven Central

Do you use Maven Central?
That might actually be a pretty stupid question because I don't think there's a way to be a Java developer without using it at least indirectly.
But be that as it may, have you ever wondered how that infrastructure is being operated?
I haven't, really.

> Maven Central is just there.
> Just like the stars, just like electricity, just like Java.

That's from an abstract of Joel Orlina, Engineering Manager in the Technical Operations group at Sonatype, who's been caring for Maven Central for more than a decade now.
I attended his talk at Devoxx UK and want to share a few astonishing numbers with you:

* Maven Central stores 8.8 million component versions.
* That's 27 TB of memory in an S3 bucket.
* There were 496 billion requests in 2021 and there'll probably be over 600 billion in 2022.
* In 2021 that meant about 54 PB of bandwidth, much of it routed via Fastly.

That's astounding!
Amazon heavily discounts the storage costs and there seem to be a favorable contract with Fastly as well, but other than that, Sonatype foots that bill.
They're entrusted by the Apache Foundation to run this service and they've quietly and reliably done that for years and years now.

The Java community is full of such stories where large companies, which are often competitors I might add, and lots of individuals do an incredible amount of often unnoticed work that keeps this amazing ecosystem moving forward.
In this case Sonatype and hats off to you folks for your amazing work on this essential piece of infrastructure.

And, as a little side track here, it's not just core Java.
For example, I use Asciidoctor a whole lot and the core maintainers could really use your help to stay above water.
I'll link to [their project page on Open Collective][asciidoc] - if you use Asciidoctor, please consider contributing financially to the project.

Now let's see what the magic bag has in store next.
Uuh, wow, look at this!
Hah?
Well, it wasn't actually in the bag, but I just finished putting it together with my daughter and wanted to show it off.
So cool, hah?
Next draw.

[asciidoc]: https://opencollective.com/asciidoctor


## Project Lilliput

In 64-bit Hotspot, objects have a header of 96 or 128 bits:

* a 64 bit multi-purpose header word for lock-bits, object monitors, GC bits, and more and
* a 64-bit class pointer, although that one is by default compressed to 32 bits

Assuming an average total object size of 5-6 words, this is quite significant - 25-40% of that is just the headers!
Enter [Project Lilliput][lilliput].

Announced in April 2021 by Red Hat's Roman Kennke, it has two goals:

1. make the header layout more flexible and
2. reduce it to 64 or even 32 bits

That would significantly reduce memory pressure, which, depending on the app, directly translates to

* reduced heap usage,
* higher object allocation rates,
* reduced GC activity, or
* better cache locality due to tighter packing of objects

And in early May, just one year after inception, Lilliput achieved its first milestone: 64-bit-sized object headers!
There's a brief explanation of the approach and the current caveats [in Roman's mail][roman] that's linked below.
If you wanna give it a spin, build a JDK from [the lilliput-milestone-1 tag][lilliput-m1] and run your app on it.
[The Lilliput mailing list][lilliput-dev] is waiting for your feedback!

Roman closes his mail with:

> We are already working on next milestone, which will be 32bit headers

Godspeed, Roman!

So what's next for us?

But I'm beat.
*yawns*
This isn't even fake
*finishes yawning*
Sorry, yeah, I'm beat, this has to wait until tomorrow.

[lilliput]: https://wiki.openjdk.java.net/display/lilliput
[lilliput-m1]: https://github.com/openjdk/lilliput/tree/lilliput-milestone-1
[lilliput-dev]: https://mail.openjdk.java.net/mailman/listinfo/lilliput-dev
[roman]: https://mail.openjdk.java.net/pipermail/lilliput-dev/2022-May/000457.html


## Record Patterns

Good morning, where were we?
Oh, right!

I'm not sure whether a release can be too awesome, but JDK 19 is really gunning for that.
[JDK Enhancement Proposal 405][jep-405] proposes record patterns, a way to deconstruct records into their components.
At the time of recording, JEP 405 is proposed to target 19, but the review ends the day this video goes live.

So, Nicolai in the editing room, did something change?
Does it officially target 19 now?
...
Ahh, that's a bummer.
Well, people in the US are only now crawling out of bed, so maybe it will in the next few hours.
Either way, I'll probably go into details on that in the next episode.
If you don't want to miss that, subscribe and ding the notification bell.

So, Nicolai in the editing room, did something change?
Does it officially target 19 now?
...
Yeah?!
Wohoo!
I'll definitely go into details on that in the next episode.
If you don't want to miss that, subscribe and ding the notification bell.

And now, for the final draw...

[jep-405]: https://openjdk.java.net/jeps/405


## OpenJDK Dot Org

> Since the dawn of time, the OpenJDK Community's web, e-mail, wiki, issue tracking, and (Mercurial) source-code infrastructure has been hosted under [openjdk.java.net](https://openjdk.java.net).
>
> That name has served us well for fifteen years, but it has also been a constant source of confusion.
> The second-level domain name [java.net](http://java.net) originally pointed to an unrelated source-code forge site [2], which was perplexing.
> That forge was shut down in 2017, so now the "java.net" name is perplexing in a different way.

> Above and beyond that, however, since the OpenJDK Community was founded, many other open-source communities have placed their infrastructure under the ".org" top-level domain name.
> This makes for easy discoverability.
> It also serves as both a reminder and a promise that the operation of the community is not meant to be dominated by any single corporate entity.

>I therefore propose...

Wait, that's not right, I don't propose anything.
And I don't wear glasses, for that matter.
What's going on here?

Oh, it seems someone just copied [a mail by Mark Reinhold][mark-proposal] into my script and forgot to edit it.
Ok, let's roll with it.
Just pretend I'm Mark Reinhold, Chief Architect at the Java Platform Group at Oracle.

> I therefore propose that we rename openjdk.java.net to openjdk.org and make corresponding changes to the names of all active subdomains.
>
> If we proceed with this, then Oracle's infrastructure team will ensure that the old names act as aliases for the new names, so as not to break existing URLs or e-mail addresses.
>
> Comments?
> Mark

Well, comments were all enthusiastically in favor, which isn't surprising.
This is so obviously a good idea, it will take all of two weeks for everybody to forget that it ever wasn't openjdk.org.

So why wasn't it like that from the beginning?
Mark explains [in another mail][mark-proposal]:

> We did in fact push strongly for openjdk.org way back when, but then the edict came down from Sun's C-suite that "you can have any domain that you want, as long as it ends in 'java.net.'"
> So I parked openjdk.org myself in 2006 and transferred ownership to Oracle when the time was right.

In case you're wondering, there are [no plans][mark-jdk], at this time, to move jdk.java.net as well

[mark-proposal]: https://mail.openjdk.java.net/pipermail/discuss/2022-May/006089.html
[mark-background]: https://mail.openjdk.java.net/pipermail/discuss/2022-May/006106.html
[mark-jdk]: https://mail.openjdk.java.net/pipermail/discuss/2022-May/006094.html


## Outro

And that's it for today on the Inside Java Newscast.
What do you think about covering a few smaller topics instead of going deeper into a single one?
Let me know with a thumbs up or down or a comment below.
And don't forget to share this video with your friends and colleagues.
I'll see you again in two weeks - so long...

---
title: "Three G1 Improvements - Inside Java Newscast #99"
tags: [performance, java-26]
date: 2025-10-23
slug: inside-java-newscast-99
videoSlug: inside-java-newscast-99
description: "Java's (almost) default garbage collector G1 is undergoing even more improvements"
featuredImage: inside-java-newscast-99
---

Vroom, vroom, trees!
That was my segue from the thumbnail to the rest of the episode.
How did I do?

<!-- logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about a triple of G1 improvements that will make your applications simpler to manage and faster to execute.
We'll go from already integrated to barely proposed and top it off with a little ZGC update.
But first a little garbage collection primer - skip to this time stamp if you don't need one.

Ready? Then let's dive right in.

## Garbage Collection Primer

The ideal garbage collector requires neither extra memory nor CPU-time and never pauses the application, leading to maximal throughput and optimal latency.
Funnily enough, such a collector even exists: epsilon GC.
The only downside is that it never frees memory and the application just crashes if it runs out.
So probably better used for benchmarking than in production.

All GCs that _don't_ crash your application need to make trade-offs, most notably between footprint, throughput, and latency.
Parallel GC sits on the throughput end of thing - it does almost all of its work during pause times, which can make them very long (and thus latency very bad) but reduces footprint to a minimum and leads to great throughput.
Serial GC is also throughput-oriented.
ZGC on the other hand sits on the other end of the spectrum.
It does much of its work concurrently with the application, which requires extra memory and CPU time but leads to guaranteed ultra-low pause times even on massive heaps.
G1 sits in the middle of this spectrum and by doing some work concurrently but the rest during pauses, it compromises between footprint, latency, and throughput, which makes it the default GC in most environments - more on that later.

G1 is a so-called _regional_ garbage collector, meaning it divides the heap into regions and marks each as containing either young or old objects.
That allows for a flexible ratio of the two generations that can align with each application's needs.
The separation into regions also brings us to the first G1 improvement.

## Simpler Write Barriers for G1

When moving objects from one region to another, references to them must be updated.
But G1 doesn't want to scan the whole heap for references to a moved object (because that would take too long) so instead it tracks cross-region references in a so-called _card table_.
To keep that data structure up to date, G1 and the just-in-time compiler inject code fragments into writes to the heap - this is called a _write barrier_.

That means that when code that runs as part of your application, be it your code, your dependencies' or the JDK's, updates a non-primitive field or array, it ends up executing the write barrier, which means they run in application threads.
At the same time, to keep the table performant, G1 is optimizing it in the background, which leads to contention and synchronization with these application threads.
As you can imagine, orchestrating all this is also quite complex and that complexity is directly reflected in the write barriers, which can make them rather slow.

And this is where JEP 522 enters the picture.
It introduces a second card table so that application threads can work with one and the G1 optimizer threads with another plus a mechanism for swapping and reconciling them.
That reduces contention and the need for synchronization and also simplifies the write barriers.
According to the JEP, that simplification alone leads to throughput gains of up to 5% across the board with applications that heavily modify object-reference fields further benefiting from the reduced contention and seeing improvements of up to 15%.
Pause times and thus latencies decrease slightly.

JEP 522 is already integrated into JDK 26 and available in the early access builds - links to that as well as to everything else I mention in this episode are in the description.

## Make G1 The True Default

G1 is often described as Java's default garbage collector, but that's not actually true.
You see, Java is just a standard and its governing body, the JCP, doesn't recognize the concept of a default garbage collector...
No!
Begone, evil spirit.
Begone!

What I meant to say is that, if no command-line option chooses a specific GC, the runtime will often but not _always_ default to G1.
On single-CPU machines with less than a bit under 2 gigs of memory it picks Serial GC instead because in that kind of environment, it used to have significant advantages in throughput and footprint.
Note the past tense, though.
Over the last couple of releases, G1's footprint has come down and recent work, particularly the simpler write barriers we just discussed, has brought its throughput close to Serial GC's in these constrained environments.
So the two collectors are now competitive on these two metrics, but G1's maximum latencies have always been better than Serial's.

So JEP 523 proposes to always default to G1, regardless of environment, which will improve maximum latencies in many situations where Serial GC used to be selected and will also make it easier to understand and reason about the JVM’s behavior.
It also reduces the number of topics, on which people like me can "well actually" you, which is somewhat annoying to me personally but probably a plus for the wider community.

And don't worry if Serial GC performs better than G1 in your environment.
There are no plans to remove it and you can still select it explicitly with a simple `-XX:+UseSerialGC`.
JEP 523 is not yet proposed to target a release.

## Automatic Heap Sizing

The minimum and maximum heap size can be configured with the options `-Xms` and `-Xmx`, respectively.
Determining the best values isn't easy, though:

* the application's memory requirements can change throughout its run time
* the JVM's own variable memory requirements need to be factored in
* other applications may require memory
* and so does the operating system, for example to populate file caches

Take all this together and it becomes obvious that determining heap size is no simple task.

> Can't someone else do it?
> The garbage man can!

Exactly - let the garbage collector determine its own minimum and maximum heap size!
And there's a JEP draft that proposes just that for G1.
It would automatically and dynamically size its heap anywhere between 4MB or `-Xms`, whatever is higher, and close to all of the available memory or `-Xmx`, whatever is lower.
So if you know your exact heap size needs, set `-Xms` and `-Xmx` to exactly that, but otherwise you're encouraged to omit both values and let G1 choose.
It will do so by considering a multitude of factors:

* the total memory
* whether compressed oops are enabled, which limits the heap to 32 gigs
* the environment's pressure

Oh shit!
The wind tries to take the camera and there's a steep drop right there.

Ok, starting over.
It will do so by considering a multitude of factors:

* the total memory
* whether compressed oops are enabled, which limits the heap to 32 gigs
* the environment's memory pressure
* the application's allocation rate, with a specific eye on surges
* the JVM's internal native memory usage
* the GC's CPU overhead
* the G1 options `GCTimeRatio` and `G1GCIntensity`, the latter of which is new
* and probably more

To balance all these factors, G1 will shrink and expand the heap as needed.
If you're interested in more details on how it does that, check out the JEP.
But keep in mind that it's still a draft, which means it's very early days for this feature and lots may still change.

## Also, ZGC

This video is all about G1, but it would be remiss of me not to at least mention that there's another JEP draft that proposes automatic heap sizing for ZGC, too.
Love it!
Taken all together, we're looking at a future where a big chunk of applications have optimal GC behavior with zero flags and another big chunk need to do nothing else but select ZGC to get the same.
What a time to be alive.

And that's it for today on the Inside Java Newscast.
I'll see you again in two weeks for the one-hundredth episode, although I'm not yet sure how to celebrate that.
If you have any ideas, I'd love to hear them.
Either way, see you then - so long ...

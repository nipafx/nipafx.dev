---
title: "Java 24 Performance Improvements & Deprecations - Inside Java Newscast #82"
tags: [java-24, performance, deprecation]
date: 2024-12-12
slug: inside-java-newscast-82
videoSlug: inside-java-newscast-82
description: "Java 24's feature list contains a whopping 24 JDK Enhancement Proposals. Here, we're going to look at the performance improvements and deprecations/removals."
featuredImage: inside-java-newscast-82
---

> JDK 24 also ships with a bunch of performance-related improvements:
>
> * ahead-of-time class loading and linking
> * virtual threads now synchronize without pinning
> * Shenandoah and ZGC further embrace the generational hypothesis
> * G1 got a late barrier expansion
> * compact object headers
> * full JDK runtime images can be a bit smaller
>
> But more details on all of in the next Inside Java Newscast, next week.

<!-- logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and after we've looked at JDK 24's language and API changes last week, today we're gonna go over its performance improvements and also all the things JDK 24 deprecates and removes.
I gotta warn you, though, Billy contributed some sections to this video and they're... well, let's, just like him say they're special.

## Reduced JDK Size

Wow Nicolai, that's a very nice compliment!
Allow me to send you this package with a gift inside, in appreciation.
But that reminds me about packaging the JDK.

So, all Java developers can appreciate reducing the size of their container images, especially when shipping Java applications in a cloud environment.
JEP 493, Linking Run-Time Images without JMODs, helps reduce the disk space size of the JDK binary, by allowing it to be shipped without the need to include JMODs.
Now, this is a process that would happen while building the JDK, so not something Java developers would typically perform, though I suppose you could build the JDK yourself, if you so desire.
This is an optional process, so some JDK vendors will continue to include the JMOD files, but whether the JMOD files are present or not, your experience using jlink to build custom runtime images should remain the same.

If you would like to learn more about using jlink to build custom runtime images, you can check out this video.
And also be sure to check out JEP 493 for additional details, links in the description.
Now I need to send my gift to Nicolai.


## Synchronize Virtual Threads without Pinning

See what I mean?
Anyway, let's focus on the topic at hand:
Before JDK 24, when a virtual thread entered a `synchronized` method or block, it would get pinned, meaning it wouldn't unmount in situations where it otherwise would, which would lead to a valuable carrier thread getting blocked.
That's not good and after a lot of work on object monitors, the mechanism underpinning `synchronized` as well as `Object::wait`, these operations no longer pin virtual threads.
So if you have tried them before but were underwhelmed by their effect, that may well have been because your project happens to have a lot of blocking operations inside synchronized blocks, in which case you should see much better scalability on JDK 24.
This is great as it removes the main hurdle for just straightforward adoption of virtual threads.


## Generational Garbage Collection

Oh, hey there, so I'm about to take out this garbage out to be collected in a dumpster.
But you know what, that reminds me about garbage collection in Java.

Ok, so in JDK 24 there are two noteworthy changes happening.
In JEP 404 (if you can find it), Generational Shenandoah is being added as an experimental feature.
If your JDK supports Shenandoah, you can enable Generational Shenandoah by enabling experimental features, and setting Shenandoah's GC mode to generational, exact commands on screen:

`-XX:+UnlockExperimentalVMOptions -XX:ShenandoahGCMode=generational`

If you would like to learn more about Generational Shenandoah check JEP 404 as well as Shenandoah's wiki.

Continuing on garbage collector news, Non-Generational ZGC was deprecated in JDK 23 and set to be removed in JDK 24, leaving Generational ZGC as the only option when using ZGC.
If you would like to learn more about Generational ZGC, you can check out my hands on video (here) as well as this video from Erik Osterlünd at JVMLS.

Ok, I need to go take care of this trash, back to you Nicolai in the studio!


## Late Barrier Expansion for G1

Oh, hey there, I was just about to write Billy what I think of his garbage joke to introduce the topic of garbage collection, but you know what, that reminds me of the topic garbage collection.
So, Garbage collectors need to keep track of quite a few pieces of information and one way they do this is with so-called write barriers.
A write barrier is a piece of code that does extra work on every reference store, for example to keep track of objects in the old generation referencing ones in the new generation or of objects in one region referencing ones in another.
Being a regional garbage collector, G1 has rather complex barrier operations, and it's the just-in-time compiler's job to make sure they run as fast as possible.

To that end, C2 used to expand G1's barriers early in its pipeline since that would give it more chances to optimize it in later steps.
However, it turns out that G1's barrier operations don't optimize well and so the early expansion causes additional work for very little benefit.
ZGC was in a similar position a few years ago and adopted a late barrier expansion instead and now G1 does the same in JDK 24.
This considerably reduces the amount of work the JIT has to do - for the combination of G1 and C2, the savings can be as much as 10-20% of the JIT's work, so you should see a slight performance improvement on JDK 24.


## Experimental Compact Object Headers

> Imagine your heap space:
> A big chunk of memory, usually in the gigabytes, that your instances live in.
> The strings and collections, the data-transfer objects and web services, the customers and orders, all of that.
> On many workloads, the average object size is 256 to 512 bits, or 32 to 64 bytes, or 4 to 8 words, but not all of that is _your_ data.
> Usually 2 of each of those words are the so-called "object header" - that's between 20% and 40% of your heap!
>
> What's an object header?
> Can't we make it smaller?
> Imagine how much memory that would save us.
>
> And that's exactly what Project Lilliput, JDK Enhancement Proposal 450, and this Inside Java Newscast are all about.

Well, not _this_ Newscast but that old one from May 2023 was all about that.
It went into a lot of detail on how object headers work and how Project Lilliput and JEP 450, specifically, propose to reduce their size from 12 or 16 bytes on 64-bit hardware to just 8 bytes, thus saving applications an average of 10-20% heap of memory.

On JDK 24, compact object headers are an experimental feature that, quote:

> will have a broad impact on real-world applications.
> The code might have inefficiencies, bugs, and unanticipated non-bug behaviors.
> This feature must therefore be disabled by default and enabled only by explicit user request.
> We intend to enable it by default in later releases and eventually remove the code for legacy object headers altogether.

Compact object headers can be activated with `-XX:+UnlockExperimentalVMOptions -XX:+UseCompactObjectHeaders`.
(There, that was easy.)
If you have solid performance benchmarks for your application, I highly recommend running them with these options and reporting your results back to the hotspot-dev mailing list.
Everybody else, just sit back and relax, and let's wait for this feature to become permanent.
And in the meantime, let's check in on Billy.


## Ahead-of-Time Class Loading & Linking

I'm reporting from the Arctic where the only thing lower than the temperature... is your startup times with the inclusion of JEP 483!
JEP 483, Ahead-of-Time Class Loading and Linking, is the first of the Leyden JEPs to be included in a mainline JDK release.
Project Leyden is about reducing startup time, time to peak performance, and memory footprint, though this JEP primarily focuses on startup time.
To take advantage of this new feature currently requires a three-step process, though this should be simplified in future releases.

* The first step is to set `AOTMode` to `record` for a training run and providing the name of an `AOTConfiguration` file, where the data from that training run is stored.
* Step two is setting `AOTMode` to `create`, the name of the `AOTConfiguration` from the first step, and the name of the `AOTCache` to be created.
* And then finally, step three, is providing the `AOTCache` that was created and basking in the lower start up times in production.

In the JEP, they talk about how using the AOT cache reduced the startup time of the Spring PetClinic application by between 33 and 42%.
They also provide details on how to run a training run, but the most important part is:
The closer your training run matches production behavior, the more benefit you will see.

Now, if you are watching this video a little bit in the future, I will be releasing a video that deep-dives into JVM startup, which also covers class loading and linking.
So if you interested in learning about that subject, that video link will appear here, but you can also consider subscribing and turning on notifications so you will be notified when that video is released.
Also be sure to check out the JEP which provides additional details on this feature.
Ok Nicolai is going to talk about more integrity by default while I go warm up.


## More Integrity by Default

Thank you Billy, for blowing our entire special effects budget on that "startup time is lower than arctic temperatures joke" - totally worth it.
That completes the performance part, now let's talk about deprecations and removals in JDK 24.

<!-- IJN 73 -->
The Java platform makes a lot of promises, from type safety to its memory model, from visibility modifiers to finality, but they all hinge on one core property: integrity - the guarantee that the platform upholds the promises it makes.
At the same time, Java offers a bunch of mechanisms that can undermine this integrity:
Reflection can sidestep visibility and finality, `Unsafe` can corrupt memory, and native code can easily straight-up crash the JVM.
Under this tension, Java is currently developing a principled stance: integrity by default.
Operations that can undermine integrity are either replaced by alternatives that cannot or will be disabled by default to be enabled on demand by applications operators if they deem the tradeoffs beneficial.
And JDK 24 is taking further steps down that road:

<!-- JEP 498 -->
* The memory-access methods on `sun.misc.Unsafe`, that were deprecated for removal in JDK 23, will now issue a warning on first invocation.
  This behavior can be configured with the command-line option `--sun-misc-unsafe-memory-access`, which accepts values `allow` (the default in JDK 23), `warn` (the default on 24), `debug` for more information, and `deny`.
  And I highly recommend to run your app with `deny` to prepare for a future where it will be the default before the entire option is eventually removed together with those methods on `Unsafe`.
<!-- JEP 472 -->
* The foreign function and memory API used to require the command line flag `--enable-native-access` to allow execution of so-called _restricted_ operations - those that can undermine integrity.
  JDK 24 temporarily downgrades a lack of that option from error to warning, so that it can onboard the Java Native Interface, which used to just allow access to its potentially troublesome operations.
  Now both APIs contribute to the list of restricted operations, access to which is uniformly managed with two options:
  Use `--enable-native-access` to allow access for specific code and use `--illegal-native-access` to configure how code that didn't get the green light should be handled.
  That last one will get stricter over time with denying such access being the inevitable default.


## Disabled Security Manager

Back in the day, when Java applications routinely or at least occasionally ran untrusted code, for example user-provided plugins to a desktop application, the security manager seemed like a reasonable way to securing such apps.
If enabled, it operates under the _principle of least privilege_, meaning code is untrusted by default and cannot access the filesystem, the network, or other such resources unless explicitly allowed.
On the JDK side that means that over 1,000 methods must check for permissions and over 1,200 methods must elevate their privileges.
On the user side that means that an active and effective security manager requires careful navigation of its complex permission scheme.

While that may have been worth it for a decent chunk of Java applications in the past, the evolution from desktop apps to server-side code and the security features of modern operating systems, containers, and cloud environments, eroded that need to the point where security manager use is exceedingly rare.
But its maintenance burden remained and so in 2021, OpenJDK decided to phase out the security manager by deprecating it for removal in JDK 17.

Now, JDK 24 takes the next step and permanently disables it:

* setting the option `java.security.manager` to any value except `disallow` will lead to an error
* calling `System::setSecurityManager` will throw an `UnsupportedOperationException`

A few more options are impacted, but, importantly, the class `SecurityManager` as well as related methods remain for now, but are changed to have no effect, for example by doing nothing, returning `false`, etc.
If your project uses the security manager or even if you're not sure about it, please check out JEP 486 for a lot more details on the motivation, the current process, and future work.


## Bye, Bye 32-bit x86

The time of 32-bit x86 is coming to an end.
No new such hardware is being manufactured, the last Windows OS that supports it will reach End of Life in less than a year, and Debian announced a year ago that they'll soon stop supporting it, too.
Accordingly, OpenJDK is winding down its support for 32-bit x86:
The respective Windows port was deprecated in JDK 21 and is being removed in JDK 24 and the respective Linux port is deprecated in JDK 24 with the plan to remove it in 25.
This frees up development time within OpenJDK that used to be spent on implementing 32-bit variants of or even workarounds for more involved features like virtual threads or the FFM API.

Note that this has no implications for 32-bit x86 ports of older JDK versions.
So if you're planning to run JDKs like 8 or 21 on 32-bit hardware for a few more years, that's fine.
It's just that once you move to JDK 25, you'll very likely be forced to run that on 64-bit hardware.

And that's it for JDK 24 as well as for the Inside Java Newscast in 2024.
I hope you had a good time, we here at the Java Platform Group surely did.
We wish you all the best for the upcoming holiday weeks if you have some time off, and we'll see you again in 2025.
So long ...

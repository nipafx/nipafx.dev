---
title: "Java 24 Stops Pinning Virtual Threads (Almost) - Inside Java Newscast #80"
tags: [java-24, virtual-threads]
date: 2024-11-21
slug: inside-java-newscast-80
videoSlug: inside-java-newscast-80
description: "On Java 24, virtual threads will no longer be pinned inside synchronized blocks, which increases ease of adoption"
featuredImage: inside-java-newscast-80-a
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna look at JDK Enhancement Proposal 491, which is already integrated and available in the latest JDK 24 early access build, links to both in the description.
With this change, virtual threads are no longer pinned within `synchronized` blocks, which removes their biggest source of scalability issues.
We'll also look into the remaining cases of pinning and how to observe it before we briefly touch on thread capture and io_uring.
But first a quick virtual thread recap - jump to this timestamp to skip it.
Ready?
Then let's dive right in!


## Virtual Thread Recap

As you probably know, a virtual thread is about as real as virtual memory and just like it, it needs an underlying mechanism that does what the virtual thread claims to do, namely execute instructions.
At the very bottom of the abstraction cake, that mechanism is a CPU core.
One layer up sits the operating system that schedules OS threads on top of cores.
Another layer up sits the Java runtime that maps OS threads one to one to its own threads, which we now call _platform threads_.
Before Project Loom, all threads within the Java runtime were platform threads.

The icing on this abstraction cake are _virtual threads_.
The JVM maintains a dedicated pool of platform threads, called the _carrier thread pool_, and schedules virtual threads onto these carrier threads.
It does so by _mounting_ a virtual thread onto a carrier when work needs to be done and _unmounting_ it when the virtual thread blocks.
When unmounting, the virtual thread's data (like variables and stack frames) are copied to the heap and then, when the thread gets remounted, the data is copied to that new carrier thread, which is likely to be different from before.

In theory, as long as there are virtual threads that want to work, carrier threads are busy executing instructions, but there are two mechanism that can undermine this optimal scenario: pinning and capturing.

In either case, a blocked virtual thread may still be mounted onto a carrier thread, which must hence also block - that's not good because compared to virtual threads, carrier threads are a very expensive and rare resource.
But while the result is the same, pinning and capturing happen for different reasons and turn out different.
Let's start with pinning.


## Synchronized Pinning

There are situations where unmounting a virtual thread from a carrier thread would cause issues.
Take synchronization:

When code enters a synchronized method or block, it tries to acquire the monitor that is associated with the instance that is being synchronized on.
If the monitor is available, the thread acquires it and enters the block - otherwise it needs to wait until the monitor is released, which happens when the thread that currently holds it exits the synchronized block.
To implement that mechanism, the JVM stores for each monitor the ID of the thread that currently holds it, but, unfortunately, it doesn't know about virtual threads and so it stores the carrier thread ID.

Now imagine, there was no pinning.
A virtual thread enters a synchronized block, which means the JVM stores the ID of its carrier thread as holding that monitor.
Some blocking operation unmounts the virtual thread and sends the carrier thread back to the pool, where it picks up another virtual thread, which just so happens to run into the same synchronized block.
Should it enter?
No, the first virtual thread is still in that block, after all.
But can it enter?
Yes, because it happens to run on the carrier thread with the right ID.
Good luck debugging that!

The intermittent fix was to pin the virtual thread to the carrier thread when it acquires a monitor.
If there is no blocking operation while the monitor is held, pinning is free, but if there is, it guarantees correctness by ensuring that the carrier thread stays put and can't stroll off to violate the monitor semantics.
And for similar reasons, a virtual thread gets pinned when waiting to acquire a monitor and when calling `Object::wait`.

This is all good and works just fine... until it doesn't.
If your app happens to have a lot of synchronized methods with a lot of blocking operations within them, pinning can cause scalability issues and, in the worst case, even dead locks.

So the folks behind Project Loom, most notably Alan Bateman and Patricio Chilano Mateo, set out to fix this.
In JDK 24, the monitor mechanism knows about virtual threads and uses their ID to keep track of who holds which monitor.
Consequently, neither `synchronized` nor `Object::wait` requires pinning anymore.
That's great!
It removes the biggest hurdle for straightforward adoption  and scaling with virtual threads.
If that's not worth a like, I don't know what is.


## Native Pinning

Unfortunately, JDK 24 doesn't remove all pinning, though.
If you call native code, say a C library, that code may contain pointers to native variables on the stack that it can read and write at any time.
Stack variables belong to the thread, though, and so it is important that native code sticks with the same thread.
Otherwise this can happen:

* a virtual thread calls into native code
* the native code calls back into Java
* the Java code blocks the virtual thread
* and then the runtime unmounts the virtual thread and copies its stack to the heap

That last step severs the connection between the native code and its variables on the stack.
And unless the virtual thread is coincidentally remounted onto the same carrier thread, the pointers all point to the wrong thread's stack, which would lead to garbage reads and destructive writes.
That's catastrophic.

This issue could potentially be solved with some complex virtual memory mapping tricks, but there's a much simpler solution that still guarantees correctness:
When there's a native frame on the stack, pin the virtual thread to its carrier.
That way, any call from Java into native code is guaranteed to be executed by the same thread until it completes, regardless of intermittent callbacks into blocking Java code.
Of course that comes with the same scalability challenges as pinning during synchronization, but it's much rarer.
For this to become a noticeable drag, you need a lot of calls into native code that calls back into Java code that then ends up blocking - not particularly common.

That said, class loading goes through native code, so when virtual threads load classes, they're pinned.
That is probably most relevant in class initializers because if they contain blocking operations, which should be exceedingly rare, though, the virtual thread is not unmounted.
For more details, see the _Future Work_ section of JEP 491.

If you want to check whether the remaining pinning is of any concern to you, use JDK Flight Recorder to observe the event `jdk.VirtualThreadPinned`.
It is now emitted every time a virtual thread is pinned and includes the reason for pinning as well as the identity of the carrier thread.


## Capture During File I/O

Let's briefly talk about the other potential scalability issue for virtual threads and that's capture.
While waiting for locks, network sockets, now synchronization frees the carrier thread, many file system operations _capture_ it, meaning it will be blocked while file I/O is happening.
That's mostly down to OS and filesystem limitations but there was hope that this problem could be solved at least on Linux by relying on io_uring but that's not looking good:

1. Reimplementing file I/O on top of io_uring promises to be quite disruptive.
2. io_uring has varying support across kernels, distributions, and container environments.
3. It requires quite a bit of bookkeeping that is significant compared to read times from local SSDs.

So it's a lot of work for an improvement that is neither substantial across the board nor universally available and so it's been put on hold.
Never say never, I guess, but it's surely not gonna happen soon.

Talking about soon, in two weeks, JDK 24 will enter ramp-down phase 1, which means its feature set will be frozen.
I'll see you then so we can go over everything that made it - and it's a lot!
So long...

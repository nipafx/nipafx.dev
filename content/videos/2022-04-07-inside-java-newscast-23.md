---
title: "Virtual Thread Deep Dive - Inside Java Newscast #23"
tags: [project-loom]
date: 2022-04-07
slug: inside-java-newscast-23
videoSlug: inside-java-newscast-23
description: "Now that Project Loom's JEP 425 officially proposes virtual threads, it's time to take a close look at them: scheduling and memory management; mounting, unmounting, capturing, and pinning; observability; and and what you can do for optimal scalability - this episode has (almost) everything on virtual threads!"
featuredImage: inside-java-newscast-23
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle and today we're gonna dive deep into Project Loom's virtual threads:

* scheduling and memory management
* mounting, unmounting, capturing, and pinning
* observability
* what you can do for optimal scalability

Before getting to all that, I'll briefly explain why virtual threads are needed in the first place and how they relate to Java's classic threads.
If you already know that and want to skip that, check out the chapters on the timeline or in the description.

Ready?
Then let's dive right in!


## Why Virtual Threads?

### Classic Threads

Before we can go into virtual threads, we need to revisit classic threads or, how we will call them from here on out, _platform threads_.
The JDK implements them as thin wrappers around operating system threads, which are costly, so we cannot have too many of them.
In fact, the number of threads often becomes the limiting factor long before other resources, such as CPU or network connections, are exhausted.
In other words, platform threads often cap an application's throughput to a level well below what the hardware could support.

### Virtual Treads

While operating systems can't increase efficiency of their threads, the JDK can make better use of them by severing the one-to-one relationship between its threads and OS threads.
[Enter virtual threads!][425]

A virtual thread is an instance of `java.lang.Thread` that requires an OS thread to do CPU work, but doesn't while it's waiting for other resources.
When code running in a virtual thread calls a blocking I/O operation in the JDK API, the runtime performs a non-blocking OS call and automatically suspends the virtual thread until the operation finishes.
During that time, other virtual threads can perform calculations on that OS thread, so they're effectively sharing it.

Critically , virtual threads incur minimal overhead, so there can be many, many, many of them.
So just as operating systems give the illusion of plentiful memory by mapping a large virtual address space to a limited amount of physical RAM, the JDK gives the illusion of plentiful threads by mapping a large number of virtual threads to a small number of OS threads.
And just like programs barely ever care about virtual vs physical memory, does concurrent Java code have to care whether it runs in a virtual or a platform thread.
You can focus on writing straightforward, potentially blocking code - the runtime takes care of sharing the available OS threads to reduce the cost of blocking to near zero.

Virtual threads support thread-local variables, synchronized blocks, and thread interruption, and code working with `Thread` and `currentThread` won't have to change.
This means that existing Java code will easily run in a virtual thread without any changes or recompilation!
Once server frameworks offer the option to start a new virtual thread for every incoming request, all you need to do is update the framework and JDK, and flip the switch.

[425]: https://openjdk.java.net/jeps/425

### Speed, Scale, and Structure

It's important to understand what virtual threads are for.
They aren't faster threads - they don't magically execute more instructions per second than platform threads do.
What they're really good at is waiting.
Because they don't require an OS thread for that, potentially millions of them can wait for requests to the file system, databases, or web services to finish.
By maximizing the utilization of external resources, virtual threads provide larger scale, not more speed - they improve [throughput, not latency][pressler].

Beyond hard numbers, virtual threads can also improve code quality.
Their cheapness opens the door to a fairly new concurrent programming paradigm called _structured concurrency_.
I've covered that in [Inside Java Newscast #17][ijn#17] and if you haven't already, I highly recommend you watch it after this episode.

[ijn#17]: https://www.youtube.com/watch?v=2J2tJm_iwk0&list=PLX8CzqL3ArzX8ZzPNjBgji7rznFFiOr58&index=7
[pressler]: https://inside.java/2021/11/30/on-parallelism-and-concurrency/

## Virtual Thread Details

Ok, intro is done - let's look at the details!
We'll start with scheduling and memory.

### Scheduling and Memory

While the operating system schedules OS threads, and thus platform threads, virtual threads are scheduled by the JDK.
It does so indirectly by assigning virtual threads to platform threads, also called _mounting_, and unassigning them later, called _unmounting_.
The platform thread running a virtual thread is called its _carrier_ and from the perspective of Java code, the fact that a virtual and its carrier temporarily "share" an OS thread is invisible - for example stack traces and thread-local variables are fully separated.
Carrier threads are then left to the OS to schedule as usual.

To implement all that, the JDK uses a dedicated `ForkJoinPool` in first-in-first-out mode as virtual thread scheduler.
(Note that this is distinct from the common pool used by parallel streams, for example.)
By default, the scheduler uses as many platform threads as there are available processors, but that can be tuned with a system property.

So where do the stack frames of unmounted virtual threads go?
They are stored on the heap as so-called _stack chunk objects_.
Some virtual threads will have deep call stacks (like a request handler called from a web framework), but those spawned by them will usually be much more shallow (like a method that reads from a file).
While mounting a virtual thread could be implemented by copying all its frames from heap to stack, and then later back when it gets unmounted, most frames are actually left on the heap and copied lazily as needed.

So stacks grow and shrink as the application runs, which is a crucial ingredient in making virtual threads cheap enough to have so many and frequently switch between them.
Even better, there's a good chance that future work can further reduce memory requirements.

### Blocking, nay Unmounting

Typically, a virtual thread will unmount when it blocks on I/O (for example to read from a socket) or calls other blocking operations in the JDK (for example, `take` on a `BlockingQueue`).
When the blocking operation is ready to complete (the socket received the bytes or the queue can hand out an element), it submits the virtual thread back to the scheduler, which will, in FIFO (first-in-first-out) order, eventually mount it to resume execution.

However, despite prior work like in JEPs [353] and [373], not _all_ blocking operations in the JDK unmount the virtual thread - some _capture_ the carrier thread and the underlying OS thread, thus blocking both.
This can be due to imitations at the OS level (which affects many filesystem operations) or at the JDK level (like `Object.wait()`).
The capture of an OS thread is compensated by temporarily adding a platform thread to the scheduler, which can hence occasionally exceed the number of available processors - a maximum can be specified with a system property.

Unfortunately, there's one more imperfection in the initial proposal:
When a virtual thread executes a native method or a foreign function or executes code inside a synchronized block or method, the virtual thread will be _pinned_ to its carrier and a pinned thread will not unmount in situations where it otherwise would.
No platform thread is added to the scheduler in this situation, though, because there are a few things you can do to minimize the impact of pinning - more on that in a minute.

That means capturing operations and pinned threads will reintroduce platform threads that are waiting for something to finish.
This doesn't make an application incorrect, but it might hinder its scalability.
Fortunately, future work may make synchronization non-pinning and refactoring internals of the `java.io` package and implementing OS-level APIs like io_uring on Linux may reduce the number of capturing operations.

[353]: https://openjdk.java.net/jeps/353
[373]: https://openjdk.java.net/jeps/373

### Observability

Virtual threads are fully integrated with existing tools used to observe, analyze, trouble-shoot, and optimize Java applications.
For example, the [JDK Flight Recorder (JFR)][jfr] can emit events when a virtual thread:

* starts or ends,
* didn't start for some reason, or
* blocks while being pinned

To more prominently see the latter, you can configure the runtime via system property to print a stack trace when a thread blocks while pinned, where stack frames that cause the pinning are highlighted.

And since virtual threads are just threads, debuggers can step through them just as through platform threads.
Of course, some user interfaces might need updates to deal with millions of them or we'll get some very tiny scroll bars.

As I touched on in the episode on structured concurrency, virtual threads naturally organize themselves in a hierarchy.
That and their shear number make the flat format of traditional thread dumps unsuitable, though, so they will stick to just dumping platform threads.
A new kind of thread dump in `jcmd` will present virtual threads alongside platform threads, all grouped in a meaningful way, in both plain text and JSON.

[jfr]: https://docs.oracle.com/en/java/javase/17/jfapi/why-use-jfr-api.html

### Practical Advice

Ok, let's talk about a few things that will let you get the most out of virtual threads.
Interestingly, some of them will not so much require learning something new as unlearning something outdated.

Like the first item on the list:
Don't pool virtual threads!
Pooling only makes sense for expensive resources and virtual threads aren't.
Instead, create new virtual threads whenever you need to do stuff concurrently!

You might be using using thread pools to limit access to certain resources, like requests to a database.
Instead, use semaphores to make sure only a specified number of threads are accessing that resource.

```java
// WITH THREAD POOL
private static final ExecutorService
	DB_POOL = Executors.newFixedThreadPool(16);

public <T> Future<T> queryDatabase(
		Callable<T> query) {
	// pool limits to 16 concurrent queries
	return DB_POOL.submit(query);
}


// WITH SEMAPHORE
private static final Semaphore
	DB_SEMAPHORE = new Semaphore(16);

public <T> T queryDatabase(
		Callable<T> query) throws Exception {
	// semaphore limits to 16 concurrent queries
	DB_SEMAPHORE.acquire();
	try {
		return query.call();
	} finally {
		DB_SEMAPHORE.release();
	}
}
```

For good scalability with virtual threads, avoid frequent and long-lived pinning by revising synchronized blocks and methods that run often and contain I/O operations, particularly long-running ones.
A good alternative to synchronization is a `ReentrantLock`.


```java
// with synchronization (pinning 👎🏾):
// `synchronized` guarantees sequential access
public synchronized String accessResource() {
	return access();
}
```

```java
// with `ReentrantLock` (not pinning 👍🏾):
private static final ReentrantLock
	LOCK = new ReentrantLock();

public String accessResource() {
	// lock guarantees sequential access
	LOCK.lock();
	try {
		return access();
	} finally {
		LOCK.unlock();
	}
}
```

Another aspect that works correctly in virtual threads but deserves being revisited for better scalability are thread-local variables, both regular and inheritable.
Virtual threads support them just like platform threads do, but because virtual threads can be very numerous, thread locals should only be used after careful consideration.
In fact, as part of Project Loom, many uses of thread locals in the _java.base_ module were removed to reduce memory footprint when running with millions of threads.
An interesting alternative for some use cases that is currently being explored in [a draft JEP are scope-local variables][jep-scope] - more on them in a future Newscast.
If you don't want to miss that, hit that subscribe button like edit on Twitter.

[jep-scope]: https://openjdk.java.net/jeps/8263012

## Outro

And that's it for today on the Inside Java Newscast.
If want even more Project Loom in your life, click over there for [the recent Newscast on structured concurrency][ijn#17] or up here for [a conversation I had with project lead Ron Pressler][state-loom] about it.
Let me know your opinions and questions in the comments below, like, share, and I'll see you again in two weeks.
So long...

[state-loom]: https://www.youtube.com/watch?v=KG24inClY2M

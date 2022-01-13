---
title: "Project Loom Brings Structured Concurrency - Inside Java Newscast #17"
tags: [java-18, project-loom]
date: 2021-12-16
slug: inside-java-newscast-17
videoSlug: inside-java-newscast-17
description: "Project Loom aims to bring structured concurrency to Java, a concept that compares to \"regular\" concurrency like structured programming compares to GOTO-programming - let's dip our toes into this new concept. Also: JDK 18 feature freeze, JDK migration guide, and nifty things to do with the new simple web server."
featuredImage: inside-java-newscast-17
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle and today we're gonna talk about structured concurrency as envisioned by Project Loom as well as JDK 18 and a few other bits and bytes.

Ready?
Then let's dive right in!


## Structured Concurrency

[Project Loom][loom] aims to bring lightweight user-mode threads to the JVM - sometimes called _fibers_ although Loom settled on the term _virtual threads_.
This promises to increase throughput for a wide variety of applications but as it often goes, if a feature becomes better, faster, or easier by an order of magnitude, you don't just use it the same way but faster, instead you start using it in new and different ways.

> That is the kind of performance that actually changes how you work.
> It's no longer doing the same thing faster, ot's allowing you to work in a completely different manner.

And that's what structured concurrency is - a paradigm for writing concurrent code that's built on low-overhead threads.
So let's dip our tows into it.

What follows is based on [an article][ij-pressler] and a [JDK Enhancement Proposal draft][jep-sc] that Ron Pressler, lead of Project Loom, published in recent weeks.
The term _structured concurrency_ was [coined by Martin Sústrik][sc-sustrik] and later popularized in [a blog post by Nathaniel Smith][sc-smith].
Links to all that in the description.

[loom]: https://openjdk.java.net/projects/loom/
[ij-pressler]: https://inside.java/2021/11/30/on-parallelism-and-concurrency/
[jep-sc]: https://openjdk.java.net/jeps/8277129
[sc-sustrik]: https://250bpm.com/blog:71/
[sc-smith]: https://vorpus.org/blog/notes-on-structured-concurrency-or-go-statement-considered-harmful/

### Concurrency vs Parallelism

Before we get into the _structured_ part, let's shine a light on _concurrency_.
What exactly does it mean, particularly compared to _parallelism_?

When you have a task and decide to split that up, so that multiple CPU cores can compute partial solutions in parallel to solve the task in less wall-clock time, that's _parallelism_.
When you have a number of tasks that you need to arrange in a way that solves as many of them in any given time unit as possible, that's _concurrency_.
And these two are quite different!

With parallelism, it's the algorithm / the solution that produces multiple tasks and so you're in control over their shape and number.
With concurrency, tasks emerge from the environment, they're part of the problem.
Parallel tasks coordinate use of resources, say CPU time or data structures, whereas concurrent tasks compete over them, particularly I/O.
Success for solving parallel tasks is mainly measured in latency, for concurrent tasks the more interesting metric is throughput.

With parallelism, threads are mostly an abstraction over CPU cores:
You want to make sure that there are enough threads to keep all cores busy, but there's little point in going far beyond that number.
With concurrency, threads are mostly an abstraction over tasks:
Ideally, you have one thread per task, so you can make progress on each of them whenever resources are available.

### Lack of Structure

Structured programming taught us that there's a better way to write sequential logic than with an endless sea of commands with GOTOs pointing back and forth across it.

```java
// spaghetti code in an
// unstructured Java-clone

String[] array = // ...
String term = // ...
int index = 0

goto search;
continue:
// use `index`...

search:
if (term == array[index])
	goto continue;
index++;
if (index < array.length)
	goto search;
index = -1;
goto continue;
```

An essential ingredient is that code constructs, for example a block or a subroutine, should have a single entry point and clearly defined exit points.
This went beyond being a mere programming pattern and seeped into languages and runtimes, for example the JVM's call stack.

```java
// same in structured Java-clone

int index = search(/*...*/, /*...*/);
// use `index`...

// search as subroutine
private int search(
		String[] array,
		String term) {
	// single entry point
	int index = 0;
	while (index < array.length
		&& term == array[index])
		index++;

	// defined exit points
	if (index == array.length)
		return -1;
	else
		return index;
}
```

In a sense, typical concurrent programming is similar to unstructured programming:

* splitting into concurrent subtasks and later joining them often happens in different methods or even classes, making it hard to follow the logic
* while there's support for error-handling, premature abortion, abandoning subtasks, etc., their composition across multiple subtasks is often ad-hoc
* the JVM understands none of this and sees every thread as an island of its own, which makes it tough to follow a task's progression through concurrent workflows or interpret a snapshot of a system's threads

```java
// the task is to load a `User`, which consists of
// two subtasks, spawned in respective methods

public User loadUser(String id)
		throws InterruptedException {
	// if `loadUser` gets interrupted, how can
	// we (easily) interrupt these two `load...`s?
	Future<UserData> userData = loadUserData(id);
	Future<Image> image = loadProfileImage(id);
	try {
		// if we pause/thread-dump here, how can we
		// find the threads this thread is awaiting?
		return new User(
				userData.get(),
				image.get());
	} catch (ExecutionException ex) {
		// if one of the two `load...`s fails, how
		// can we (easily) cancel/abandon the other?
		throw new RuntimeException(ex);
	}
}

public Future<UserData> loadUserData(String id) {
	// spawns a new logical thread, but how can
	// we (easily) see where does it's shut down?
	return executor.submit(() -> /* ... */);
}

public Future<Image> loadProfileImage(String id) {
	return executor.submit(() -> /* ... */);
}
```

Quoting from the JEP:

> The JDK's concurrency building blocks are too primitive to express these high-level relationships, and as we gain concurrency, we lose the benefits structure gives us in sequential code.

### Adding Structure

So lets add some structure to our concurrency.
The core principle is:

> When the flow of execution splits into multiple concurrent flows, they rejoin in the same code block.

The first step:
Don't reuse threads!
Instead, spin them up when you need them and shut them down after in the same block, binding their lifetime to the block's scope.

Second step:
Interpret threads that are used in such a context as children of the thread that started them and as siblings of one another.

Third step:
Add programming constructs that make it easy to get results, handle errors, abandon or abort threads, etc., all based on them working as a group.

To add a bit more detail to each point.
When I said "don't reuse threads", that sounds dangerous.
They're not quick to get and you don't want to let their number grow uncontrolled, right?
Well, that's operating system threads, you're thinking about - Loom's virtual threads don't have those properties, they'll be cheap in every sense, so all is good.

The second point, establishing relations between threads, has a particularly important implication for debugging and monitoring.
It creates a hierarchy that encapsulates the entire computation of a task, regardless of how many subtasks and sub-subtasks and so forth it spawned.
In a few years, that will be as central for debugging as call stacks and stacktraces are today.

On the third step, adding programming constructs, we're gonna cut it short.
This is an entire big thing that we don't have time for today, but we'll definitely revisit in the future.
If not as part of a Newscast, then definitely in [Jose's excellent JEP Cafe][jep-cafe] once this draft matures.

That said, the draft JEP does define an API that's a gentle introduction to the concept and it's already available in the current Loom early access builds.
If this topic interests you, read the JEP, experiment with the API, and take your real-life feedback (not API bikesheds) to the [Loom mailing lists][loom-mail].

[jep-cafe]: https://www.youtube.com/playlist?list=PLX8CzqL3ArzV4BpOzLanxd4bZr46x5e87
[loom-mail]: https://mail.openjdk.java.net/pipermail/loom-dev/


## Bits & Bytes

### Java 18 Ramp-Down Phase 1

Last week, the [JDK 18] repository was forked from the main line and entered rampdown phase 1.
That means the feature list is final - you can see it scroll by here in [a Twitter thread][jdk18-twitter] that I will link in the description.

From now on, only bug fixes will be made in that repo.
On January 20th, this will be limited to severe bugs and on February 10th, we'll see the first release candidate.
Then there's two more weeks for critical bugs until a final release candidate is released, but the OpenJDK contributors have gotten so good at this, that the chances are good that it will be RC1 that's promoted to general availability on March 22nd.

If you want to understand this process better, check out [Inside Java Newscast #6][ijn#6], where I go into more details on issues, repositories, and the various phases.

[JDK 18]: https://jdk.java.net/18/
[jdk18-twitter]: https://twitter.com/nipafx/status/1468959203574177804
[ijn#6]: https://www.youtube.com/watch?v=Twwpk6vub1M&list=PLX8CzqL3ArzX8ZzPNjBgji7rznFFiOr58&index=12

### JDK Migration Guide

In the last week, the [JDK Migration Guide][mig] made the rounds.
It's brand new...(1) new...(1) somewhat new...(3) relatively...(3) ok, ok!
Anyway it's there for you if you need to upgrade your code base to the next Java version

[mig]: https://docs.oracle.com/en/java/javase/17/migrate/getting-started.html

### Simple Web Server Shenanigans

Last [episode][ijn#15], Billy told you about the basics of the Simple Web Server that ships with JDK 18.
A few days later, Julia Boes, OpenJDK developer at Oracle and co-creator of this cool little tool, published an article on Inside Java, where she used the server for some nifty use cases like serving from an in-memory file system or a ZIP file.
Check it out - As always, [link in the description][server].

[ijn#15]: https://www.youtube.com/watch?v=IsCEzP-inkU&list=PLX8CzqL3ArzX8ZzPNjBgji7rznFFiOr58&index=1
[server]: https://inside.java/2021/12/06/working-with-the-simple-web-server/


## Outro

And that's it for today on the Inside Java Newscast.
If you have any questions about what I covered in this episode, ask ahead in the comments below and if you enjoy this kind of content, help us spread the word with a like or by sharing this video with your friends and colleagues.
Have a great end of the Gregorian year, if that's your preferred way of counting them, and I'll see you again in the new one.
So long...

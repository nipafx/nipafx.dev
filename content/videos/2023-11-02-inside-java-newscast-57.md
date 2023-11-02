---
title: "Better Java Streams with Gatherers - Inside Java Newscast #57"
tags: [streams]
date: 2023-11-02
slug: inside-java-newscast-57
videoSlug: inside-java-newscast-57
description: "Stream::gather is a new intermediate meta-operation that allows the JDK and us to implement all kinds of intermediate operations as `Gatherer`s without overloading the `Stream` interface"
featuredImage: inside-java-newscast-57
repo: java-x-demo
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and while I'm notoriously excited about every new Java feature, I'm particularly thrilled about this one.
Most of us have been using the stream API for almost a decade now and while it works great, there are quite a few intermediate operations that I miss day to day:
Windowing, folding, subsequencing.

So what's the news?
We're gonna get all those operations?
"Yes" and "no".
Or rather, "no, but yes".

Let me explain:
JDK Enhancement Proposal 461 proposes an intermediate _meta_-operation that allows the JDK and us to implement all kinds of intermediate operations without directly overloading the `Stream` interface.
This new API is to intermediate operations what collectors are to terminal operations and the name is similar, too:
We're talking about "gatherers".
Let's dive right in!

## Gatherer

### Terminology

A `Gatherer` consists of four functions and we'll go through them one by one with some examples to see what their tasks are.
But before we start, let's quickly rehash some terminology:

A stream pipeline starts with a source (like calling `stream()` on a list), followed by a number of intermediate operations (those are the methods that return a `Stream`), and finally a terminal operation (like `toList` or the more general `collect`).
Source, intermediate, terminal operations - they are all stages in such a stream pipeline and the elements that come from the source are transformed, filtered etc. from one stage to the next.

Now, JEP 461 proposes to add a new intermediate operation `gather` that accepts a `Gatherer` and returns a transformed `Stream`.
Let's talk about the four functions that make it work.

### Integrator

We start with the `Integrator`.
This is the main function that consumes and emits elements.
Its input is a state, more on that in a minute, an element from the previous stream stage, and an instance of type `Downstream` that can be used to emit elements to the next stage.
Its boolean return value signals whether it wants to process more elements after the current one.

The simplest possible integrator does nothing and just passes each element on.
To do that, on each call, it takes the element that's passed to it, calls `downstream::push` with it, and then returns `true` to signal that more elements can be processed.

```java
public static <T> Gatherer<T, ?, T> doNothing() {
	Integrator<Void, T, T> integrator =
		(_, element, downstream) -> {
			downstream.push(element);
			return true;
		};
	return Gatherer.of(integrator);
}
```

Other simple intermediate operations are map and filter, which we can reimplement as gatherers.
The integrator for a map takes the input element, applies the mapping function and passes the new element downstream.

```java
public static <T, R> Gatherer<T, ?, R> map(
		Function<? super  T, ? extends R> mapper) {
	Integrator<Void, T, R> integrator =
		(_, element, downstream) -> {
			R newElement = mapper.apply(element);
			downstream.push(newElement);
			return true;
		};
	return Gatherer.of(integrator);
}
```

The integrator for a filter takes the input element, applies the predicate and, if it returns true, passes the element on - otherwise it does nothing with it.

```java
public static <T> Gatherer<T, ?, T> filter(
		Predicate<? super  T> filter) {
	Integrator<Void, T, T> integrator =
		(_, element, downstream) -> {
			var passOn = filter.test(element);
			if (passOn)
				downstream.push(element);
			return true;
		};
	return Gatherer.of(integrator);
}
```

Both integrators always return `true` because they'll never stop processing elements.

Now let's do something more interesting and implement a stateful operation.

### Initializer

A stateful operation is one that creates and updates state - shocking, I know.
These two aspects, creation and updates, are executed by two different functions.

* Creation is the task of the initializer, which is just a fancy name for a `Supplier`.
  It is called before the first element is processed to create the initial state instance.
* State updates happen during integration.
  Remember a minute ago when I said that a state is passed to the `Integrator`?
  That happens, so it can read and potentially mutate it.

Let's reimplement the stream operation `limit` with that.
It needs to keep track of how many elements it has already seen, so we'll need a mutable counter.
`AtomicInteger` fits the bill.
So our initializer returns a new instance of `AtomicInteger`, starting with value 0.
The stream API will then pass that instance to our integrator, which gets the integer, interpreting it as the current element's index, before incrementing it.
A simple comparison of that index with the integer passed to our `limit` informs our integrator whether it wants to pass the element on.
Done.
Or are we?

```java
public static <T> Gatherer<T, ?, T> limit(int numberOfElements) {
	Supplier<AtomicInteger> initializer = AtomicInteger::new;
	Integrator<AtomicInteger, T, T> integrator =
		(state, element, downstream) -> {
			var currentIndex = state.getAndIncrement();
			if (currentIndex < numberOfElements)
				downstream.push(element);
			// ...
		};
	return Gatherer.ofSequential(initializer, integrator);
}
```

What should the integrator return?
If it's always `true`, it will consume the entire stream.
That's technically correct but wasteful for finite streams and a big problem for infinite stream.
So this is the first example where the integrator returns `false`, namely when the next element would be beyond the limit.

```java
public static <T> Gatherer<T, ?, T> limit(int numberOfElements) {
	Supplier<AtomicInteger> initializer = AtomicInteger::new;
	Integrator<AtomicInteger, T, T> integrator =
		(state, element, downstream) -> {
			var currentIndex = state.getAndIncrement();
			if (currentIndex < numberOfElements)
				downstream.push(element);
			return currentIndex + 1 < numberOfElements;
		};
	return Gatherer.ofSequential(initializer, integrator);
}
```

Another stateful operation, and arguably a cooler one, only emits elements that are larger (by a given `Comparator`) than all the elements seen previously.
This transforms a sequence into an increasing subsequence, so for example "1, 3, 2, 5, 1" gets turned into "1, 3, 5".
To implement this, the initializer returns an empty `AtomicReference` as initial state.
The integrator then uses the comparator to figure out whether the current element is larger than the one in the state and, if so, emits it and writes it to the state object.
Otherwise, it ignores it.
And it always returns `true` to continue processing the stream because you never know whether a later element won't be larger.

```java
public static <T> Gatherer<T, ?, T> increasing(
		Comparator<T> comparator) {
	Supplier<AtomicReference<T>> initializer = AtomicReference::new;
	Integrator<AtomicReference<T>, T, T> integrator =
		(state, element, downstream) -> {
			T largest = state.get();
			var isLarger = largest == null
				|| comparator.compare(element, largest) > 0;
			if (isLarger) {
				downstream.push(element);
				state.set(element);
			}
			return true;
		};
	return Gatherer.ofSequential(initializer, integrator);
}
```

But what if we need to do something after the last element?
Some kind of final operation?
That's where the third function, the ~finalizer~ finisher comes in.

### Finisher (not Finalizer!)

After our gatherer is done integrating, it will get one final chance to emit elements.
To that end, the state and downstream are passed to the ~finalizer~ finisher function, which can emit more elements as it sees fit.

One example operation where this comes in real handy is a grouping function that transforms a stream of elements into a stream of groups of elements.
In such cases you usually only emit a group once it's completed but, when you're processing the stream's last element, you don't know that you need to complete the current group.
And if you don't, the last group is missing.

A simple example of this is an operation that emits groups of fixed size, which is given as a parameter:
The initializer creates an empty array list as state and the integrator adds the element to the list and, if it reached the desired size, emits a copy of it before clearing the list.
You can see how this can leave the last group hanging if the last element didn't happen to complete it.
So our ~finalizer~ finisher just takes that list and, if it's not empty, emits it, to make sure that the last couple of elements show up in a group in the downstream stage.

```java
public static <T> Gatherer<T, ?, List<T>> fixedGroups(int size) {
	Supplier<List<T>> initializer = ArrayList::new;
	Integrator<List<T>, T, List<T>> integrator =
		(state, element, downstream) -> {
			state.add(element);
			if (state.size() == size) {
				var group = List.copyOf(state);
				downstream.push(group);
				state.clear();
			}
			return true;
		};
	BiConsumer<List<T>, Downstream<? super List<T>>> finisher =
		(state, downstream) -> {
			var group = List.copyOf(state);
			downstream.push(group);
		};
	return Gatherer.ofSequential(initializer, integrator, finisher);
}
```

A more interesting example would be to turn our increasing subsequence operation into one that emits portions of the original sequence that are increasing, so "1, 3, 2, 5, 1" gets turned into "[1, 3], [2, 5], [1]".
I'll leave that as an exercise to you.
Or, if you're lazy, check out the video I published on my private channel where I implement all `Gatherer` examples given here and a few more.

<contentvideo slug="implementing-gatherers"></contentvideo>

### Combiner

The last of the four operations is the combiner.
It's only needed for parallel streams, but would you look at that!, it's already way past bedtime for me, so I'll leave this non-trivial topic to the eventual JEP Cafe.


## Gatherers

So JEP 461 proposes `Stream::gather`, the `Gatherer` interface, and a few more types that needs.
It is not currently targeted to any release, but I hope that it previews in 2024, ideally in JDK 22.

Once the feature is final, we get the capability to express all kinds of intermediate operations by implementing them as a `Gatherer` and passing it to `Stream::gather`.
The easiest way to share them is to add the factory methods that create them to some utility class.
In fact, that's exactly what JEP 461 proposes because it also comes with a `Gatherers` class (plural; again, much like `Collectors`) that contains operations like folding, scanning, sliding windows, and a concurrent map that spawns a virtual thread for each application of the mapping function.
Check out more about all that in the JEP that is of course linked in the description.


## Oracle VS Code Extension

One more thing before I let you go:
If you're using Visual Studio Code / VS Code, whether as a new Java developer, for experiments with new Java features, or for work on regular projects, you should absolutely try out [the new Oracle Java extension](https://marketplace.visualstudio.com/items?itemName=Oracle.oracle-java).
It has a few cool perks over the default Java extension:

* it's based on javac for earlier support of new version, like 21 right now and soon 22-EA
* it has better Gradle integration
* and has overall a much smoother development experience

I'll leave [a few links](https://inside.java/2023/10/18/announcing-vscode-extension/) related to the extension in the description, right under the like button.
Which, you know, you could press if you check them out.
That helps the channel and let's more Java developers know about gatherers, which spares you from having to explain it to them.
Win, win!
Also, subscribe, and I'll see you again in two weeks.
So long...

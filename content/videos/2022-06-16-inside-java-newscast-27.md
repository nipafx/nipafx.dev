---
title: "Java 19 - The Best Java Release? - Inside Java Newscast #27"
tags: [java-19, project-amber, project-loom, project-panama]
date: 2022-06-16
slug: inside-java-newscast-27
videoSlug: inside-java-newscast-27
description: "Java 19 is the first release to preview Project Loom's virtual threads and structured concurrency, Project Amber's record patterns, and Project Panama's foreign memory and function APIs. It also continues previews of pattern matching in switch and vector API. Put together, this makes it the most groundbreaking Java release in years and probably for years to come!"
featuredImage: inside-java-newscast-27
---

## Intro

Welcome to Crete, everyone!
I'm here on holiday right now, which means I should be sitting on the beach, sipping Gin Tonics and getting sun-burnt, but then I couldn't tell you about the most groundbreaking Java release in recent years and probably for years to come.

<pullquote>Is he talking about Java 19?</pullquote>

Indeed, I am!
And thanks for asking, Billy.

<pullquote>You're welcome</pullquote>

Oh, I should probably mention that while I'm in paradise talking to you about Java, Billy is stuck in Kansas, sitting in his room, grumpily editing this episode.

<pullquote>It's actually Missouri</pullquote>

Say "Hi", Billy!

<pullquote>No</pullquote>

Hah, funny man.

Anyway, [JDK 19][jdk-19] has been forked last week, so lets go over what code you can write that you couldn't write before and why this makes for a monumental release - let me know in the comments whether you agree.
There's lots more to talk about for all of these features, so I'll put plenty of links in the description.
Ready?
Then let's dive right in!

[jdk-19]: https://jdk.java.net/19/


## Pattern Matching in Switch

With [a modernized switch][jep-361], [type patterns][jep-394] as the first instance of patterns, and [sealed classes][jep-409] in place, Java 19 makes headway on putting them together:
[Using patterns in switch.][jep-427]
This takes a bit more time to shake out all the details and is currently in the third preview.

```java
enum MyBoolEnum { FALSE, TRUE }

MyBoolEnum bool = // ...
int value = switch(bool) {
	case FALSE -> 0;
	case TRUE -> 1;
};
```

```java
double area;
if (shape instanceof Rectangle r)
	area = r.height() * r.width();
```

```java
sealed interface Shape
	permits Rectangle, Circle {
	// ...
}

Shape shape = // ...
double area;
if (shape instanceof Rectangle r)
	area = r.height() * r.width();
else if (shape instanceof Circle c)
	Math.PI * square(c.radius());
// no benefits from sealed, yet
```

```java
Shape shape = // ...
double area = switch (shape) {
	case Rectangle r ->
		r.height() * r.width();
	case Circle c ->
		Math.PI * square(c.radius());
}
```

A few noteworthy aspects:

* Exhaustiveness is not only checked for switch expressions but also for switch statements if they use patterns.
* [If the switch variable is `null`][ijn-24], a `NullPointerException` will be thrown unless a `case null` handles it.
* While using patterns is nice, it doesn't capture all checks you may want to apply to an instance and so `when` clauses allow you to add additional boolean expressions to refine cases.
* This is not just about type patterns, but more generally all kinds of patterns in switch.
  More patterns introduced in the future will "just work" in switches.

```java
Shape shape = // ...
// must be exhaustive
// (even it it were a statement)
double area = switch (shape) {
	// without this line a null shape
	// would lead to NPE
	case null -> 0;
	// pointless "optimization"
	// to show off `when`
	case Rectangle r when r.height() == 1 ->
		r.width();
	case Rectangle r ->
		r.height() * r.width();
	case Circle c ->
		Math.PI * square(c.radius());
	// because Shape is sealed, compiler
	// knows all cases are covered and
	// no default branch is needed
}
```

So Java 19 is doing all the right things, like the new requirement of `case null` for `null` handling, and I feel it in my old bones, I don't think there'll be a fourth preview.
And while finalizing this proposal won't be the end of Java's evolution in this space, it will be an important milestone.
We'll finally have all the pieces we need to start using pattern matching in our daily work, in anger as the Brits say!

<pullquote>The Brits?! Don't a lot of people use "in anger"?!</pullquote>

And it also frees up Project Amber for other work, for example on... record patterns.

[jep-361]: https://openjdk.java.net/jeps/361
[jep-394]: https://openjdk.java.net/jeps/394
[jep-409]: https://openjdk.java.net/jeps/409
[jep-427]: https://openjdk.java.net/jeps/427
[ijn-24]: https://www.youtube.com/watch?v=ENX5kHblFlY


## Record Patterns

Inspecting an instance's type is nice and all, but sometimes you need to reach deep in and special-case the order where the buyer is an employee and not a customer or where the order amount is above a certain threshold.
[Record patterns][jep-405] let you do all that easily and declaratively by [taking apart a record][ijn-26] into its constituent components.

<pullquote>Doesn't this violate encapsulation?</pullquote>

Ah, remember that records are all about transparency, so if you want to encapsulate your data, they're not the right choice anyway.

<pullquote>I knew that, but Nicolai forced me to say that</pullquote>

So, when applying an `instanceof` check in an `if` or switching over an instance, you can write what looks like the record's canonical constructor to declare variables and assign them the components' values in one go.
You don't actually have to use the same names, though.
Components are identified by their position and you can give the variables any name you want.
And you don't have to use their types either!
You can use `var` to have it inferred or use a subtype to only match those instances whose component has that exact type.
This way you can, for example, easily special-case orders whose buyer is an employee.

```java
record Order(Buyer buyer, Items items)
	implements Action { }
class Employee implements Buyer { }
class Customer implements Buyer { }

if (action instanceof
	Order(Employee emp, var items)) {
	// use `emp` and `items`
} else if (action instanceof
	Order(Customer c, Items items)) {
	// use `c` and `items`
}
```

All this is very exciting!
Not only because it's gonna be very handy for handling simple data and is another step to records as full-blown algebraic data types, this preview is also testament to Project Amber's shift towards introducing more patterns!
Deconstruction for records, maybe for classes, possibly for destructuring on assignment, we may get custom patterns - so many thrilling options and JDK 19 is taking the first step!

<pullquote>Very exciting</pullquote>

[jep-405]: https://openjdk.java.net/jeps/405
[ijn-26]: https://www.youtube.com/watch?v=YM0CFX3Ap_g


## Foreign Function & Memory API

I'm no native code guy, in fact I can't even write C or C++.

<pullquote>He can barely write Java...</pullquote>

So I'm not gonna embarrass myself talking about things that I don't understand.
Instead, I'm gonna show you a code snippet of the foreign function and memory API that sorts a string array with the C library function radixsort.

And I'm gonna let Billy talk you through it.

<pullquote>What?!</pullquote>

```java
Linker linker = Linker.nativeLinker();
SymbolLookup stdlib = linker.defaultLookup();
MethodHandle radixSort = linker
	.downcallHandle(stdlib.lookup("radixsort"), ...);

String[] onHeap   = { "mouse", "cat", "dog", "car" };

SegmentAllocator allocator = implicitAllocator();
MemorySegment offHeap  = allocator
	.allocateArray(ValueLayout.ADDRESS, onHeap.length);

for (int i = 0; i < onHeap.length; i++) {
    MemorySegment cString = allocator
		.allocateUtf8String(onHeap[i]);
    offHeap.setAtIndex(ValueLayout.ADDRESS, i, cString);
}

radixSort
	.invoke(offHeap, onHeap.length, MemoryAddress.NULL, '\0');

for (int i = 0; i < onHeap.length; i++) {
    MemoryAddress cStringPtr = offHeap
		.getAtIndex(ValueLayout.ADDRESS, i);
    onHeap[i] = cStringPtr.getUtf8String(0);
}
```

> Well, this is unexpected.
> Ok, so, first you'll want to find the foreign function, in this case radixsort, on the C library path.
> Next, you'll allocate on-heap memory to store the strings.
> Then you'll allocate off-heap memory to store an equivalent number of pointers.
> Copy the strings from on-heap to off-heap.
> So you will want to then sort the off-heap data by calling the foreign function radixsort.
> And last, copy the new reordered strings from off-heap to on-heap.
> Ok back to you, Nicolai!

Thank you, Billy!

The APIs have been incubating independently for a few releases and have seen some revamps during that time, but Java 19 probably puts an end to that.
It ships them [as a preview in their final package][jep-424] and no major changes are foreseeable - another milestone, this time from Project Panama, achieved by 19.
Another crucial ingredient is `jextract`, which recently became a stand-alone project to be evolved more rapidly than the JDK release cadence would allow.
There's [a link to the GitHub][jextract] in the description.

[jep-424]: https://openjdk.java.net/jeps/424
[jextract]: https://github.com/openjdk/jextract


## Virtual Threads

[Plenty][ijn-23] has been said about Project Loom's [virtual threads][jep-425], most recently in [the latest JEP Cafe][cafe-11] that I highly recommend you check out.
So I'll keep this super short!

<pullquote>Not short enough...</pullquote>

In all ways that matter, virtual threads behave like platform threads, but are cheap enough that you can have millions and millions more.
This gives you the scalability of asynchronous programming models with the simplicity of synchronous code.
It can't possibly be that simple?
Well, [not quite][ijn-25] but almost - as I said in the intro, check out the linked sources for more.

```java
try (var executor = Executors
		.newVirtualThreadPerTaskExecutor()) {
	// create one million virtual threads that...
	// do nothing - still, pretty cool!
	for (int i = 0; i < 1_000_000; i++)
		executor.submit(() -> {
			Thread.sleep(Duration.ofSeconds(1));
			return i;
		});
}
```

Your interaction with virtual threads will likely be very indirect.
While there's a new `Thread.Builder` API and new methods `Thread.ofVirtual` and `Thread.startVirtualThread(Runnable)`, you probably won't use them very often.

```java
Runnable runnable = // ...
Thread thread = Thread
	.ofVirtual()
	.name("duke")
	.unstarted(runnable);
```

A good way to start multiple virtual threads is with the `Executor` that uses a virtual thread per task.
And I'll come to an even better way in a minute.
But most threads in your app will likely not be created by you but by your web server.
And it will hopefully get an option soon to spawn a virtual thread instead of a platform thread for each request, so your code runs in virtual threads by default.

All of this is truly groundbreaking and Java 19 will always be remembered as the release that first previewed Project Loom's core.
But they're not done yet - Java 19 isn't, Loom isn't, even Java 19 on Loom isn't!

[ijn-23]: https://www.youtube.com/watch?v=6dpHdo-UnCg
[ijn-25]: https://www.youtube.com/watch?v=KuHhUDhIFYs
[jep-425]: https://openjdk.java.net/jeps/425
[cafe-11]: https://www.youtube.com/watch?v=lKSSBvRDmTg


## Structured Concurrency

Loom's other big play is introducing [structured concurrency][jep-428] to Java.
Its principle is that if a task splits into concurrent subtasks, they all return to the task's code block.
Consequently, the lifetimes of all concurrent subtasks are confined to a single syntactic block, which means they can be reasoned-about and managed as a unit.

To that end, the parent task creates a new scope, decides on the error handling it needs, spawns the subtasks, and then awaits their completion.
It can process any errors that occurred or, if all went well, compose the subtasks' results to its result.

```java
UserOrder load(long userId, long orderId) throws InterruptedException {
	try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
		// spawn subtasks
		Future<String> user = scope.fork(() -> findUser(userId));
		Future<Integer> order = scope.fork(() -> fetchOrder(orderId));

		// wait for them to complete...
		scope.join();
		// ... and throw errors if any
		scope.throwIfFailed();

		// here, both subtasks succeeded
		return new UserOrder(user.resultNow(), order.resultNow());
	} catch (ExecutionException ex) {
		// handle errors if any
	}
}
```

Nesting subtasks in a parent's block induces a hierarchy that can be represented at run time when structured concurrency builds a tree-shaped hierarchy of tasks.
This tree is the concurrent counterpart to a single thread's call stack and tools can use it to present subtasks as children of their parent tasks.
That means your IDE has all the information it needs to let you navigate from any subtask deep in the bowels of your system to parents and their parents all the way up the outermost task, for example the web request that spawned the entire computation.

Virtual threads and structured concurrency together go like, like...
Yes, thank you!
Virtual threads deliver an abundance of threads and structured concurrency ensures that they are correctly and robustly coordinated.
Thanks to that, observability tools will see threads organized in the logical manner intended by the developer.
And all of that in Java 19, even if just as a preview!

<pullquote>Peanut butter and Jelly?</pullquote>

[jep-428]: https://openjdk.java.net/jeps/428


## Vector API

Look, I know I promised you an introduction to the vector API but today's not a good day for that.
I'm running out of time and I really want to get back to those Gin Tonics that I mentioned and...
Oh.
Well, I guess that covers that.
Ok, let's make it quick and do [something deeper][odl-vector] in the future.

```java
// assume a, b, c have same length
void compute(float[] a, float[] b, float[] c) {
	for (int i = 0; i < a.length; i++) {
		c[i] = a[i] + b[i];
	}
}
```

In arithmetic-heavy areas like image processing or machine learning it's common to have loops that execute the same computation on all elements of one or more arrays.
As a simple example, say you have two arrays `a` and `b` of equal length and want to pairwise add their elements.
Then the CPU might execute instructions that boil down to

* load element from `a` into a register
* load element from `b` into a register
* add the registers
* write result to `c`

Or it might

* load 16 elements from `a` into a multi-word register
* load 16 elements from `b` into another multi-word register
* add the registers
* write those 16 results to `c`

Both instruction sets take about the same time but the second version, which uses the CPUs vector extension, computes 16 results instead of 1 - that's a 16-fold speedup!
Which one of these instructions it's gonna be depends on whether the just-in-time compiler's auto-vectorizer can figure out what to do with your loop and while it's great when it does that, it can't do it reliably.

The vector API, on the other hand, lets you write computations that reliably translate to optimal machine instructions.
It requires a bit more code and a different approach, though.
First you create a so-called vector species, which among other things has a length that's the actual multi-word register length, which is different in different CPUs, divided by the length of the data type you want to use, `double` or `float` for example.
The 16 earlier was just an example, it could just as well be 4, 64, or something else.

Then you write a loop that takes steps of that length, so that in each iteration

* you load that many elements from the input arrays into vectors
* do the computation `BigInteger`-style by calling methods on them
* then write the resulting vector to the result array

At run time, the just-in-time compiler will create machine code specifically for the CPU that executes this, thus guaranteeing optimal performance on all platforms.
Neat, huh?

```java
static final VectorSpecies<Float> VS =
	FloatVector.SPECIES_PREFERRED;

// assume a, b, c have same length,
// which is a multiple of the vector length
void compute(float[] a, float[] b, float[] c) {
	int upperBound = VS.loopBound(a.length);
	for (i = 0; i < upperBound; i += VS.length()) {
		var va = FloatVector.fromArray(VS, a, i);
		var vb = FloatVector.fromArray(VS, b, i);
		var vc = va.add(vb);
		vc.intoArray(c, i);
	}
}
```

While JDK 19 [further improves the vector API][jep-426], it doesn't take the big step to bring it out of incubation.
It's waiting for Project Valhalla's improvements because they will change the API and it would be sad to finalize it now and then in a few years be stuck with a version that could be better but can't be changed anymore.

Speaking of Valhalla, can you imagine how amazing it would be if it also previewed something in 19?
In fact, the release that contains those changes is the only one I can imagine to be more groundbreaking than JDK 19.
What do you think, would it be better than this one with all that Loom, Amber, and Panama goodness?
Let me know in the comments!

[odl-vector]: https://www.youtube.com/watch?v=1JeoNr6-pZw
[jep-426]: https://openjdk.java.net/jeps/426


## Outro

And that's it from Crete!
I hope you're looking forward to JDK 19 just as much as I do.
Don't forget to like and share with your friends and enemies.
I'll see you again in two weeks - so long...

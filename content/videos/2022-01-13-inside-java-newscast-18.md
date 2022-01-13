---
title: "Java's Plans for 2022 - Inside Java Newscast #18"
tags: [project-amber, project-loom, project-panama, project-valhalla]
date: 2022-01-13
slug: inside-java-newscast-18
videoSlug: inside-java-newscast-18
description: "An update on Java's four key projects: Valhalla, Panama, Loom, and Amber - what they're about, where they are right now, and what their plans are for 2022 and beyond."
featuredImage: inside-java-newscast-18
---

## Intro

Happy new year, everyone, and welcome to the first Inside Java Newscast in 2022.
I'm Nicolai Parlog, Java developer advocate at Oracle and today we're gonna take a look at Java's four hot projects:
Valhalla, Panama, Loom, and Amber - what they're about, where they are right now, and what their plans are for 2022 and beyond.
I'll close with some some comments on the timeline.

Ready?
Then let's dive right in!


## Project Valhalla

[Project Valhalla][valhalla] has two goals: an obvious one and a subtle one.
The obvious one is to introduce a new kind of type that "codes like a class, works like an `int`" - as the mission statement goes.
The subtle one is to heal the rift in Java's type system that separates reference types from primitives, part of which is to allow generification over all types.
Yes, you'll be able to create an `ArrayList<int>` that's backed by an `int[]` - no boxing needed.

Valhalla launched in 2014 right after Java 8 was released and has spent much of that time in an exploratory phase where the people behind the project, led by Brian Goetz, experimented with various proof-of-concept implementations.
Over the last year these efforts have crystalized into a set of concrete proposals.

### Current State

The current plan is to introduce two new kinds of types:

1. Value classes, which disavow identity and thus are shallowly immutable (meaning all fields are final), but can still be `null` and have the same safety guarantees as regular classes.

	```java
	// has no identity
	// has references (can be null)
	value class Circle implements Shape {

		// implicitly final
		private double radius;

		// [... constructor ...]

		@Override
		public double area() {
			return Math.PI * radius * radius;
		}

	}
	```

2. Primitive classes, which take it one step further and beyond identity also give up references.
That means they can't be `null`, so they need a reasonable default value, and they can tear under concurrent assignments just like `double` and `long` can on some JVMs.

	```java
	// has no identity
	// no references (no null, but tearing)
	primitive class Circle implements Shape {

		// implicitly final
		private double radius;

		// [... constructor ...]

		@Override
		public double area() {
			return Math.PI * radius * radius;
		}

	}
	```

Value classes give the JVM more options to improve performance because it doesn't have to track their identity and primitive classes even more so, to the point that they perform just like today's primitives.
Generics will be made universal, meaning they'll allow all of these types as parameters (that's `ArrayList<int>`), and they'll allow specialization, meaning that they'll rely on primitive classes instead of their boxes (that brings us the backing `int[]`).

For more on all of this, there are the excellent [State of Valhalla][state-valhalla] documents, which got a huge update three weeks ago - link down below.

### Future

The plan is to roll out Valhalla in three phases:

1. are value objects, for which [a JEP draft exists][jep-values]
2. are primitive classes, JEPs [401] and [402], as well as universal generics, which also has [a draft JEP][jep-universal]
3. will be specialized generics

Finally some phases that aren't repetitive money grabs.

[valhalla]: https://openjdk.java.net/projects/valhalla/
[state-valhalla]: https://openjdk.java.net/projects/valhalla/
[jep-values]: https://openjdk.java.net/jeps/8277163
[401]: https://openjdk.java.net/jeps/401
[402]: https://openjdk.java.net/jeps/402
[jep-universal]: https://openjdk.java.net/jeps/8261529


## Project Panama

Much like the Panama Canal connects the Pacific and the Atlantic Oceans, Project Panama wants to connect the Java Virtual Machine with, "foreign" (meaning non-Java) libraries, or rather improve and enrich that connection.
The project is currently led by Maurizio Cimadamore and also started in 2014 - hm, after Java 8, people must've been bored - and after a few years of exploration arrived at the following goals for interacting with foreign code:

1. provide an alternative to the `ByteBuffer` API with similar performance and safety characteristics, but without some of the downsides
2. make native libraries more accessible by replacing JNI with a more Java-oriented workflow
3. provide basic building blocks that enable other frameworks to define higher-level native interop

Mostly unrelated to that is the exploration of better interaction with CPU vector instructions.

### Current State

On the vector front, things are far along.
The vector API started incubating in JDK 16 and is still [doing that in 18][jep-417].
It allows you to write Java code that the just-in-time compiler can reliably compile down to vector instructions optimal for the executing CPU.

```java
// vector API demonstration; computing c = -(a*a + b*b)
void vectorComputation(float[] a, float[] b, float[] c) {
    for (int i = 0; i < a.length; i += SPECIES.length()) {
        var m = SPECIES.indexInRange(i, a.length);
        var va = FloatVector.fromArray(SPECIES, a, i, m);
        var vb = FloatVector.fromArray(SPECIES, b, i, m);
        var vc = va.mul(va).add(vb.mul(vb)).neg();
        vc.intoArray(c, i, m);
    }
}
```

The interaction with native code is also making good progress.
[JEP 419], which is part of JDK 18, is the second incubation of two APIs and the command line tool `jextract`.
Together they achieve the three goals I quoted earlier and there are a number of projects out there, from Netty and Lucene to OpenGL and OpenSSL, that were already tested on it.

```java
// foreign memory API demonstration
try (ResourceScope scope = ResourceScope
		.newConfinedScope()) {
    MemorySegment s1 = MemorySegment
		.map(path, 0, 100000, READ_WRITE, scope);
    MemorySegment s2 = MemorySegment
		.allocateNative(100, scope);

	// use the segments here

} // segments released here
```

### Future

In 2022, the foreign memory and access APIs will start their transition from incubating APIs in the temporary module _jdk.incubator.foreign_ to preview APIs in the _java.base_ module.
There are also still a few improvements to be made under the hood.
The tool `jextract` may be spun out into its own project with its own repository, delivery mechanism, and cadence, so it's easier to contribute to and can be improved and released more rapidly.

The vector API is special in the regard that it would look a bit different if value and primitive types were already available.
And because these differences can't be introduced without incompatible changes, the vector API will stay incubating until the necessary Valhalla features are implemented.

[jep-417]: https://openjdk.java.net/jeps/417
[JEP 419]: https://openjdk.java.net/jeps/419


## Project Loom

Project Loom is working on improving Java's concurrency model in a two-pronged approach:

* introduce threads that are lightweight (meaning you should be able to have millions of them) and user-mode (meaning managed by the JVM, not the operating system)
* introduce new concurrency programming models that make use of them

The goal is to get the performance of heavily asynchronous code bases with simple, synchronous code - borrowing from Valhalla, you could say "codes like sync, works like async".

Loom is led by Ron Pressler who launched the effort in 2018.
From the get-go, he had a pretty good idea where things were going and much of that time was spent verifying the idea and refactoring some APIs to remove roadblocks.
Examples of that are [JEP 353], which reimplemented the legacy socket API in JDK 15, and [JEP 418], which added a host-name resolution SPI to JDK 18.

### Current State

In recent months, two fundamental JEPs were drafted up.
[One][jep-virtual] that introduces virtual threads, the lightweight, user-mode threads that Loom envisioned.
And [another one][jep-structured] for a first structured concurrency API.
I discussed the concept in the recent Newscast.
The proposed API realizes it by offering a closable `StructuredExecutor` that lets you spawn a virtual thread for each concurrent task and various completion handlers that let you choose common behaviors like shutting down running tasks as soon as one of them succeeded or failed.
The idea is to create the executor and handler, launch all tasks, wait for their completion and handle errors and/or process results before shutting the executor down - implicitly if used in a try-with-resources block.
And all of that in just a couple of lines of code.

```java
String doTwoThingsConcurrently()
		throws IOException, InterruptedException {
    try (var executor = StructuredExecutor.open()) {
        var handler =
			new StructuredExecutor.ShutdownOnFailure();
        Future<String> one = executor
			.fork(() -> doOneThing(), handler);
        Future<String> two = executor
			.fork(() -> doAnotherThing(), handler);

        executor.join();
        handler.throwIfFailed();

        return one.resultNow() + two.resultNow();
    } catch (ExecutionException ex) {
        if (ex.getCause() instanceof IOException ioe)
			throw ioe;
        throw new RuntimeException(ex);
   }
}
```

The Loom early-access build already contains these proposals and I created a GitHub repo with a few small examples that I'll link in the description.
Give it a go, it's really cool!

### Future

The next steps are to gather more feedback on the two JEPs before finalizing them and eventually merging these features as previews into the JDK main development line.
Refinements of them during the preview phase aside, there's still more work for Loom.
For one, with millions of threads, classic thread views, heap dumps, and the like become nearly unreadable and there's a lot that needs to be done there to make highly concurrent apps easier to debug.
Then there's lots more to explore on the structured concurrency front - this concept is far from fully figured out and there'll surely be more experiments with new APIs and API building blocks.

[JEP 353]: https://openjdk.java.net/jeps/353
[JEP 418]: https://openjdk.java.net/jeps/418
[jep-virtual]: https://openjdk.java.net/jeps/8277131
[jep-structured]: https://openjdk.java.net/jeps/8277129


## Project Amber

Project Amber explores smaller, productivity-oriented Java language features.
Some of them are part of a larger story but many are independent of one another.

Amber, also led by Brian Goetz, probably to have some fun in between laboring on Valhalla, launched in 2017 and due to its focus on smaller features, already delivered a number of them:

* local-variable tape inference, or `var` for short, in Java 10
* text blocks in 15
* records in 16
* and parts of a larger pattern matching story with
	* switch improvements like arrow syntax and use as expressions in Java 14
	* type patterns in 16
	* and sealed classes in 17

But it's not done yet!

### Current State

Pattern matching builds on three pillars:

* the improvements of `switch`, in this context most importantly checking exhaustiveness

	```java
	int value = switch(myBoolEnum) {
		case FALSE -> 0;
		case TRUE -> 1;
	};
	```

* the introduction of patterns themselves, at the moment only type patterns

	```java
	double area;
	if (shape instanceof Rectangle r)
		area = r.height() * r.width();
	```

* the concept of sealed classes, which enables exhaustiveness checks when switching over types

	```java
	sealed interface Shape
		permits Circle, Rectangle {

	}
	```

The beam that rests on and connects these three pillars is the inclusion of patterns in switches.
In JDK 17, this feature has seen its first preview and there will be a second one in JDK 18, see [JEP 420].

```java
double area = switch (shape) {
	case Rectangle r ->
		r.height() * r.width();
	case Circle c ->
		Math.PI * square(c.radius());
}
```

Unlike Valhalla, Amber doesn't officially have phases, but I see this as the end of pattern matching phase 1 - getting the basics to work.
Next comes phase 2.

### Future

With all pattern matching basics potentially/probably finalized in JDK 19, we can expect more features and patterns that build on this, for example:

* refining patterns with additional conditions and `null`-checks - this is actually also in [JEP 420]
* deconstruction patterns for records and arrays (see [JEP 405]) and maybe, after the introduction of explicit deconstructors, also for regular classes
* maybe custom patterns, for example to implement one that combines a `Map`'s `containsKey` and `get` methods, so that if the pattern applies to a map, meaning if it contains that key, the associated value is assigned to the pattern variable

	```java
	Map<String, Integer> numbers = // ...;
	// totally made-up syntax for the
	// hypothetical contains/get pattern
	if (numbers contains "one" number)
		// use `Integer number` here...
	```

But Amber is more than pattern matching.
A super interesting idea that is currently being explored are template strings but with a cool twist - I'll link [the draft JEP][jep-templates] in the description.
Check it out.

[JEP 420]: https://openjdk.java.net/jeps/420
[JEP 405]: https://openjdk.java.net/jeps/405
[jep-templates]: https://openjdk.java.net/jeps/8273943


## Timeline

Now, I know you, throughout this video, you've be wondering:
"When do we get all that good stuff?"
"Will it be in JDK 19?"
"Do we have to wait another year? Two? Five?"
The official and, if we're honest, only sensible answer to when each feature gets released is "when it's done".
When we prod a bit more, we hear that all four projects are either on the home stretch (like Panama and Amber's pattern matching basics) or about to enter it (like Valhalla and Loom), which means they'll all come to fruition in the next years.
But that's neither satisfying nor fun, so...

If you promise not to tell anybody, I'll leave my personal guesses in a comment down below.
I'll be curious to learn what you think about them and to read your estimates.
Now don't you dare share this video or I'll get in trouble.
This is just between us.

If you have any other questions, leave them in the comments as well.
Don't forget to do all the YouTube things.
I'll see you again in two weeks.
So long...

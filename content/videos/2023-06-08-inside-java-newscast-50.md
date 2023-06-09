---
title: "All That is in Java 21?! 😱 - Inside Java Newscast #50"
tags: [java-21]
date: 2023-06-08
slug: inside-java-newscast-50
videoSlug: inside-java-newscast-50
description: "JDK 21 is almost too good to be true: It finalizes virtual threads, sequenced collections, generational ZGC, and the pattern matching basics; and evolves and introduces over half a dozen other features."
featuredImage: inside-java-newscast-50
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog and I'm out of my mind about JDK 21.
Virtual threads, sequenced collections, generational low-pause garbage collection, and the complete pattern matching basics - and that's just the finalized features!
Structured concurrency, vector API, foreign function and memory API - they all progress towards finalization.
Or is it new previews that you're thirsting for?
There are unnamed classes and instance main, string templates, unnamed patterns and variables, and another big GC improvement!

WHAT'S HAPPENING?!
Indeed!

Today, the JDK main development line gets forked and JDK 21 enters ramp-down phase 1, which means there will be no new features.
So this is a great time to take a whirlwind tour of all that's coming.
For deeper dives, I'll point out the other videos we made on these topics.
Ready?

No, not yet!

Nicolai from editing here and as if Java 21 isn't overflowing with features already, a few more got added in recent days.
I don't cover them in this episode but I will in upcoming ones.
I want to at least mention them here for completeness' sake, though.

In the final category, we have the [key encapsulation API](https://openjdk.org/jeps/452) and progressing from incubation to preview are [scoped values](https://openjdk.org/jeps/446) - [JEP Café #16](https://www.youtube.com/watch?v=fjvGzBFmyhM) covered them.
Then we need a section for deprecations.
Preparations are undertaken to, in the future, turn [the default for dynamic loading of agents from allowed to disallowed](https://openjdk.org/jeps/451) and [the Windows 32bit x86 port is deprecated for removal](https://openjdk.org/jeps/449).
Links to the respective JEPs and everything else mentioned in this episode are, as always, in the description.

Now we're ready!

Then let's dive right in!


## Production-Ready

### Virtual Threads

Let's start with the big one:
After two rounds of preview with barely any changes, [virtual threads are final](https://openjdk.org/jeps/444) in JDK 21.
Now the web frameworks are off to the races as they need to let you easily configure using virtual threads instead of platform threads when handling requests.

Doing that has the potential to let your app handle way more concurrent connections than before.
But keep in mind that virtual threads are no performance pixie dust, so keep expectations realistic.
Then again, if you don't see the results you're hoping for, there may be some easy code changes that you can do that get you there.
Check [Inside Java Newscast #23](inside-java-newscast-23) for more on that and some virtual threads dos and don'ts.

<contentvideo slug="inside-java-newscast-23"></contentvideo>

### Sequenced Collections

Many collections in Java have a stable iteration order (all lists and some sets, for example) but don't necessarily allow indexed access to them (which all lists do, but sets usually don't).
JDK 21 steps up its collections game and [introduces a set of new interfaces](https://openjdk.org/jeps/431) that capture this concept and offer related functionality.

At its core is `SequencedCollection`, which extends `Collection` and is ultimately implemented by all lists, some sets, and a few other data structures.
It offers methods `add...`/`get...`/`remove...` `...First` and `...Last`, which do what you'd expect.

```java
// getting first and last elements from a list
// (sequenced by order of addition)
var letters = List.of("c", "b", "a");
"c".equals(letters.getFirst());
"a".equals(letters.getLast());

// same but from a sorted set
// (sequenced by natural ordering)
var letterSet = new TreeSet<>(letters);
"a".equals(letters.getFirst());
"c".equals(letters.getLast());
```

It also has a method `reversed` that returns a `SequencedCollection` that is a view on the underlying collection but in reverse order, which makes it super easy to iterate or stream over.

```java
var letters = new ArrayList<>(List.of("a", "b", "c"));
var reversedLetters = letters.reversed();

letters.addLast("d");
reversedLetters.forEach(System.out::print);
// ~> dcba

reversedLetters.addFirst("e");
letters.forEach(System.out::print);
// ~> abcde
```

If you want to learn more about that, the companion interfaces `SequencedSet` and `SequencedMap`, and a few odds and ends, check out [Inside Java Newscast #45](inside-java-newscast-45).

<!-- TODO: embed https://inside.java/2023/04/25/podcast-031/ -->
<contentvideo slug="inside-java-newscast-45"></contentvideo>

### Generational Low-Pause Garbage Collection

Garbage collection is also taking big steps forward.
ZGC has a strong focus on ultra-low pause times, which can lead to a higher memory footprint or higher CPU usage than other GCs.
Starting with JDK 21, both of these metrics will be improved on many workloads when [ZGC becomes _generational_](https://openjdk.org/jeps/439), meaning it will maintain separate generations for young objects, which tend to die young, and old objects, which tend to be around for some time.

Preliminary benchmarks show very promising results!
In a probably not representative case, Cassandra 4 showed

* four times the throughput on GenZGC compared to ZGC with a fixed heap or
* a quarter of the heap size on GenZGC compared to ZGC with stable throughput

If you want to give generational ZGC a try on your work load, download a JDK 21 early access build and launch it with `-XX:+UseZGC -XX:+ZGenerational`.
For more details, check [JEP 439](https://openjdk.org/jeps/439) or [Inside Java Podcast #24](https://inside.java/2022/06/29/podcast-024/) with Erik Österlund.

<!-- TODO: embed Billy's Newscast -->

### Pattern Matching

To effectively use pattern matching, you need three things:

* a capable `switch` that allows the application of patterns
* the ability to enforce limited inheritance so the `switch` can check exhaustiveness
* and an easy way to aggregate and deconstruct data

```java
var shape = loadShape();
var area = switch(shape) {
	case Circle(var r) -> r * r * Math.PI;
	case Square(var l) -> l * l;
	// no default needed
}

sealed interface Shape permits Circle, Square { }
record Circle(double radius) { }
record Square(double length) { }
```

There are other features that come in really handy (and they are being worked on and one even previews in 21 - more on that later), but these are the basics and JDK 21 finalizes the last two pieces: [pattern matching for switch](https://openjdk.org/jeps/441) and [record patterns](https://openjdk.org/jeps/440).
Now that we've got everything together, you can use this powerful idiom in your projects - be it in the small or in the large if you use a functional or data-oriented approach.
To see how these features play together to achieve that, check out [Inside Java Newscast #29](inside-java-newscast-29).

<contentvideo slug="inside-java-newscast-29"></contentvideo>


## Continued Evolution

Done with that, now it's time to transition.
For me from one holiday location to the next (btw I'm taking guesses where I am in the comments) and for this video from finalized features to previews, incubations, and experiments.
And just a reminder, to use [a preview feature](enable-preview-language-features), you need to add the command-line flag `--enable-preview` to `javac` and `java` and you also need to specify the Java version for `javac`, preferably with `--release 21`.

### Structured Concurrency

Once you get abundant virtual threads and start creating one for every little concurrent task you have, an interesting opportunity arises:
You can treat threads that you created for a set of tasks as executing a single unit of work and you can see them as children of the thread that created them.
An API that capitalizes on that would streamline error handling and cancellation, improve reliability, and enhance observability.
And it would make it easy and helpful to start and end that single unit of work in the same scope, defining a unique entry and exit point for handling concurrent code.
It would do for concurrency what structured programming did for control flow: add much-needed structure.

Lucky us, this API exists!
It's called the structured concurrency API.
If you haven't seen this coming a mile away, for one you're not reading the title cards, but you must also have skipped quite a few of our videos.
May I suggest subscribing to the channel and liking this video, so this doesn't happen again in the future?

```java
// create task scope with desired
// error handling strategy
// (custom strategies are possible)
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {

	// fork subtasks
	Subtask<String> user = scope.fork(() -> findUser());
	Subtask<Integer> order = scope.fork(() -> fetchOrder());

	scope
		// wait for both subtasks
		.join()
		// propagate potential errors
		.throwIfFailed();

	// both subtasks have succeeded
	// ~> compose their results
	// (these calls are non-blocking)
	return new Response(user.get(), order.get());
} // task scope gets shut down
```

The structured concurrency API was incubating in JDK 20 and [is upgraded to a preview in JDK 21](https://openjdk.org/jeps/453).
Beyond moving to a proper package, namely `java.util.concurrent`, the only change has been that `StructuredTaskScope`'s method `fork` now returns the new type `Subtask`.
In 20 it returned a `Future` but that offered degrees of freedom (like calling the blocking `get` method) that are counterproductive in structured concurrency and was overall too evocative of asynchronous programming, which is exactly what structured concurrency isn't.

Jose had a great JEP Cafe on all this, check out [episode #13](https://www.youtube.com/watch?v=2nOj8MKHvmw).

<!-- TODO: embed https://www.youtube.com/watch?v=2nOj8MKHvmw -->

### Vector API

the vector API is in its [sixth incubation](https://openjdk.org/jeps/448), still waiting for Valhalla, nothing new to see here, please move on.
Unless you want to see vectors in action, then check [JEP Cafe #18](https://www.youtube.com/watch?v=42My8Yfzwbg).

<!-- TODO: embed https://www.youtube.com/watch?v=42My8Yfzwbg -->

### Foreign Function & Memory API

By efficiently invoking code outside the JVM (_foreign functions_) and by safely accessing memory not managed by the JVM (_foreign memory_), the foreign function and memory API enables Java programs to call native libraries and process native data without the brittleness and danger of the Java Native Interface (_JNI_).
One of the main drivers of the FFM API is to provide safe and timely deallocation, in a programming language whose main staple is _automatic_ deallocation (thanks GC).
Finding the right primitive to express this capability in a way that is harmonious with the rest of the Java programming model triggered a round of API changes in JDK 20 and again in JDK 21, which is why the API will take [another round of previewing](https://openjdk.org/jeps/442).

```java
// 1. find foreign function on the C library path
Linker linker = Linker.nativeLinker();
SymbolLookup stdlib = linker.defaultLookup();
MethodHandle radixsort = linker.downcallHandle(stdlib.find("radixsort"), ...);

// 2. allocate on-heap memory to store four strings
String[] words = { "mouse", "cat", "dog", "car" };

// 3. use try-with-resources to manage the lifetime of off-heap memory
try (Arena offHeap = Arena.ofConfined()) {
	// 4. allocate a region of off-heap memory to store four pointers
	MemorySegment pointers = offHeap
		.allocateArray(ValueLayout.ADDRESS, words.length);
	// 5. copy the strings from on-heap to off-heap
	for (int i = 0; i < words.length; i++) {
		MemorySegment cString = offHeap.allocateUtf8String(words[i]);
		pointers.setAtIndex(ValueLayout.ADDRESS, i, cString);
	}

	// 6. sort the off-heap data by calling the foreign function
	radixsort.invoke(pointers, words.length, MemorySegment.NULL, '\0');

	// 7. copy the (reordered) strings from off-heap to on-heap
	for (int i = 0; i < words.length; i++) {
		MemorySegment cString = pointers.getAtIndex(ValueLayout.ADDRESS, i);
		words[i] = cString.getUtf8String(0);
	}

// 8. all off-heap memory is deallocated at the end of the try-with-resources block
}
```

On that note, the quality of feedback during the preview phase from projects adopting the API has been excellent and very important for its evolution.
If you want to help move Java forward, the easiest way to do that is to experiment with preview features and report back to the respective mailing lists.

Another addition in 21 has been the so-called fallback linker, which offers a way for platforms to be Java Standard Edition compliant without too much work by using _libffi_ instead of fully implementing the linker API.


## Brand New Previews

So how are we doing on time?
Ugh, terrible, as expected!
But there are three brand-new preview features that we. Just. Can't. Skip.
And I love how diverse they are!
They span from improving a Java workhorse to refining a programming paradigm to changing how beginners learn the language.

### Unnamed Classes And Instance Main

We've just talked about this [in the last episode](inside-java-newscast-49) and that video has been doing really great (thank you for that, by the way, I really appreciate it) so in the interest of time, I'm going to assume most of you watched it and keep this part short.

JDK 21 allows for [much simpler entry points into a Java program](https://openjdk.org/jeps/445).
The main method no longer needs to be public nor static nor does it need the `args` array.
And the whole surrounding class becomes optional, too, making `void main` the smallest possible Java program.

```java
// content of file `Hello.java`
void main() {
	System.out.println("Hello, World!");
}
```

Let me briefly clarify two points that I didn't explain very well two weeks ago, though:

1. This is a preview feature, so if you use it in a single source-file program, where it clearly shines, you need to add `--enable-preview --source 21` to the `java` command.
	```
	java --enable-preview --source 21 Hello.java
	```

2. There are plans to shorten `System.out.println` to just `println` and also offer a more succinct way to read from the terminal, but neither of that is part of JDK 21.

<contentvideo slug="inside-java-newscast-49"></contentvideo>

### Unnamed Variables and Patterns

Unused variables are annoying but bearable.
Unused patterns during deconstruction, on the other hand, are really cumbersome and clutter code - they make you want to deconstruct less.

```java
String pageName = switch (page) {
	case ErrorPage(var url, var ex)
		-> "💥 ERROR: " + url.getHost();
	case ExternalPage(var url, var content)
		-> "💤 EXTERNAL: " + url.getHost();
	case GitHubIssuePage(var url, var content, var links, int issueNumber)
		-> "🐈 ISSUE #" + issueNumber;
	case GitHubPrPage(var url, var content, var links, int prNumber)
		-> "🐙 PR #" + prNumber;
};
```

So it's really good that JDK 21 turns [the underscore into a special variable and pattern](https://openjdk.org/jeps/443) that says "I won't be used and you can have as many of me as you want in the same scope".

```java
String pageName = switch (page) {
	case ErrorPage(var url, _)
		-> "💥 ERROR: " + url.getHost();
	case ExternalPage(var url, _)
		-> "💤 EXTERNAL: " + url.getHost();
	case GitHubIssuePage(_, _, _, int issueNumber)
		-> "🐈 ISSUE #" + issueNumber;
	case GitHubPrPage(_, _, _, int prNumber)
		-> "🐙 PR #" + prNumber;
};
```

That makes code more clearly readable and reduces IDE and compiler warnings.
Best of all, though, it makes switching over sealed types more maintainable by allowing you to easily combine default-y handling of different types into a single branch while avoiding an outright `default` branch.

```java
String pageEmoji = switch (page) {
	case GitHubIssuePage _ -> "🐈";
	case GitHubPrPage _ -> "🐙";
	// explicitly list remaining types to avoid default
	// branch (only possible with unnamed patterns)
	case ErrorPage _, ExternalPage _ -> "n.a.";
};
```

If you want to better understand why that's important and how exactly unnamed variables and patterns work, watch [Inside Java Newscast #46](inside-java-newscast-46).

<contentvideo slug="inside-java-newscast-46"></contentvideo>

### String Templates

Embedding variables or simple expressions in strings has a bad name.
For one, it's a bit cumbersome and not perfectly readable.
But more importantly, if the embedded content comes from the user, there's the risk of injection attacks.
And generally, unless we're creating text for humans to read, there's probably syntax and escaping to consider.

```java
// a cumbersome and dangerous example
String property = "last_name";
String value = "Doe";

String query = "SELECT * FROM Person p WHERE p."
	+ property + " = '" + value + "'";
```

[String Templates](https://openjdk.org/jeps/430) solve all that in one go.
Not only do they make it easy to embed expressions in string literals or text blocks by encasing them in an opening backslash, curly brace and a closing curly brace, they also enforce processing of such string templates by domain-specific string processors.
Such processors receive the string portions and the variables separately and returns instances of any type.
The obvious processor just concatenates and returns a `String` but there are other possibilities out there.
An SQL processor could validate and parse a statement's syntax and return a `java.sql.Statement` and a JSON processor could return a `JsonNode`.

```java
// a safe and readable example
String property = "last_name";
String value = "Doe";

Statement query = SQL."""
	SELECT * FROM Person p
	WHERE p.\{property} = '\{value}'
	""";
```

If you want to dig deeper, check out [Inside Java Newscast #47](https://www.youtube.com/watch?v=BzkCAz0Rc_w).

<!-- TODO: embed https://www.youtube.com/watch?v=BzkCAz0Rc_w -->

## Outro

And that's it for today on the Inside Java Newscast.
Another long one but I hope it was worth your time and that you're as excited about JDK 21 as I am.
If so, you can do me a solid and like this video.
But if you think it was too long or JDK 21 isn't that exciting after all, feel free to hit that dislike button twice.
I'll see you again in two weeks.
So long ...

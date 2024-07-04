---
title: "All Java 23 Features - Inside Java Newscast #70"
tags: [java-23]
date: 2024-06-06
slug: inside-java-newscast-70
videoSlug: inside-java-newscast-70
description: "Java 23 will be released on September 17th but it's branched today (June 6th 2024) and so its feature set is final. Generational ZGC, Markdown in JavaDoc, deprecations in `Unsafe`, the removal of string template, and the thoughtful evolution of eight preview features. Let's take a closer look!"
featuredImage: inside-java-newscast-70
---

It's release branch day!
Later today, the JDK repo will get the new branch jdk23, which is simultaneously business as usual and a small novelty - I'll explain later what I mean by that.
Either way, the JDK 23 features are set in stone, so let's take a look.

<!-- logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna go over all the changes JDK 23 brings to Java.
Truth be told, the list of final features is a bit slim, so let's start with the meatier preview features.
Ready?
Then let's dive right in!


## Previews

### Primitive Patterns

There are two ways to summarize [JEP 455](https://openjdk.org/jeps/455).
The short one is:
It allows primitives in patterns, which means you can now switch over or `instanceof`-check a primitive `float`, `double`, etc. and get more options when switching over `int` and `long`.
While that may seem borderline pointless at first, it has a few unexpected benefits in the present and in the future.


```java
// in `switch`
switch (Rank.of(book).current()) {
	case 1 -> firstPlace(book);
	case 2 -> secondPlace(book);
	case 3 -> thirdPlace(book);
	case int n when n <= 10
		-> topTenPlace(book, n);
	case int n when n <= 100
		-> nthPlace(book, n);
	case int n -> unranked(book);
}

// in `instanceof`
jshell> boolean is216float = 16_777_216 instanceof float
is216float ==> true
jshell> boolean is217float = 16_777_217 instanceof float
is217float ==> false
```

The longer summary is quite a bit longer because it goes far afield to explain why this is pretty cool actually.
Go check out [Inside Java Newscast #66](https://www.youtube.com/watch?v=_afECXGjfDI) for all of that or just straight-up read the JEP.

By the way, there are links in the description to more details on every feature I mention, so go check them out if you want to dig deeper into any of them.

Primitives in patterns have their first preview in JDK 23 and if there's only one feature you want to put to the test, make it this one, and take your learnings to [the Amber mailing list](https://mail.openjdk.org/pipermail/amber-dev/).

<contentvideo slug="inside-java-newscast-66"></contentvideo>

### Flexible Constructor Bodies

To make sure that object initialization works correctly across class inheritance and multiple constructors, a constructor calling another one must do that as its first statement.
Or at least it had to.

JDK 22 started previewing looser rules by allowing statements that would compile in a static block before such a `this()` or `super()` call.
Now, JDK 23 goes a step further and also allows assignments to fields in the same class.
In [this second preview](https://openjdk.org/jeps/482), the feature has also been renamed to _flexible constructor bodies_.

```java
class Name {

	private final String first;
	private final String last;

	Name(String first, String last) {
		this.first = first;
		this.last = last;
	}

}

class ThreePartName extends Name {

	private final String middle;

	// JDK ≤21
	ThreePartName(String first, String middle, String last) {
		// shorten first if middle is given
		super(middle.length() == 1 ? first.substring(0, 1) : first, last);
		this.middle = middle;
	}

	// JDK 22 + PREVIEW FEATURES
	ThreePartName(String first, String middle, String last) {
		// shorten first if middle is given
		var short1st = middle.length() == 1 ? first.substring(0, 1) : first;
		super(short1st, last);
		this.middle = middle;
	}

	// JDK 23 + PREVIEW FEATURES
	ThreePartName(String first, String middle, String last) {
		// shorten first if middle is given
		var short1st = middle.length() == 1 ? first.substring(0, 1) : first;
		this.middle = middle;
		super(short1st, last);
	}

}
```

<contentvideo slug="inside-java-newscast-62"></contentvideo>

### Simplified Main

The simplified launch protocol sees [its third preview with two additions](https://openjdk.org/jeps/477).
As before, it allows you to write a Java source file that only contains a `void main()` method - no `args`, no `static`, no `public`, not even a surrounding class, although you can add all of that if it's needed.
If you don't type out a class, one is implicitly declared for you and this is where the two additions come in.

First, an implicitly declared class implicitly imports the three methods on the new class `IO` in the `java.io` package.
Those methods are `print`, `println`, simple wrappers around the same methods on `System.out`, and `readln`, which takes a string that it prints as a prompt and returns whatever line the user typed as a reply, which is _so much_ simpler than the "`new BufferedReader` of `new InputStreamReader` of `System.in`"-dance.
This will make it much easier for beginners to interact with the terminal, a classic early step when learning to program.

```java
// complete source file; executable with:
//     java --enable-preview Main.java
void main() {
	var planet = readln("What planet are you on? ");
	println("Hello, %s!".formatted(planet));
}
```

The other addition is also an import, because implicitly declared classes now implicitly import the module _java.base_.

<contentvideo slug="inside-java-newscast-49"></contentvideo>

### Module Imports

Yes, as discussed in [the last Inside Java Newscast](https://www.youtube.com/watch?v=WHknBEhzB0k), [JDK 23 previews module imports](https://openjdk.org/jeps/476).
When importing a module with `import module $modulename`, all public types in all packages that are exported to you via that module are available to you.
This is particularly handy when coding outside of an IDE or when just starting out with Java.
And with implicitly declared classes implicitly importing _java.base_, many simple programs will get away with zero explicit imports.

```java
// complete source file; executable with:
//     java --enable-preview Main.java

// implicit: `import module java.base;`
import module java.xml;

void main() {
	// XML types are imported via java.xml
	var xml = DatatypeFactory.newDefaultInstance();
	// `List`, `BigDecimal`, `LocalDate`, etc. are imported via java.base
	List<?> dates = Stream
		.of(1, 2, 23, 29)
		.map(BigDecimal::new)
		.map(day -> LocalDate.of(
			2024,
			RandomGenerator.getDefault().nextInt(11) + 1,
			day.intValue()))
		.map(date -> xml.newXMLGregorianCalender(...))
		.toList();

	System.out.println(dates);
}
```

<contentvideo slug="inside-java-newscast-69"></contentvideo>

### Structured Concurrency and Scoped Values

[The structured concurrency API](https://openjdk.org/jeps/480) lets you use virtual threads to write concurrent code that is easier to understand, maintain, and debug.
And [the scoped values API](https://openjdk.org/jeps/481) provides a more maintainable and scalable alternative to thread locals but is limited to values that won't change during a thread's life time.
In JDK 23, both APIs are previewing for the third time - the only change is:

> The type of the operation parameter of the `ScopedValue.callWhere` method is a now new functional interface which allows the Java compiler to infer whether a checked exception might be thrown.
> With this change, the `ScopeValue.getWhere` method is no longer needed and is removed.

```java
private final static ScopedValue<Long> REQUEST_ID = ScopedValue.newInstance();

void main() throws Exception {
	var userOrder = ScopedValue.callWhere(REQUEST_ID, 42L, () -> fetchUserOrder("", ""));
	println(userOrder);
}

UserOrder fetchUserOrder(String userId, String orderId) throws InterruptedException {
	try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
		Subtask<User> user = scope.fork(() -> fetchUser(userId));
		Subtask<Order> order = scope.fork(() -> fetchOrder(orderId));

		scope.join().throwIfFailed();
		return new UserOrder(user.get(), order.get());
	} catch (ExecutionException ex) {
		var message = "Request %d failed".formatted(REQUEST_ID.get());
		throw new RuntimeException(message, ex.getCause());
	}
}
```

In fact, this is the only change since their first preview in JDK 21, so if you're on that version, you can still test the APIs in almost their current form.
If you do and have any feedback, please send it to [the Loom mailing list](https://mail.openjdk.org/pipermail/loom-dev/).

<contentvideo slug="jep-cafe-16"></contentvideo>

### Class-File API

Updating Java often requires updating many or even all of your dependencies and a big contributor to that undesired requirement is bytecode manipulation, a connection I explained in more detail in [Inside Java Newscast #56](https://www.youtube.com/watch?v=bQ2Rwpyj_Ks).
To minimize that effect, the JDK is currently previewing its own bytecode analysis and manipulation API: the class-file API.
In [its second preview](https://openjdk.org/jeps/466), the `CodeBuilder` class was streamlined and the `ClassSignature` class was improved to more accurately model the generic signatures of superclasses and superinterfaces.

<contentvideo slug="inside-java-newscast-56"></contentvideo>

### Stream Gatherers

The stream API has a bunch of terminal operations like `findAny`, `count`, `reduce`, and since JDK 16, `toList`.
One terminal operation isn't quite like the others, though, and that's `collect`.
That's a generalized terminal operation that feeds stream elements into the provided collector, which we can code up freely to do pretty much whatever we want.
This gives us the freedom to use all the collection strategies we need without the stream API having to support them all individually.

Now take all that and apply it to intermediate operations and you get `Stream.gather` and gatherers.
This is a generalized intermediate operation that feeds stream elements into the provided gatherer, which can store them, apply some function to them, or pass anything on to the next stage of the stream pipeline.
This gives us the freedom to implement all intermediate operations we ever wished, once again without the stream API having to support them all individually.

This API first previewed in JDK 22 and [will do so again unchanged in JDK 23](https://openjdk.org/jeps/473).

<contentvideo slug="inside-java-newscast-57"></contentvideo>

### Vector API

Big news for the vector API!
No, it's not moving forward but in its eighth incubation [the JEP](https://openjdk.org/jeps/469) now officially says why not.
Quote:

> The Vector API will incubate until necessary features of Project Valhalla become available as preview features.
> At that time, we will adapt the Vector API and its implementation to use them, and will promote the Vector API from incubation to preview.

There you have it, now we only need to wait for Valhalla to ship those features.
Should be any day now.
Brian.


## The Novelty

That was quite a list but we're not done with JDK 23 yet:
We still have the final features and some removals to cover.

But before we get to that I want to explain what the novelty of the JDK 23 branch is.
And it's the thing itself: the branch.
In the past, JDK releases each got a new fork - this decision was made way back when OpenJDK used Mercurial, which didn't support branches very well at the time.
Nowadays OpenJDK uses Git, where branching is trivial, so the prerelease code of 23 and later versions will no longer get their own forks but merely branches.

Now let's get to the final features.


## Final Features

### ZGC Becomes Generational By Default

Let's start with ZGC, a garbage collector that prioritizes low pause times.
It's been production-ready since JDK 15 but learned a new trick in JDK 21.
Since then it has a generational mode that leans on the generational hypothesis and improves performance for most use cases, sometimes considerably.
Companies like Netflix and Mercado Libre adopted it and are extremely happy with the results.
If you want to learn more about all that, I recommend [ZGC contributor Stefan Johansson's talk at Devoxx UK](https://www.youtube.com/watch?v=jz_ZahwS5N0).

What's [new in JDK 23](https://openjdk.org/jeps/474) is that the generational mode is now the default.
To avoid misunderstandings:
G1 is the default garbage collector if you don't pick a different one.
If you _do_ pick ZGC with the flag `-XX:+UseZGC`, it will now be generational by default.
You can opt out of the generational mode with `-XX:-ZGenerational` but not that much longer.
While non-generational ZGC isn't deprecated yet, that's just a matter of time.

If you've never used ZGC, this is a good time to consider it.
It works great for latency-sensitive applications like web backends and ideally you have a performance benchmark for your app that you can run with its current GC configuration versus with ZGC and compare the results.
If they look promising, dig a bit deeper and maybe adopt.

<contentvideo slug="gc-stefan-johansson-devoxx-uk"></contentvideo>

### Markdown in Comments

If you've ever turned on subtitles on my videos, you might've noticed that they're written in Markdown.
There are two reasons for this:

* One is that I'm lazy.
  I write the script in Markdown because I'll later publish it on my blog and then I don't have to add all that inline markup later.
* The other is that I think Markdown has become a kind of lingua franca among developers because it's supported in some form or other by almost every system we use to communicate by text: issues, pull requests, chat systems, Q&A sites, forums, and the list goes on and on.
  This has gone so far that I actually think that for most devs even _reading_ source Markdown is easier than reading unmarked text because the markup helps with identifying code, emphasis, and structure.

So Markdown makes it easier for me to express and easier for you to understand what I want to communicate, even compared as-is to flat text!
Now compare it to HTML and the gap just grows wider.

So I think it's _really_ cool that JavaDoc now supports Markdown.
If you start your block comment with three slashes and keep putting those before every new line, JavaDoc will interpret the whole text as Markdown, specifically CommonMark, and output the appropriate HTML.
This will obviously help with writing documentation but also with reading it.
I don't know about you but I usually read JavaDoc straight from the IDE, sometimes on GitHub, but not that often rendered on a website.

There's way more to say about all this - check out [JEP 467](https://openjdk.org/jeps/467) or [Inside Java Newscast #68](https://www.youtube.com/watch?v=AvAIFq4fLPw) for all the details.

<contentvideo slug="inside-java-newscast-68"></contentvideo>


## Deprecations

Last but not least we have two topics about things going away.
In fact they're so "not least" that I will probably make a Newscast about each of them in the upcoming months - you know what to do if you don't want to miss that.

### String Templates

The first thing going away is string templates.
The short explanation is that after gathering practical experience with the feature and reevaluating how certain design goals can be achieved, the OpenJDK community felt that, as-is, string templates aren't pulling their weight.
And because further evaluations and a potential redesign will take a little while, the preview [was pulled entirely from JDK 23](https://bugs.openjdk.org/browse/JDK-8329948).
That means, once you update your experimental and hobby code bases, you'll have to rip out everything related to string templating:

* all strings with `\{` in them
* all mentions of `STR` and `FMT`
* all references to the type `StringTemplate` and its inner class `Processor`

I'm very much _not_ looking forward to that!
The long explanation - well that's gonna be in the future Newscast.

### Unsafe Memory Access

The other things going away are the memory-access methods on `Unsafe` but not yet in JDK 23.
[It only marks those methods as deprecated for removal.](https://openjdk.org/jeps/471)
The plan is for JDK 25 to additionally issue warnings at run time when they're invoked and for future releases to first throw exceptions and eventually remove the methods.
You can (and probably should!) simulate most of that on JDK 23 with the new command line flag `--sun-misc-unsafe-memory-access`, which you can set to `warn` or even `deny` to observe whether your app behaves as expected.

Removing these methods is part of a long-term plan to ensure the Java Platform has integrity by default.
I touched on that topic when discussing JDK 21 because it was the reason why 21 started issuing a warning when an agent is dynamically attached.
There's [a timestamped link to that Newscast in the description](https://www.youtube.com/watch?v=MT3_2VyP_YY&t=290s) or you can wait for the upcoming one that explores integrity by default as a whole: from dynamic agents to `Unsafe`, from modules to JNI and FFM.


## Outro

And that was it for JDK 23.
Later today, early access build number 26 will be released, so why don't you download it and take it for a spin?
Keep in mind that for some of these features, you don't need to compile to JDK 23.
You can compile to 21 and just run on 23 to see how generational ZGC behaves or whether you'll be impacted by the deprecations in `Unsafe`, for example.

The link to JDK 23 EA builds is in the description, right below the like and subscribe buttons and if you want to do me a favor, you can hit one or both of them while scrolling past.
I'll see you again in two weeks.
So long...

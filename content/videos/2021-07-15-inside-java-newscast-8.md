---
title: "Incremental Evolution, Pattern Switches vs Visitor Pattern, and Wayland Support - Inside Java Newscast #8"
tags: [java-17, project-panama, modules, pattern-matching, sealed, patterns]
date: 2021-07-15
slug: inside-java-newscast-8
videoSlug: inside-java-newscast-8
description: "How the six-month release cadence enabled a more incremental evolution of the Java platform and how pattern switches and sealed classes are an alternative to the visitor pattern. Also, maybe Wayland support for Java."
featuredImage: inside-java-newscast-8
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle and today, I got three topics for you:

1. incremental evolution of the platform - how the six-month release cadence makes introducing new features or transitioning out of old ones much smoother
2. pattern switches and sealed classes - how you can combine these two features to maintainably add operations to types without modifying them (and get rid of the visitor pattern)
3. native Wayland support

Ready?
Then let's dive right in!


## Incremental Evolution

When Java had a big release every two to three years, its evolution was necessarily pretty abrupt.
Take lambdas, streams, and optional - they all benefit from one another and showed up in the same release, Java 8.
That makes it easier for the developer to see their benefits, but it also means that they all need to fit together from day one.
Little chance for the JDK team to gather practical outside feedback, little chance to evolve features according to their use.
That changed in 2017 with the switch to the six-month release cadence.

### Project Panama

Take Panama as an example.
[Project Panama](https://openjdk.java.net/projects/panama/) is improving and enriching the connections between the Java Virtual Machine and non-Java APIs, meaning native code.
In short, it wants to replace JNI and it already made a lot of headway.

In JDK 14, it [started incubating the foreign-memory access API](https://openjdk.java.net/jeps/370) that saw some [major changes](https://openjdk.java.net/jeps/383) and [improvements](https://openjdk.java.net/jeps/393) since then.
The other big portion, foreign function support, [started incubating in JDK 16](https://openjdk.java.net/jeps/389).
In the upcoming JDK 17, [both APIs are incubating together](https://openjdk.java.net/jeps/412) and there's a decent chance that they'll be finalized next year.
A very helpful tool that the project created, `jextract`, is not even part of the JDK yet - that may come later.

Panama greatly benefited from being able to pre-release its APIs early, so it was easier to experiment with and give feedback on.
This only makes sense if the next version is only a few months out, which was possible due to the frequent releases.

(By the way, if you're interested in the current state of Project Panama, check out [my recent conversation with its lead Maurizio Cimadamore](https://www.youtube.com/watch?v=B8k9QGvPxC0).)

### Strong Encapsulation

The frequent releases not only help with additions, though, they also help with the occasional deprecation or removal.
Albeit not fitting those terms exactly, strong encapsulation is a good example for something going away over the course of multiple releases.

JDK  9 [introduced the mechanism](https://openjdk.java.net/jeps/260) that would finally lock away the JDK's internal APIs that we've been using for about two decades.
But to ease migration, it wasn't on by default.
Instead, it introduced the temporary command line flag `--illegal-access` that manages run-time access to internal APIs.
On JDK 9, the default value was `warn`, which effectively suspended strong encapsulation at run time, but let developers know that things are about to change.

Which is what happened in JDK 16.
[Now `deny` is the default value](https://openjdk.java.net/jeps/396), so you get exceptions when accessing internal APIs.
You can work around that by adding the `--illegal-access` flag to your launch scripts, but don't get used to that.
In 17, [all values will behave like `deny`](https://openjdk.java.net/jeps/403), so there's no longer a blanket kill switch for strong encapsulation.

I know, strong encapsulation can be a touchy topic.
(To get a deeper insight, I recommend the recent [Inside Java Podcast with Alan Bateman](https://www.youtube.com/watch?v=dRX_stwoOgo) on this very topic.)
What I want to highlight here is how a frequently released platform can make changes like these less abrupt and easier to adapt to.
And by staying on the most recent release, or at least compiling or testing against it, you can make sure that you can see the impact such changes have on your code base as early as possible.
Bonus points for building against early access builds - you can get started with JDK 18 (yes, 18!) today.

### Pattern Matching

Ok, enough boring clean up - lets do something fun.
Pattern matching!

Pattern matching started with [type patterns for `instanceof`](https://openjdk.java.net/jeps/305), first previewed in JDK 14.
Since then it has been [refined](https://openjdk.java.net/jeps/375) and [finalized](https://openjdk.java.net/jeps/394) in 16.

```java
Shape shape = // ...
if (shape instanceof Circle c)
	// ...
if (shape instanceof Rectangle r)
	// ...
else
	// ...
```

In 17 (as a preview), [patterns make the jump to `switch`](https://openjdk.java.net/jeps/406).

```java
Shape shape = // ...
switch (shape) {
	case Circle c -> // ...
	case Rectangle r -> // ...
	default -> // ...
}
```

Because starting in 12, `switch` evolved ([1](https://openjdk.java.net/jeps/325), [2](https://openjdk.java.net/jeps/354), [3](https://openjdk.java.net/jeps/361)) from the good old statement we all know to become more than that.
It has a form without fall-through, it can be an expression, and it can check whether the branches cover all possible cases - this is called exhaustiveness or completeness.
These are important preparations for accommodating patterns.
Completeness is particularly helpful because it lets you elide the `default` branch, which not only removes effectively dead code if all cases are covered explicitly, it also allows you to provoke a compile error if a new case is needed.
From what I've talked about so far, that would only work well with enums, though.

```java
// BEFORE
enum Color { RED, GREEN }

Color color = // ...
switch (color) {
	case RED -> // ...
	case GREEN -> // ...
	// switch is complete
	// ⇝ needs no default
}


// AFTER
enum Color { RED, GREEN, BLUE }

Color color = // ...
switch (color) {
	case RED -> // ...
	case GREEN -> // ...
	// switch is incomplete
	// ⇝ compile error!
}
```

But there's a third path leading here and that are sealed classes.
[First previewed in 15](https://openjdk.java.net/jeps/360), [refined in 16](https://openjdk.java.net/jeps/397), and [finalized in 17](https://openjdk.java.net/jeps/409), they allow us to express a closed inheritance hierarchy.
This allows the compiler to extend completeness checks beyond enums to type hierarchies, but more on that in a minute.

Because I'm not done with pattern matching yet and neither is [Project Amber](https://openjdk.java.net/projects/amber/).
Over the coming releases, we can expect to see more than just type patterns.
[Deconstruction patterns for arrays and records](https://openjdk.java.net/jeps/405) are next in the pipeline, both candidates for a preview in JDK 18.
I also assume that we'll eventually see APIs that are best interacted with via pattern matching.
More on all that in another recent Inside Java Podcast episode - [this one with Gavin Bierman](https://www.youtube.com/watch?v=pnXlCvYspYk) on pattern matching.

These changes are very diverse, they expand existing language constructs and introduce new ones.
Arguably, this is more to explore and learn than lambda expressions or the module system because it's less monolithic.
Being able to create and adopt this one by one instead in one big chunk in a single release makes this a bit easier.


## Pattern Switches with Sealed Classes

Let's have a bit of a closer look at pattern switches and sealed classes.
They come from Java Enhancement Proposals [406](ttps://openjdk.java.net/jeps/406) and [409](ttps://openjdk.java.net/jeps/409) - as usual links to this and everything else I mention in the description.
If you scroll down to check it out, I'd appreciate it if you leave a like so more Java devs get to see this video.

### Pattern Switch

Let's imagine a `Shape` interface that has two implementations - `Circle` and `Rectangle`.
Now we want to compute a shape's area.
You may think about adding a new method `area` to `Shape`.
But no!
I'll come back to this later, I promise.

Instead we'll create that operation as a method somewhere that gets a `Shape` and switches over its type to determine how to compute the area.
So it's `double area = switch(shape)` with `case Circle c` call `computeCircleArea(c)` and `case Rectangle r` call `computeRectangleArea(r)`.
Unfortunately, this is not enough.
The pattern switch needs to be complete and so we have to add either a `case Shape` or a `default` branch.
This works, but it has a serious problem.

```java
interface Shape { /*...*/ }

class Circle
	implements Shape { /*...*/ }

class Rectangle
	implements Shape { /*...*/ }


void somewhere(Shape shape) {
	double area = switch (shape) {
		case Circle c ->
			computeCircleArea(c);
		case Rectangle r ->
			computeRectangleArea(r);
		default -> 0;
	};
}
```

### Sealed Classes

When we add new shapes, say `Triangle`, we need to find and update all switches to include it if we don't want it to be handled by the default branch.
That's why these run-time checks for types have a bad name - they are basically impossible to maintain.

```java
// new
class Triangle
	implements Shape { /*...*/ }


void somewhere(Shape shape) {
	double area = switch (shape) {
		case Circle c ->
			computeCircleArea(c);
		case Rectangle r ->
			computeRectangleArea(r);
		// triangles have area 0 :(
		default -> 0;
	};
}
```

And that's why your first idea was probably a method `area` on `Shape`, which is _and remains_ the default choice.
In cases where that's not possible, maybe you don't want to overload the types with too many disconnected features, the visitor pattern is usually the next choice.
I'm not gonna explain it here, but suffice it to say that in its common form, the visitor pattern will give you a compile error when you add a new shape - which is good because it means you need to update all operations to handle the new shape properly.

```java
interface Shape {
	void accept(Visitor visitor);
}

class Triangle
	implements Shape {

	@Override
	public void accept(Visitor v) {
		// compile error here
		// ~> add method to Visitor
		v.visit(this);
	}
}

interface Visitor {
	void visit(Circle circle);
	void visit(Rectangle rectangle);
	// add this one
	// ~> compile error in visitors
	// ~> implement methods there
	void visit(Triangle triangle);
}
```

But thanks to sealed classes that's also possible for pattern switches.
By writing `sealed interface Shape permits Circle, Rectangle` we restrict `Shape`'s inheritance hierarchy to the known subtypes `Circle` and `Rectangle`.
Then we can go back to our `switch` in `area`.
It covers the cases `Circle` and `Rectangle` and the compiler knows that only these two types can directly implement `Shape`.
So even without the default branch, the switch is complete and indeed that means we can remove the default.

```java
sealed interface Shape
	permits Circle, Rectangle { /*...*/ }

final class Circle
	implements Shape { /*...*/ }

final class Rectangle
	implements Shape { /*...*/ }


void somewhere(Shape shape) {
	double area = switch (shape) {
		case Circle c ->
			computeCircleArea(c);
		case Rectangle r ->
			computeRectangleArea(r);
		// no default needed!
	};
}
```

This is big!
Now, when we add a new type, such switches are no longer complete and don't compile.

```java
sealed interface Shape
	permits Circle, Rectangle, Triangle { /*...*/ }

// Circle, Rectangle as before

final class Triangle
		implements Shape { /*...*/ }


void somewhere(Shape shape) {
	double area = switch (shape) {
		case Circle c ->
			computeCircleArea(c);
		case Rectangle r ->
			computeRectangleArea(r);
		// compile error because
		// switch isn't complete
	};
}
```

### vs Visitor Pattern

That means with regards to maintainability, a pattern switch over sealed classes works just as well as the visitor pattern.
I could go on to compare the two solutions and come to the conclusion that I think this modern approach makes the visitor pattern obsolete, but I've already written [a blog post](java-visitor-pattern-pointless) that does exactly that and lead to some energetic conversations about what the pattern really is about and what use cases remain.
Relitigating all of that here would take way too long, but if you're interested, I'll leave links to the blog post, [the twitter conversation](https://twitter.com/nipafx/status/1413103823996993536), and [the Reddit thread](https://www.reddit.com/r/java/comments/og6d72/visitor_pattern_considered_pointless_use_pattern/) below.

All I want you to take away from this is that pattern switches and sealed classes offer an alternative to the visitor pattern that may be worth exploring.


## Wayland Display Server Support

Wayland is a display server for Linux, the thing your desktop environment uses to draw on the screen, and is on its way to replace the venerable X Window System.
Last week, Philip Race, developer at the Java Platform Group at Oracle, sent [a mail](https://mail.openjdk.java.net/pipermail/discuss/2021-July/005846.html) to the OpenJDK "discuss" mailing list where he wrote:

> [W]e expect quite shortly to propose an OpenJDK project that will consider the goals of
> - a short to medium term solution for JDK running on Wayland in X11 compatibility mode
> - a medium to long term solution for JDK running as a native Wayland client.

The feedback has been very positive, so I'm sure we'll hear more about this in the future.

That's it.
That's all I can say at the moment.
Thought, I'd add it to the Newscast, since, after all, this is the year of Java on Linux on the desktop.


## Outro

And that's it for today on the Inside Java Newscast.
If you have any questions about what I covered in this episode, ask ahead in the comments below and if you enjoy this kind of content, help us spread the word with a like or by sharing this video with your friends and colleagues.
I'll see you again in two weeks.
So long...

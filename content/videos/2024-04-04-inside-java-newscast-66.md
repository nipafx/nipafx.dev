---
title: "Java 23: Restoring the Balance with Primitive Patterns - Inside Java Newscast #66"
tags: [java-23, pattern-matching]
date: 2024-04-04
slug: inside-java-newscast-66
videoSlug: inside-java-newscast-66
description: "The ongoing introduction of pattern matching to Java has unbalanced the language. Here's how primitive patterns (in Java 23) and other patterns (in future versions) will fix that."
featuredImage: inside-java-newscast-66
---

## Intro

Welcome everyone, to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about primitive patterns in Java 23.
Primarily, but we'll also put them in context of the patterns we already got and the ones we will probably get in the future.
Because the partial introduction of patterns into Java has unbalanced it and we'll see how future additions will once again bring balance to the force, sorry, the language.

Ready?
Then let's dive right in!


## Incremental Patterns

The introduction of pattern matching to Java is a great example of incremental development.
This is a big feature with wide-ranging implications for how we write code but we see it appear piece by piece.

### Type Patterns

First we got type patterns, which allow us to take a variable and check whether it's of a specific reference type and, if it is, create a new variable of that type with the given name.

```java
if (shape instanceof Point p)
	processY(p.y());
```

Check, declaration, and assignment or extraction - that's the triad of pattern matching.
We got type patterns in `instanceof` and, a few releases later, also in `switch`.

```java
switch (shape) {
	case Point p -> processY(p.y());
	// more cases
}
```

### Guarded Patterns

The introduction of patterns to `switch` also brought guarded patterns, which specialize a pattern in a `case` with additional boolean checks.
That allows us to express those conditions on the left side of the arrow, which is great because than all selection criteria can go there while the right side is exclusively concerned with processing the selected variables.

```java
switch (shape) {
	// selection with guarded pattern (left of ->)
	case Point p when p.x() == 0 -> processY(p.y());
	case Point p -> process(p.x(), p.y());
	// more cases
}
```

### Record Patterns

Pushing expressive and succinct selection further, are record patterns.
Since a record's state is transparent, Java doesn't only know how to put a record together and can thus generate a constructor, it also knows how to take it apart and record patterns allow just that.

```java
record Point(int x, int y) { }

switch (shape) {
	// deconstruction with record patterns
	case Point(int x, int y) -> process(x, y);
	// more cases
}
```

### Unnamed Patterns

But always listing all record components becomes cumbersome really quickly because you often only need a few of them.

```java
switch (shape) {
	// `x` is declared but unused 😔
	case Point(int x, int y) -> processY(y);
	// more cases
}
```

Unnamed patterns to the rescue!
Simply replace the patterns for the record components you don't need with an underscore and you not only ease writing and reading of the code, you also express unequivocally that you don't care about those variables.

```java
switch (shape) {
	// only used variables are declared 🙌🏾
	case Point(_, int y) -> processY(y);
	// more cases
}
```

### Nested Patterns

When you're putting an unnamed pattern into a record pattern, or a type or record pattern into another record pattern for that matter, you're nesting them.
And while that's very natural to do, it's not like the compiler just started allowing that.
No, this feature is called nested patterns and was introduced together with record patterns because so far they're the only ones where nesting makes sense.

### Summary

So, to summarize:

1. We can match against reference types.
2. We can deconstruct records in a way that mirrors their construction.
3. We can nest patterns within one another where that makes sense.
4. We can ignore parts of a pattern with unnamed patterns.
5. We can do all that in `instanceof` and in `switch`.
6. And in switches we can further refine the selection with guarded patterns.

That's all pretty good and you might have heard me describe that (plus sealed types) as the pattern matching basics.
But it's only really that: the basics.
There are more features to be built on this, but, importantly, this also needs to be built out because what we have so far puts more weight on some parts of the language but not others.
So let's turn to what these imbalances are and how Java 23 and beyond are going to address them.


## Primitive Patterns

### `instanceof`

Historically, `instanceof` only worked with reference types.
Because there's no abstraction over primitives, that makes sense.
No variable is "potentially a `byte`" - either it is declared as one, then it _is_ one, or it's of some other type and then it cannot be a `byte`.

```java
// in Java <23, this doesn't compile
// in Java <16, it doesn't even make sense
if (x instanceof byte) {
	// ...
}
```

With the introduction of pattern matching, `instanceof` changed its semantics, though.
It's no longer just "is this variable of that type" - now it means "does this variable match this pattern", meaning does it fulfill a certain condition and asking this question can make sense for primitives.
So when the old `instanceof` would've asked "is this variable a `byte`?", the answer would always have been "no" (unless it's declared as a `byte` of course), but now `instanceof` could ask "can this variable be represented as a `byte`?" and the answer to that is "yes" for all variables that represent an integer between -128 and +127.
This is called a primitive pattern and Java 23 will allow exactly that.

```java
long x = // ...
if (x instanceof byte b)
	System.out.println(b + " in [-128, 127]");
else
	System.out.println(x + " not in [-128, 127]");
```

The check goes beyond ranges, though.
Here's a special number: 16_777_217.
It's special because it's the smallest `int` that cannot be represented as a `float`.
Specifically, creating it as a `float` will result in 16_777_216.

So you could ask, is 16_777_216 an instance of float?
Yes.
But is 16_777_217 an instance of float?
No.
It's within the bounds of `float` but it cannot be represented.
And primitive patterns check this as well!

```java
jshell> boolean is216float = 16_777_216 instanceof float
is216float ==> true
jshell> boolean is217float = 16_777_217 instanceof float
is217float ==> false
```

This is _much_ better than than what we have now, where we'd have to cast and silently loose information.

### `switch`

This fixes the imbalance of reference and primitive types in `instanceof` that was created by the change in its semantics.
But what about `switch`?
You could argue that it was seriously lopsided even before patterns.
The list of types to switch over was somewhat eclectic: `byte`, `short`, `int`, `char`, (wait, where's `long`?), String, and all enums.
Then, recently, we added all reference types to the list but what about `long`?
And `float` and `double` while we're at it.

This change fixes that as well.
Now all primitives, including `boolean`s, can be switched over.
And since there are patterns for them, you can catch their values for additional guards on the left side of the arrow or for ease of use on the right.

```java
Point scale(Point point) {
	return switch (multiplyService.getMultiplier()) {
		case 0.0f -> Point.ZERO;
		case 1.0f -> point;
		case float f when f < 100 -> point.scale(f);
		case float f -> point.estimateScale(f);
	};
}
```

In accordance with recent developments, switching over one of the newly allowed primitive types or using a pattern in a switch over one of the old types, turns the `switch` into one that insists on exhaustiveness.
That means your switch statement over `int` doesn't have to cover all cases…

```java
int x = // ...
// switch statement over "classic" type
switch (x) {
	case 0 -> doSomething();
	case 1 -> doSomething();
	// not exhaustive ~> still compiles ☢️
}
```

…but once you turn it into an expression…

```java
int x = // ...
// switch expression over "classic" type
var result = switch (x) {
	case 0 -> doSomething();
	case 1 -> doSomething();
	// not exhaustive ~> compile error ✅
}
```

…or switch over `long`…

```java
long x = // ...
// switch statement over "new" type
switch (x) {
	case 0L -> doSomething();
	case 1L -> doSomething();
	// not exhaustive ~> compile error ✅
}
```

…or add a pattern…

```java
int x = // ...
// switch statement over "classic" type
// that uses a primitive pattern
switch (x) {
	case 0 -> doSomething();
	case int i -> doSomething();
	// not exhaustive ~> compile error ✅
}
```

…then it does.
That's annoyingly imbalanced on its own but I don't see a fix for that that doesn't break all old switches, so it looks like we have to live with it.

### Nested

There's one more place where primitive patterns improve balance and that's in nested patterns.
If you deconstruct a record, you don't have to match the component types exactly.
Quite the opposite, you can use subtypes of the component types to only select those record instances that hold an instance of that subtype.
That used to not apply to primitive components - you had to match those exactly.

```java
record ScaledShape(Shape shape, double scale) { }

switch (scaledShape) {
	case ScaledShape(Shape p, byte s) -> // …
	case ScaledShape(Shape p, long s) -> // …
	// catches all shapes / scales
	case ScaledShape(Shape p, double s) -> // …
}
```

With the semantics of primitive patterns, that'll be a thing of the past.
You can now select those record instances whose component fits, for example, into a `byte`, regardless of whether it is declared as a `byte` or any other primitive numerical type.

```java
switch (scaledShape) {
	case ScaledShape(Shape p, byte s) -> // …
	case ScaledShape(Shape p, long s) -> // …
	// catches all shapes / scales
	case ScaledShape(Shape p, double s) -> // …
}
```

As usual there's a bit more to the topic than I'm covering here, for example a table explaining which primitive conversions are unconditionally exact and which are widening and which are  narrowing.
For all that, check out [JDK Enhancement Proposal 455](https://openjdk.org/jeps/455).
It proposes to preview primitive patterns in JDK 23 and is already integrated, so you can download [a 23 early access build](https://jdk.java.net/23) right now and start playing with them.


## Upcoming patterns

So primitive patterns fix an imbalance in how patterns, primitives, `instanceof`, and `switch` work.
But this doesn't fix all such issues and it turns out that all four upcoming patterns I found in [the Amber design documents](), link below the like button, can be viewed through the lense of returning balance.

<admonition type="note">

Of course all upcoming features and their syntax are speculative.
No promises. 😉

</admonition>

### Deconstruction Patterns

For example, we've just talked about how record patterns are the inverse of a record constructor.

```java
/*   ┌─────── → */ new Point(x, y) // ────────┐
//   │         (generated constructor)        │
//   ↑                                        ↓
// values              RECORDS           instance
//   ↑                                        ↓
//   │       (generated record pattern)       │
/*   └─ */ instanceof Point(int x, int y) // ─┘
```

But where's the inverse of a regular class' constructor?
Don't get me wrong, most classes don't lend themselves to this kind of deconstruction, but _some_ do - what about them?
Deconstruction patterns are the answer.
With them, you can manually define a deconstruction contract, analogues to defining a construction contract with a constructor.
Record patterns are then just a special, automatically-generated case of deconstruction patterns.

```java
/*   ┌─────── → */ new StringJoiner(dl) // ───────┐
//   │             (custom constructor)           │
//   ↑                                            ↓
// values                CLASSES             instance
//   ↑                                            ↓
//   │          (deconstruction pattern)          │
/*   └─ */ instanceof StringJoiner(String dl) // ─┘
```

### Static Patterns

So we generalized the conceptual pair "constructor / record pattern" for records to "constructor / deconstruction pattern" for all classes.
But some classes prefer not to expose their constructor and have clients go through static factory methods instead - `Optional` is a good example with `of` and `empty`.
To mirror that in deconstruction, we may get static patterns, so you could ask, to continue the example, whether an `Optional` was created `of(String s)` and the pattern matches if the `Optional` contains a string.

```java
/*   ┌────────── */ Optional.of(s) // ──────────┐
//   │             (static factory)             │
//   ↑                                          ↓
// values                                  instance
//   ↑                                          ↓
//   │             (static pattern)             │
/*   └─ */ instanceof Optional.of(String s) // ─┘
```

### Instance patterns

Whereas static patterns ask whether a variable fulfills a general (a static if you will) condition, instance patterns go a step further and ask whether a variable fulfills a condition based on some other variable's state.
This will be big!
Everyday programming contains uncounted statements that implement "if this fulfills that, extract those variables".
For example:

* If this string matches that regex pattern, extract the groups:

```java
var pattern = Pattern.compile("(.)(..)");
var matcher = pattern.matcher("abc");
if (matcher.find()) {
	var first = matcher.group(1);
	var last = matcher.group(2);
	// ...
}
```

* If this key is contained in that map, extract the value:

```java
Map<String, Point> points = // ...
if (points.containsKey("name")) {
	var point = points.get("name");
	// ...
}
```

* etc, etc.

Instance patterns allow expressing these checks, declarations, and extractions in one concept, making them all more succinct, safer, and potentially atomic thus considerably improving Java code.

```java
var pattern = Pattern.compile("(.)(..)");
// `Pattern::match` is an instance pattern
if ("abc" instanceof pattern.match(String first, String last)) {
	// ...
}

Map<String, Point> points = // ...
// `Map::mapsTo` is an instance pattern
if ("name" instanceof points.mapsTo(Point point)) {
	// ...
}
```


### Constant Patterns

For the last pattern I've found in the documents, assume you switch over a point with x/y coordinates and one branch needs the y coordinate but should only be taken if x is zero.
Of course you could extract x and y and use a guarded pattern to check whether x is zero but this is less expressive than it could be.
Deconstruction is supposed to mirror construction and there you'd just call `new Point(0, y)`.

```java
/*   ┌─── → */ new Point(0, y) // ──────┐
//   │                                  │
//   ↑                                  ↓
// values   HOW'S THIS SIMILAR?!   instance
//   ↑                                  ↓
//   │                                  │
/*   └─ */ case Point(int x, int y) // ─┘
                            when x == 0
```

Constant pattern fix this imbalance and allow matching a value to a constant.
Somewhat pointless in and of itself, they work great when nested in other patterns.
The example I just gave would be simplified to `case Point(0, var y)`.
Neat.

```java
/*   ┌─── → */ new Point(0, y) // ──────┐
//   │                                  │
//   ↑                                  ↓
// values       MUCH BETTER!       instance
//   ↑                                  ↓
//   │                                  │
/*   └─── */ case Point(0, int y) // ───┘
//
```

## Outro

Why not[ download a 23 EA build](https://jdk.java.net/23), link in the description, and give primitive patterns a spin?
Using preview features in source file execution has become even easier in 23 because you only need `java --enable-preview` and can elide `--source $number`.
So it's a text file, a main method, and that simple command to start experimenting.
That has never been easier!

And that's it for today on the Inside Java Newscast.
I hope you had a good time, if so you can do me a favor and let YouTube know with a like.
And if you're not subscribed, why?
Do it now and I'll see you again in two weeks.
So long ...

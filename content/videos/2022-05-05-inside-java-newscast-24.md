---
title: "`when` And `null` In Pattern Matching - Inside Java Newscast #24"
tags: [project-amber, pattern-matching]
date: 2022-05-05
slug: inside-java-newscast-24
videoSlug: inside-java-newscast-24
description: "JEP 427 proposes two changes to pattern matching in switch: 1. Guarded patterns, which belonged to patterns, are replaced with when clauses, which belong to the case. 2. null needs to be handled by a specific case null."
featuredImage: inside-java-newscast-24
---

## Two-week Schedule

So four weeks ago, I said I'll see you in two but...
Wait.
What?
How long has that been out of whack?
Yeah, better, wow that must've been irritating.

Anyway, so four weeks ago, I said I'll see you in two but then conference season hit like a truck and I forgot that you actually have to travel to conferences and then you're not at home.
Speaking to people face to face.
I know it's weird, but really hope to be back on a two-week schedule now.

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today we're gonna look at the changes to pattern matching in its third preview: case refinement and `null`-handling.

I'll assume you already know how pattern matching in switch works in the current preview, so I'm not gonna go over that.
If you don't, check out [Inside Java Newscast #8][ijn#8] or my Oracle Dev Live talk [Pattern Matching in Java 17 and Beyond][odl].

With that out of the way, let's dive right in!

[ijn#8]: https://www.youtube.com/watch?v=anQq-R6AWOY&t=222s
[odl]: https://www.youtube.com/watch?v=UlFFKkq6fyU

## JEP 427

[JDK Enhancement Proposal 427][jep-427] was recently published and it proposes two changes to pattern matching in ` `:

* how case refinement works and
* how `null`-handling works

To make that clear, we're discussing nitty-gritty details here and they may very well change before this feature gets finalized.
So this is not a how-to episode, this is background info so we better understand the deliberations behind this feature.
And it's just good fun to peek behind the curtain.

But we shouldn't miss the forest for the trees.
Who has trees behind their curtain?

The big picture is that `switch` slowly gains expressiveness and becomes a more relevant programming construct in Java.
And while it's an important place to use patterns, it won't be the only one.
That means this feature includes larger considerations like squaring additions with our current understanding of `switch` and making sure that the semantics of patterns in `switch` align with their semantics elsewhere.
As I said, we're just looking at some nitty-gritty details and we'll leave some open ends.

```java
// record pattern - proposed by JEP 405
if (obj instanceof Point(int x, int y))
	// use x, y

// not proposed but might be at some point
let Point(var x, var y) = returnPoint()
// use x, y
```

[jep-427]: https://openjdk.java.net/jeps/427

### Case Refinement

Classic switch compares a variable to specific values and picks the branch that matches.
With patterns in switch, the variable is matched against types, each essentially a big bag of all values that are legal for that type, for example all integers between minus and plus about 2 billion for `Integer` and all character strings for `String`.

But we'll not always want to treat all instances of one type the same - maybe we distinguish positive and negative integers or strings that do or don't contain a specific substring.
These conditions can of course easily be expressed with an `if` but in the context of a `switch` that would mean a type pattern, an arrow, and then an `if` before finally the statements we're actually interested in.
Instead of "condition, arrow, statements" we get "condition-part-one, arrow, condition-part-two, statements".

```java
switch (object) {
	case Integer i ->
		if (i >= 0)
			// positive integers
		else
			// negative integers
	case String s ->
		if (s.contains("foo"))
			// strings with "foo"
		else
			// strings without "foo"
	default -> // ...
}
```

This is where guarded patterns come in.
Or rather, came in - JEP 427 proposes `when` clauses instead.
Both allow adding boolean conditions to a pattern to identify the desired case, say positive integers, on the left side and then put only statements after the arrow.

```java
switch (object) {
	case Integer i ____ i >= 0 -> // positive integers
	case Integer i -> // negative integers
	default -> // ...
}
```

`when` clauses as proposed by JEP 427 differ from guarded patterns in two aspects:

* which construct "owns" the refinement and
* how the refinement is expressed

As the name suggests, guarded patterns were part of the pattern syntax, which was very powerful.
For example, once nested patterns are introduced, it would've allowed us to add boolean conditions inside a large pattern, not just at the end.
Overall, this approach had some weird edge cases, though, that the JDK team wants to avoid, so now it's no longer the pattern that owns a refinement but the case.
I gotta say, I thought guarded patterns being part of the pattern syntax itself was pretty clever and am not convinced of this change.

```java
switch (shape) {
	// now-obsolete guarded patterns with
	// record patterns from JEP 405
	case Point(int x && x > 0, int y) -> // use positive x, y
	default -> // ...
}

switch (shape) {
	// refinement owned by `case` can't be "inside" the pattern
	case Point(int x, int y) ____ x > 0 -> // use positive x, y
	default -> // ...
}
```

The other aspect is the syntax of how to express a refinement.
We're used to seeing `&&` as a strongly binding operator between equitable terms.
That worked reasonably well for guarded patterns because they were actually part of the patterns but less so if `case` owns the refinement.

As Brian Goetz [wrote][brian] on the Amber mailing list:

> its harder to imagine && as part of the case, and not as part of the pattern

So the current proposal is to use the new context-specific keyword `when` between the pattern and the refining boolean conditions.

```java
switch (object) {
	case Integer i when i >= 0 ->
		// positive integers
	case Integer i ->
		// negative integers
	default -> // ...
}
```

[brian]: https://mail.openjdk.java.net/pipermail/amber-spec-experts/2022-January/003208.html

### Null values

Ah... my favorite topic to rant about: `null`!
Once again, it sullies beauty with its dark presence.
Specifically, by having us deal with it in pattern switches.

Historically, switch simply throws a `NullPointerException` when the variable is `null`.
But the more we switch over complex types, the more urgent becomes a better way to handle that case than a separate `if` before the `switch`.
Since the first preview version of pattern matching in switch and unchanged by JEP 427, it is possible to add a `case null` for this special case and even combine that with a `default`.
The question is, what happens without that case?

```java
String string = // ???
// JDK 18 and JEP 427
switch (string) {
	case null -> // ...
	case "foo" -> // ...
	case "bar" -> // ...
}
```

In the second preview in JDK 18, the answer to that depends on the presence of an _unconditional pattern_, that is a pattern that matches all possible instances of the switched variable's type.
Think of a switch over a variable of type `Shape` where the last case is `case Shape s` - that always matches, it's unconditional in type `Shape`.
Unconditional patterns even match `null`, meaning in JDK 18 the variable `s` could be null - that would probably lead to a number of `NullPointerException`s in its own right and I wasn't a fan of silently sweeping `null` in with the other shapes.

```java
Shape shape = // ...
// as previewed in JDK 18
switch (shape) {
	case Point p -> ...
	// unconditional pattern
	//  ~> matches `null`
	//  ~> `s` can be `null`
	case Shape s -> ...
}
```

Fortunately, JEP 427 proposes to change that!
Unconditional patterns still match `null` but `switch` won't let it get that far.
If there's no `case null`, it throws an NPE without even looking at the patterns.

```java
Shape shape = // ...
// as proposed by JEP 427:
// no `case null` ~> NPE
switch (shape) {
	case Point p -> ...
	// unconditional pattern
	//  (still matches `null`)
	case Shape s -> ...
}
```

Interestingly, this top-level behavior does not extend to nested patterns, though.
An unconditional nested pattern will still match `null`, which introduces a sharp edge during refactoring.
This is inconsistent, but consistently not matching `null` also has weird effects like not being able to write a single pattern that matches all instances of a record .

```java
interface Shape { }
record Circle(Point center)
	implements Shape { }

// JEP 427 + JEP 405
Shape shape = // ...
switch (shape) {
	// `Point center` is unconditional
	// the circle's center `Point`
	case Circle(Point center) ->
		// `center` may be `null`
	case Shape s ->
		// `s` won't be `null`
}
```

A solution to this kerfuffle that I'll personally be pursuing is to flat-out avoid `null`.
Actually, I'm already doing that, but that's besides the point.
Anyway, when `null` isn't legal, switches don't have to mention it and while I would've found it nice if they threw exceptions on encountering it, it isn't really their job to do that.


## Join Java!

Speaking of [jobs](https://inside.java/jobs/), are you listening to all this and thinking "I could do a better one"?
Show us and join the Java Platform Group!
Oracle is looking to fill all kinds of roles from language and tooling engineer to compiler developer, from JavaFX engineer to developer advocate - wait are they looking to replace me?
Why, what did I do wron


## Outro

And that's it for today's Inside Java Newscast.
If you have any questions about the content we covered, leave it in the comments below.
If you enjoy this content, leave it with a like or share it with your friends and colleagues.
If you don't like this content, share it with your enemies.
We'll see you again in two weeks, hopefully!
Until then, so long!

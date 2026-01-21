---
title: "Carrier Classes; Beyond Records - Inside Java Newscast #105"
tags: [project-amber]
date: 2026-01-22
slug: inside-java-newscast-105
videoSlug: inside-java-newscast-105
description: "Carrier classes are a generalization of records that allow Java developers to succinctly define classes with a data-centric API that can participate in pattern matching and reconstruction"
featuredImage: inside-java-newscast-105
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and you can consider my socks thoroughly blown.
Uhm, that probably sounds weird if you haven't watched the last episode.
Let me get you up to speed - here's what my anonymous informant ended on:

> Keep an eye on amber-spec-experts, some interesting ideas are coming down the pike about generalizing records and pattern matching to apply to classes and even interfaces.
> This will also address some of the current restrictions of records, offer a refactoring path to classes, and unblock [withers](https://openjdk.org/jeps/468).
> It will blow your socks off!

And he was right on the money.
Brian Goetz, the lead of Project Amber, which is developing these changes, sent out an email titled "Data-Oriented Programming, Beyond Records" that covered a lot of very exciting ground.
Most of it was about the addition of a new concept called carrier classes and so they're the main topic of this episode, too.
Then, towards the end, I will briefly summarize the rest of the mail as well as Gavin Bierman's on pattern assignments and constant patterns.
Ready?
Then let's dive right in!


## Carrier Classes

In "Data-Oriented Programming, Beyond Records", Brian describes the new concept of carrier classes, which you can view as a generalization of records, or maybe as a less strict variant of them.
Because we've all been in the situation where we wanted a type to be a record, but couldn't quite make it one because a requirement collided with a record limitation, most often the need for a hidden field.
Which carrier classes can have, by the way, but we'll get to that.
Let's stick to records for a moment.

### Record Review

The critical ingredient in their effectiveness is their state description through a list of components.
This list defines almost all properties of a record and we can group them into two buckets:

* one is the record's API: constructor, accessor methods, deconstruction pattern - Brian calls this the state description's _external commitment_
* the other is the record's state representation through fields - the _internal commitment_

Together with records' insistence on immutability, this complete state description through a list of components defines their core semantics: to be "transparent carriers of immutable data".
And this gives rise to all the things we love about them, from their succinctness to their deconstruction through record patterns to their ability for safe reconstruction through a symmetrical construction/deconstruction protocol (with the withers that we don't have yet).

```java
record Point(int x, int y) { }

var origin = new Point(0, 0);
// "wither" as proposed by JEP 468
var moved = origin with { x = 1; };
```

### Semantics

Now let's get back to "normal" classes.
Instead of proposing syntax that allows us to haphazardly bolt on deconstruction and somehow mark constructor/deconstructor pairs, or otherwise opt-in to all kinds of record goodies one by one, Project Amber pursued a different goal:
To find semantics that are meaningful, albeit less strict than records', and still let the language help.
Quote:

> Our path here takes one step back [from records] and one step forward: keeping the external commitment to the state description, but dropping the internal commitment that the state description is the representation -- and then adding back a simple mechanism for mapping fields representing components back to their corresponding components, where practical.

And this lead to _carrier classes_.
If records are "transparent carriers of immutable data", carrier classes are just "carriers of data":
They have a predictable, data-centric API but don't require their fields to match that and don't insist on immutability - this is the step back from records.
Like them, carrier classes are declared with a list of components as a state description and while it doesn't have to be strictly _complete_, it's still essential that it defines the _important_ state of the class.
As Brian puts it:

> If we were to extract this state and recreate the object, that should yield an "equivalent" instance.

### API Commitment

Syntax details are of course to be determined, so hold your horses on critiquing that until an actual JDK Enhancement Proposal gets filed.
For the time being, we'll stick with the strawman syntax in Brian's mail.
Here, a class becomes a carrier class by defining a list of components just after the class name.
So it looks like a record but with the keyword `class` instead of `record`.

```java
// DECLARATION (strawman syntax)
class Point(int x, int y, Optional<String> label) {

	// code missing - would not compile as is

}
```

And while carrier class semantics are weaker, they're still strict enough to force the components' external commitment:
Of course a mere carrier of data needs accessors for that data, a deconstruction pattern to take an instance apart, and a symmetrical constructor to put it back together, and so carrier classes can also be pattern matched and reconstructed.

```java
// DECLARATION (strawman syntax)
class Point(int x, int y, Optional<String> label) {

	// code missing - would not compile as is

}


// USE
var point = new Point(0, 0);
var msg = "at (" + point.x() + "/" + point.y() + ")";

var xCoord = switch (point) {
	case Point(var x, _, _) -> x;
};
// as proposed by JEP 468
var other = point with { x++; };
```

But, crucially, a carrier class' component list makes no commitment to the internal representation.
What fields with what names and types end up backing the external API, how the data flows in through a constructor and out through an accessor - all that is left to us, although as we will see in a minute, we have a shortcut to providing that.
But before we get to that, let's see what Java can do for us on the API front.

That deconstruction pattern?
We cannot express that in code and there's nothing to customize anyway and so the language provides it for us.
And since the component list describes the state, it can also infer implementations for `equals` and `hashCode`, but since the fields aren't known, they go through accessors.

```java
// DECLARATION (strawman syntax)
class Point(int x, int y, Optional<String> label) {

	// code missing (would not compile as is):
	//  * requires fields 🧑🏼‍💻
	//  * requires constructor 🧑🏻‍💻
	//  * requires accessors 🧑🏿‍💻

	// derived (like for records):
	//  * deconstruction pattern
	//  * `equals`, `hashCode`, `toString`

}
```

But the accessors and the constructor, we have to implement ourselves.
And this is where the shortcut comes in handy.

### Representation

It is expected that the difference between most carrier classes and their "ideal" representation as a record will be small - maybe you just need to return that one list as a stream or store this one derived value.
So it would be nice if, instead of having to implement fields, accessors, and constructor arguments for all the boring cases, only that difference needed to be expressed in code.
Component fields are the step forward that get us most of the way there because they allow us to succinctly express where the external API maps one-to-one to internal representation.

By declaring a component field, the mail uses the context-specific keyword `component` for that, we can signal that this field is intended to back the component of the same name and type.
Then, the language will provide the accessor and, if we define a compact constructor like for records, will pipe the respective argument into this field.
That way, the straightforward portion of the carrier class is not quite as succinct as with records but all you have to do is declare component fields for it.

```java
// (strawman syntax)

// can't be a record because we want to store the
// label in a nullable `String` field and compute
// but not expose the norm (distance from 0/0) for
// a later implementation of `compareTo`
class Point(int x, int y, Optional<String> label) {

	private final component int x;
	private final component int y;
	private final String label;
	private final double norm;

	Point {
		this.label = label.orElse(null);
		this.norm = Math.sqrt(x*x + y*y);
		// x and y get assigned automatically
	}

	// derives accessors `x()` and `y()`

	// `String label` exposed as `Optional<String>`
	Optional<String> label() {
		return Optional.ofNullable(label);
	}

	// `double norm` remains internal

}
```

That means that we can focus our attention on the rest of the representation.
Because every component that is not backed by a component field can be anything you want - go crazy, run wild.
And you can also declare additional fields, for example to precompute or cache derived values, but keep in mind that the state description needs to be complete or reconstruction would lead to nasty surprises when important state gets lost.

### Beyond Records

Note how I didn't mention `final` because neither fields nor the carrier class itself need to be.
If you're one of those filthy people who like to mutate state, you can absolutely do that.
Inheritance is also possible and not entirely trivial, by the way, but I don't have time for that here - please read Brian's mail if you're curious about that.
He also talks about carrier interfaces, which I will also punt on.

```java
interface WhatEven(String is, String going, boolean on) { }
```

Instead I want to leave this topic by going full circle and taking another look at records.
Now that you understand the semantics of carrier classes and how they function, records are really just a stricter version of that:

* Because records are fully transparent, the internal representation must match the API, so it's as if every component is backed by a component field and no additional fields are allowed.
* And because records are shallowly immutable, these component fields are all final.

```java
record Point(int x, int y) { }

// equivalent carrier class
final class Point(int x, int y) {
	private final component int x;
	private final component int y;
}
```

And there you go: beyond records to carrier classes and back to records.


## More Amber Goodies

Ok, let's go over a few more things from Brian's and then Gavin's mail.

Brian also proposes to allow records to be abstract, so that other records can extend them.
Truth be told, I'm not entirely sure what to make of that, yet, and am waiting for more details to figure out the use case.

```java
abstract record DataEntry(ZonedDateTime creation) implements Comparable<DataEntry> {

	@Override
	public int compareTo(DataEntry other) {
		return creation.compareTo(other.creation());
	}

}

record UserEntry(ZonedDateTime creation, User user) extends DataEntry { }
```

He also talked about a relaxation of deconstruction patterns to what I want to call _prefix patterns_.
Such a pattern only captures destructured variables up to the point that it's interested in and elides the rest of the list instead of filling it with underscores.

```java
record Point(int x, int y) { }

switch (shape) {
	// these two patterns would be
	// equivalent (and so couldn't
	// be used in the same switch)
	case Point(int x) -> // ...
	case Point(int x, _) -> // ...
}
```

That's kinda nice if you want to only match the first of three components but its strength lies on the other end, where components are declared.
Because it means that you can append components to a record or carrier class without breaking existing pattern matches.
And since we have no way to define our own deconstruction patterns, this is essential to allow at least some evolution of such types.

```java
// you started with...
record Point(int x, int y) { }

var shape = new Point(0, 0);
switch (shape) {
	case Point(int x, int y) -> // ...
}

// and then changed it to...
record Point(int x, int y, int z) {

	Point(int x, int y) {
		this(x, y, 0);
	}

}
// ... and the construction and
// deconstruction above still work
```

Speaking of defining deconstruction patterns, Brian's mail doesn't say that explicitly, but since carrier classes come with a deconstruction pattern and you could argue that every class that can be de- and then reconstructed is a data carrier and should thus be a carrier class or a record, the need for custom deconstruction patterns lessened.
Add in "prefix patterns" and the need shrinks further.
And so it makes sense, that there's no mention of how to declare them - it looks like we won't get syntax for that any time soon, maybe never?

Overall, "Data-Oriented Programming, Beyond Records" is not to be misunderstood as a specific proposal, though - that's what the eventual JEPs will do.
Instead, it outlines the direction Amber will take in the coming years and describes the semantic constructs it wants to establish.
So, ideally, we'll discuss semantics in the comments, not syntax.

As a last comment on that mail, I said "Brian" a lot because he sent the thing but this is of course a team effort with a lot of back and forth between a lot of smart people.
All of Project Amber and the wider OpenJDK community deserve credit for this.

The same is true for the next mail, which Gavin sent.
He presents the pattern assignments and constant patterns that I went over in the last episode.
There's nothing new for us in this mail but it did confirm that my strawman syntax is still the current design and that JEPs are being drafted, so expect those later this year.

Once they're out, we'll of course discuss them here, so make sure to subscribe.
And if you give the video a like or leave a comment, more Java developers will get to see it.
Speaking of seeing, I hope to see you again in two weeks and in March at JavaOne.
So long ...

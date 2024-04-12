---
title: "Java Withers - Inside Java Newscast #67"
tags: [records]
date: 2024-04-18
slug: inside-java-newscast-67
videoSlug: inside-java-newscast-67
description: "JEP 468 proposes a solution to the verbosity that can come from modeling mutable state with immutable records: _derived record creation_ aka _with expressions_ aka _withers_."
featuredImage: inside-java-newscast-67
---

Java withers, Java ages, Java decays - that was the conception I wanted to play off of when picking this episode's title, but... I can't pull this off.
I mean, I'm recording this video on the world's longest permanent race track and I'm here because of Java!
Specifically, [JavaLand](https://www.javaland.eu/), one of the very best Java conferences in a community flush with excellent events.
The whole "Java is dying" schtick is lame anyway, but it's outright ridiculous to perform it here, so lets see whether we can't find another topic that fits the title "Java withers".

## Intro

Welcome everyone, to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about JDK Enhancement Proposal 468: Derived Record Creation, better known as "with expressions" or just "withers" - ha, that was easy!
[JEP 468](https://openjdk.org/jeps/468) proposes an elegant solution to the verbosity that managing state with immutable records can cause in everyday programming.
It became a candidate JEP earlier this year, which means it's ready to be targeted to a specific release.
From what I can tell that may very well be JDK 23, but as Mike "String Template" Tyson once said: "Everybody has a plan until they get punched in the face", so, you know, let's not get ahead of ourselves.

Ready?
Then let's dive right in!


## When Immutability Births Verbosity

If you're on Java 17 or newer, I'm sure you've used records, probably a lot.
They work great to model immutable data carriers and their transparency makes them very convenient:
Free constructors, free accessors, free `equals` and `hashCode`, but many degrees of freedom - what's not to like?

```java
record Point(int x, int y) { }
```

Well, there is one thing actually.
Immutability is great - until you need to change something.
Clearly you can't mutate a record's state and so they don't have "set" methods, commonly referred to as "setters".

```java
var point = new Point(23, 42);
// we need a point with x = 0...

// records are immutable, so this
// won't work (fortunately!)
point.setX(0);
```

So the next best thing it so create a slightly changed copy.
You can do that on the use site and just create a new instance of the record where all values except the one you want to change come from the old record.

```java
var zeroX = new Point(0, point.y());
```

But that gets real old, really fast.
To fix that you can move that code into the record itself:
Create one method for each component that takes a new value for it and returns an appropriately copied instance.
These methods usually start with the word "with" and are hence often called "withers".

```java
// record definition
record Point(int x, int y) {

	Point withX(int x) {
		return new Point(x, this.y);
	}

}

var point = new Point(23, 42);
// call `withX` to get the copy
var zeroX = point.withX(0);
```

This is a solid approach and it works well, but it's a bit sad that while the language understands how to construct and deconstruct a record, it doesn't combine those capabilities and instead you have to manually drag data out of one and into the next instance.
It also means that we once again end up with boilerplate code that not only needs to be written (or more likely generated) but also to be read again and again to make sure neither customizations nor errors are hiding in there.

Another shortcoming of this approach is that individual withers will fail you when you have constraints that span several components.
Have a point that needs coordinates to be either all positive or all negative?
Then you can't go from one state to the other via individual `with...` calls without the constructor throwing an exception in between.

```java
record Point(int x, int y) {

	Point {
		var sameSign = x < 0 == y < 0;
		if (!sameSign)
			throw new IllArgException();
	}

	// ... `withX` and `withY`

}

var point = new Point(23, 42);
var mirroredPoint = point
	.withX(-p.x()) // 💥💥💥
	.withX(-p.y());
```

Then you either abandon withers entirely or create compound withers, which offer even more room for bugs to hide in.
So, yeah, manual withers work but they're not great.
And if Java wants us to use records everywhere they belong, it would be nice if it made those copies easier.
And that's where JEP 468 comes in.

## Derived Record Creation

JEP 468 proposes to derive new record instances from existing ones with the new `with` expression:
A `with` expression starts with the so-called _origin expression_, which must be of a record type - in most cases this will be just a reference to a record variable.
It's followed by the situational keyword `with` and ends with a _transformation block_ - a pair of curly braces that can contain almost arbitrary code.
The type of the whole expression is that of the origin expression, so you can, for example, assign it to a variable of the same type as the initial record variable.

So for a `record Point(int x, int y)` that could be `Point updated = old with { x = 0; };`:

```java
Point old = new Point(23, 42);

//       origin expression
//               |
//               | (here of type `Point`)
//               ↓
Point updated = old with { x = 0; };
//                       ↑        ↑
//                     transformation
//                         block
```

At run time, Java will evaluate the origin expression to the so-called _origin value_.
It will then take that record and create a variable for each component with the same type, name, and value (as given by the accessor), and make these _local component variables_ available in the transformation block.
It will then run the block, whose chief job it is to reassign some or even all of them.
Technically, we can execute almost arbitrary code but we should really stick to succinctly computing and assigning new values - it's ok if that takes some control structures or method calls, but we really shouldn't include any logic here that isn't strictly necessary to achieve the goal.
Once the block ran its course, the canonical constructor of the record type will be called with the local component values, thus giving you a new record instance that is like the old except for the components for which you just computed new values.
Calling the constructor also ensures that all constraints are checked - you cannot create any illegal record instances this way.

```java
// run-time pseudo-code for:
// Point updated = old with { x = 0; };

Point originValue = old;

// local component variables
int x = originValue.x();
int y = originValue.y();

// run transformation block
x = 0;

// create new instance
Point updated = new Point(x, y);
```

So for the `record Point(int x, int y)` and the statement `Point updated = old with { x = 0; };`, `updated`'s x coordinate is 0 and its y coordinate is whatever `old` had.


## Nitty Gritty

I said "almost arbitrary code" twice now.
The most important limitation is that control flow cannot be passed outside the block with a `return`, `yield`, `break`, or `continue`.
The block must either complete normally or throw an exception.

It's really cool that the block only needs to contain the minimum amount of code necessary to change the state between the two records.
All unchanged state flows through it without being mentioned and so a small transformation is small.
This minimalism mirrors that of compact record constructors, which also alleviate us of boilerplate, in this case assigning values to fields, and also focus on what's relevant, in this case the values that need to be checked, where else other data just flows through them without being mentioned.

```java
record Point5D(int x, int y, int z, int a, int b) {

	Point5D {
		if (a < b)
			throw new IllArgException();
		// x, y, z silently flow
		// from parameters to fields
	}

}

var point = new Point(23, 42, 90, 2, 5);
var zeroA = point with {
	a = 0;
	// x, y, z, b silently flow
	// from `point` to `zeroA`
};
```

I thought that was a pretty witty observation.
A shame half of you zoned out and instead of listening to me having an original thought for once were wondering what would happen if the block is empty.
In that case you just get a copy of the record with the same values.

```java
var point = new Point(23, 42, 90, 2, 5);
var copy = point with { };
```

And just to make sure you can focus on the next part were I make a connection to named parameters, let me also clarify that you can nest `with` expressions.
So for a `record Line(Point start, Point end)` you can create an instance's copy that's on the x-axis by setting `start`'s and `end`'s `y` coordinate to zero with the statement:
`Line xAxis = line with...` and now in curly braces reassign `start` and `end`. `start = start with { y = 0; }` and `end = end with { y = 0; }`.


## Named Parameters - Not!

If you squint really hard.
And look through a frosted glass of wishful thinking.
And then poke yourself in the eyes, you might think this looks like named parameters for constructors.
But it's really not, it's just a block of code that prepares variables for an eventual constructor call.

"Whatever" I can hear a few of you say, heading into the weeds.
"All I need is a readily available default instance of my record, and I can create all other instances with `thatInstance with { $assignments }`" and then the assignments look like named record parameters.

```java
record Point(int x, int y) {

	static final Point POINT = new Point(0, 0);

}

var point = POINT with { y = 42; x = 23; };
```

And you're not wrong.
You can do that and it can lead to a nice API.
I should know, I already have one that is purpose-built for this exact approach.
It models HTML.
A paragraph, for example, is a `Paragraph` record and I declare a `p` variable that has all components set to `null`.
Then I can create a paragraph with a certain id, for example, with `p with { id = "my-id"; }`.

```java
record Paragraph(/* ... */) {

	static final Paragraph p = new Paragraph(/* nulls */);

}

var my = p with { id = "my-id"; };
```

But this only works because a paragraph without any information is a legal value in the domain of HTML and the obvious default instance of a `Paragraph` record and so I can use it in that idiom.
But it is essential to stick to this order of events!
**First** the constraints, **then** the identification of an obvious default instance, **then** the cool `with` construction.
If you loosen the constraints even the tiniest bit or anoint one of several reasonable defaults as the chosen one, you hurt your code's correctness and maintainability and readability for zero material benefit.
_Please_ don't do this!

And if you're wondering whether this at least opens the door towards named parameters, I got a disappointing link in the description for you, to a mail from Brian Goetz.
But I can even do you one better.
Here's [Brian Goetz disappointing you on video](https://www.youtube.com/watch?v=mE4iTvxLTC4) in an AMA we recorded last fall.
I see you again in four weeks.
Until then, so long...

<contentvideo slug="java-ama-devoxx-be-part-1"></contentvideo>

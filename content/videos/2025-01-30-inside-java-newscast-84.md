---
title: "Java Language Evolution in 2025 - Inside Java Newscast #84"
tags: [project-amber]
date: 2025-01-30
slug: inside-java-newscast-84
videoSlug: inside-java-newscast-84
description: "In 2025, the Java language keeps evolving. Here's how Project Amber plans to push Java forward: from flexible constructor bodies to simplified main, from module imports to primitive and deconstruction patterns, from withers to string templates."
featuredImage: inside-java-newscast-84
---

Welcome everyone to the Inside Java Newscast, where we cover recent (and in this case future) developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna look at Java's plans for language evolution in 2025.
Specifically, we check in on what Project Amber will be working on this year as well as a few other explorations that I'm aware of.
As last episode about all the other project's plans for 2025:

* _working on_ does not mean _releasing_ this year - hope is pain, patience is key
* check the description for lots of follow-up links
* and check inside.java to track OpenJDK's work as it happens

Ready?
Then let's dive right in.


## Current Previews

[Project Amber](https://openjdk.org/projects/amber/)'s main focus for 2025 will be on finalizing the four features that are currently in preview.
I made dedicated videos on each, and not much changed since then, so I'll keep this part brief.
Remember, if you want to contribute to Java's development, the best way to do so is to try these preview features in your code base and give feedback on [the amber-dev mailing list](https://mail.openjdk.org/mailman/listinfo/amber-dev).

### Flexible Constructor Bodies

First up:
Flexible constructor bodies allow us to more freely arrange code in the constructor by lifting the limitation that there can be no code before a call to another constructor, regardless of whether the call is explicit or implicit or whether the constructor is in the same class or a super class.

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

	ThreePartName(String full) {
		// split "first middle last"
		// on space
		var names = full.split(" ");
		this.middle = names[1];
		super(names[0], names[2]);
	}

}
```

This started out with the intent to make the language more flexible but turned out to come in extremely handy for Project Valhalla's exploration of null-restricted types.
If a field is restricted to a non-null `User` instance, for example, then what should be its initial value?
Can't be `null` since the field should not contain that.
What other instance could it be?
But what if it actually _is_ `null`, but the language guarantees that no code ever observes that?
That would mean such fields would have to be assigned before a super constructor is called and there's the connection between flexible constructor bodies and Valhalla.

```java
class ThreePartName extends Name {

	// String! <-> "non-null String"
	private final String! middle;

	ThreePartName(String full) {
		var names = full.split(" ");
		this.middle = names[1];
		// super class can't observe
		// null `middle`
		super(names[0], names[2]);
	}

}
```

While there was no change to this feature between its preview in JDK 23 and 24, I personally wonder whether it will stay in preview until Valhalla's requirements are more well-understood.
If you can make it to California in the third week of March, come to JavaOne and hear it from the horse's mouth - JEP owner Dan Smith will give a talk on exactly this topic.

### Simplified Main

Next up are simple source files and instance main methods, which have seen quite the churn in its four previews and I think more changes are on the horizon regarding the details of the new `IO` class that makes printing to and reading from the terminal simpler.
I really wish this feature would finalize in JDK 25 because it is the next release with long-term support by Oracle and other vendors, but as I've said in the past, OpenJDK doesn't really care about that and so it very well may not.

```java
// complete source file
void main() {
	IO.println("Hello, World!");
}
```

### Module Imports

Then we have the super convenient module imports, which are quickly becoming my favorite feature when working outside an IDE.
`import module java.xml` (or whatever) imports all public types in exported packages from that module and is thus very comprehensive, super concise, and easy to read.
I'm honestly starting to wonder whether I should use them in real-life, IDE-based projects, too.
What do you think?
Are module imports "only" better than star imports or also better than importing each type on its own?
I'm not aware of any changes coming down the line for module imports.

### Primitive Patterns

And finally we have primitive patterns, meaning being able to match on primitive types, for example when deconstructing a record.

```java
record Point(long x, long y) { }

var point = new Point(/* 🤷🏽 */, 0);
var xType = switch (point) {
	case Point(byte x, _) -> "Byte: " + x;
	case Point(short x, _) -> "Short: " + x;
	case Point(int x, _) -> "Integer: " + x;
	case Point(long x, _) -> "Long: " + x;
};
```

This mostly just rebalances the language by allowing us to use primitive types more like reference types in such situations but it also has the very nice effect of allowing us to quickly check whether a number can be losslessly represented by another numeric type.
Very useful, particularly when floating point numbers are involved due to potential loss of precision.

```java
jshell> boolean is216float = 16_777_216 instanceof float
        is216float ==> true
jshell> boolean is217float = 16_777_217 instanceof float
        is217float ==> false
```

This preview also seems pretty stable, so I'm hoping it finalizes this year but Pattern Progenitor Angelos Bimpoudis can give you more insights on that at JavaOne.

So, here we have the four preview features that Amber will be pushing forward this year but since they probably won't radically change, that leaves some time for explorations into yet newer features, some of which we may well see become a JEP this year - let's take a look.


## Further Explorations

### Deconstruction

A key feature that Amber is currently working on is deconstruction.
As you know from using pattern matching, record instances can be easily deconstructed into their constituting components.
And as we'll see in a minute, this capability goes way past pattern matching, but for now let's consider broadening it - why limit it to records?

```java
record Point(long x, long y) { }

Object obj = // ...
var objString = switch (obj) {
	case Point(long x, long y) -> x + " / " + y;
	default -> obj.toString();
};
```

Clearly, there are many classes that do much more than hold data or that want to encapsulate their internals and thus shouldn't be deconstructable.
And that's all good, nobody's saying that that needs to change.
But there _are_ other classes whose instances do mostly hold data and who don't need to encapsulate all of it and those _would_ benefit from deconstruction.
Imagine a class could, optionally, define a deconstructor that splits an instance into a bunch of values, I guess those would typically reflect some or all of its fields.
Then we could use those classes in pattern matching as well as in the other features I'll get to momentarily.

```java
class PointOnX {

	private final long x;

	public Point(long x) {
		this.x = x;
	}

	// MADE-UP SYNTAX !!
	public deconstructor(long x) {
		x = this.x;
	}

}

Object obj = // ...
var objString = switch (obj) {
	case Point(long x, long y) -> x + " / " + y;
	case PointOnX(long x) -> x + " / 0";
	default -> obj.toString();
};
```

Now, "shouldn't those classes be records in the first place?" you might wonder.
And you'd actually be on the right track here.
Such classes do probably want to be records and may even have started out as one, but then a requirement popped up that just doesn't align with record limitations.
Maybe a field needs to be reassigned or some computation needs to be cached.
It makes sense that such requirements don't allow a class to be a record, but it makes much less sense that they then also can't be deconstructed.
With custom deconstructors you not only have more freedom to pick the kind of type that best fits your situation, you'll also be able to refactor from a record to a class without breaking all code using your type - similarly to how you can refactor from enum to class, by the way.

So this is something Amber is quite busy with at the moment and it will open the door to a bunch of cool follow-up features.

### Withers

One of them are withers, which I made a whole video about that I don't want to repeat here.
Cliff's notes are that a `with` expression deconstructs an instance into variables, let's you reassign their values, and then calls a constructor with them, thus giving you a new instance that is mostly the same as the old one except for the changes you made.

```java
record Point(int x, int y) { }

var point = new Point(24, 42);
// syntax proposed by JEP 468
var pointZeroY = point with {
	y = 42;
};
```

Since this builds on deconstruction and that's not yet settled for classes, it makes sense to explore these features in unison and my guess is that we won't see a withers preview before a preview for class deconstruction.

### More Patterns

We've also heard about deconstruction on assignment, meaning that instead of assigning the results of a method call or another expression to a variable and then in following statements pulling out the values we need, we may be able to deconstruct immediately and only keep around what we want.
Obviously, this also builds on deconstruction.

And then there are custom patterns, which seem unrelated to deconstruction but can also be seen as a superset of them.
When deconstruction says "without arguments and unconditionally, return this bunch of values", then a custom pattern would say "given these arguments if a condition is met, return this bunch of values".
For example "given a key, if this map contains it, return the respective key-value pair".

So both of these are kinda blocked by deconstruction and I'm pretty sure are at best tertiary considerations at this point.
But we'll be getting there sooner or later, unlikely in 2025, though... so why am I talking about them here?
I think I nerd-sniped myself.
Eh, doesn't matter - string templates!

### String Templates

The string template preview was pulled because it didn't quite hit the spot.
Again, whole video on that, short version is that the extra syntax it proposed didn't pull its weight and there are probably better ways to achieve the main goal, which is _not_ code golf but a safer way to concatenate strings.
I hope to hear more about string templates this year.


## Miscellaneous Work

Quick lightning round about three other explorations I'm aware of:

* Viktor Klang made the questionable decision to make serialization 2.0 his project, which is why we dubbed it Klang marshalling.
  To his dismay, I might add, which just motivates me further to make this a thing.
  The idea here is basically withers turned all the way to 11 where, after deconstructing a whole tree of suitable instances, instead of reassigning values, they're dumped into a data-transfer format (be it binary, JSON, or whatever) before later being reconstructed from there.
  Importantly: no magic needed; just the aforementioned deconstructors and then regular constructors.
  Viktor will be giving an update on this at JavaOne.
* Then, Per Minborg is working on so-called "stable values", an API that allows lazy initialization of values that will afterwards be treated as final by the JVM, which improves maintainability and performance.
  This JEP came out of draft last week and we'll take a closer look at it here soon but Per will also present it at JavaOne.
* And last and least specific on this list is Stuart Marks' and Kevin Bourrillion's exploration of sets and `equals`.
  The core issue is that set membership is defined on the basis of `equals` but some kinds of sets would prefer something else, for example a comparator or a custom "equals-checker" to determine membership.
  This is a tricky one because it involves the specification and a whole lot of code that relies on it but if anybody can pull this off, it's Stuart and Kevin.

That's it from me, Ana will be there in two weeks talking about quantum encryption, so I'll see you again in four.
So long...

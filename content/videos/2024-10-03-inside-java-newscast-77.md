---
title: "Big News from Project Valhalla - Inside Java Newscast #77"
tags: [project-valhalla, java-next]
date: 2024-10-03
slug: inside-java-newscast-77
videoSlug: inside-java-newscast-77
description: "At JVMLS 2024, project lead Brian Goetz presented the current state of Project Valhalla - this video summarizes the proposed changes to the programming model."
featuredImage: inside-java-newscast-77
---

Ho!
Ly!
Sh*t!
Have you watched [Brian's JVMLS talk about Project Valhalla](https://www.youtube.com/watch?v=IF9l8fYfSnI)?
It blew my mind!
How Valhalla reached "the peak of complexity" and is now seeing "the virtuous collapse"?
How surgical the changes to the programming model might be?
So cool!

I know many of you have watched it, but I also know that not many of you watched it _to the end_.
So today we're gonna distill the proposed programming model - just the part that we would interact with daily - into a short and sweet 10 minutes.
A recap for the attentive, a hell of a ride for everybody else.

<contentvideo slug="jvmls-2024-valhalla"></contentvideo>

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about the current state of the draft proposal for value types in Java.
And when I say "draft" and "proposal", I mean it.
This is not a done deal, this is not how it's definitely gonna be, and it surely isn't something that's gonna happen in the next months or so.
So we're not here to discuss how you'll program Java in 2025 - we're here to look behind the scenes of an ongoing project.
Deal?
Then let's dive right in!


## Polar Opposites

Java's reference types and primitives are different, _very_ different, and value classes are something of an in-between that would allow us to create primitive-like types with most of the comfort and expressiveness of regular classes.
Hence the slogan "codes like a class, works like an `int`".
So before we go into the current state of the draft proposal, let's list those differences and then we can work through the list to see where value classes land.
For reasons that will become clear in the next section, I'll refer to the regular classes we all know as _identity classes_.

<pullquote>

Codes like a class, works like an `int`

</pullquote>

So most obviously, identity classes can be user-defined but primitives can't.
Identity classes have members, methods, supertypes, etc. and primitives don't.
Identity classes have a flexible construction protocol whereas primitives have reasonable defaults and are usable without initialization.
Identity classes have an object header and are referenced by pointers whereas primitives are dense (meaning no headers) and flat (meaning no pointers).
References are always written atomically but primitives larger than 32 bits technically don't have to, even though they all are on modern hardware.
Identity classes are nullable, can be used as parametric types in generics and - as the name suggests - have identity, whereas none of that applies to primitives.

Ok, time to get going, and since I apparently like saying "identity" a lot, let's start there.


## Identity

Instances of classes as we know them all have _identity_, some inherent quality that identifies each instance even as it may change its value over time.
Two lists may contain the same objects but that doesn't make them the same list.
Two capital-I `Integer`s may both be 5 but can still be distinct instances.

```java
var listA = List.of("a", "b", "c");
var listB = List.of("a", "b", "c");
// false
var sameLists = listA == listB;

var fiveA = new Integer(5);
var fiveB = new Integer(5);
// false
var sameFives = fiveA == fiveB;
```

And those distinctions are important when one of the instances is mutated, locked on, or a series of other so-called _identity-sensitive_ operations is executed on it.
While maybe not under that name, most programmers are deeply familiar with that concept as it underpins the `==` comparison, because that checks for identity.

At the same time, we know that this concept doesn't apply to primitives.
Can there be two different `int`s with value 5?
No - even the question barely makes sense.

And as per the draft proposal, the classes that answer that question with "no" can be marked as _value classes_ with the modifier `value`.
So `value class Point` or even `value record Point`.
First and foremost, this is a semantic statement that types like that don't need identity, which means:

* they're immutable in the sense that their fields are all `final`
* identity-sensitive operations cause errors at compile or run time
* if they're a concrete class, they're implicitly final
* if they're an abstract class, yes abstract value classes (think of `Number`, for example), they must not depend on identity

And that's pretty much it.
As proposed, value classes can have arbitrary fields, multiple constructors, methods; they can implement interfaces and even extend abstract value classes.
"Codes like a class."
Note that they're also reference types.
We'll come to the memory layout later, but you should not think of `value` as a synonym for "flat".
Say it with me:
It's a semantic statement.
And one that will be applicable to tons of classes that don't need identity, including a lot in the JDK - we'll probably see the eight primitive wrappers, `Optional`, and many types in the date/time API become value classes.

There are more details on all this in JEP 401 and you can even try out value classes today with the most recent Valhalla early-access build, but since things can still change, I'd rather wait with a deep dive until the JEP is targeted to a release.
Instead, let's move on to nullability.


## Nullability

When I first read this on a mailing list a year or so ago, it blew my mind:
The current state of the draft proposal coming out of Project Valhalla includes nullness markers!
You know those question marks and exclamation marks (also called "bangs") you put behind a type name?
I didn't think that was possible, in fact I'm on record saying just that more than once.
But I'll never be as happy for being proven wrong as I will be over this.

So, under the current proposal, a variable of type `String?` can contain a string or `null`, whereas `String!` cannot be `null`!
A blanket `String` variable would be of unknown nullness - think of it like a raw type but for nullness.
Again, I don't want to go into details here - there are two JEP drafts, one for null-restriction of identity classes and another for null-restriction of value classes, that do just that, although they're not entirely up to date with recent developments.
Instead I want to focus on what may not seem overly consequential but turns out to be very important for us here and that are default values and initialization.

First, let's observe that since the primitive wrapper classes are already identity-less value classes as per the previous section, it's mostly just nullness that sets them apart from their primitive counterparts.
For example, `Integer` can be `null` but `int` can't.
And so an `Integer!`, which cannot be `null`, is really very much an `int` - even though not quite, but we can ignore the remaining differences today.
For now, think of primitives as the legacy version of `Integer!`, `Float!`, etc.

One thing these specific null-restricted types all have is a good default value that fields and variables can be initialized to.
`Integer!` has zero, `Boolean!` has `false`, etc.
But what would a variable or field of type `String!` be initialized to?
`null` sounds wrong, given that the type explicitly forbids this.

Variables are fairly straight-forward as definite assignment analysis can ensure we write a value before reading the variable.

```java
// VARIABLES:
String! greeting;
// doesn't compile (even today)
// with error:
//   variable greeting might not
//   have been initialized
println(greeting);
```

For fields, the unexpected save comes from Amber's exploration of more flexible constructor bodies, which preview since JDK 22.
I made [a whole video about that](https://www.youtube.com/watch?v=cI-fY9YlmH4) but the summary is that under that proposal you can have statements in the constructor before the eventual call to another constructor with `this()` or `super()` as long as those statements don't touch `this` - ...

> I told you, homeboy
>
> You can't touch this

Well, actually you can but just to assign fields - no instance method calls, for example, in this so-called _preinitialization context_.
It seems like this relaxation of the construction protocol will be immediately exploited by Valhalla, which requires us to assign all null-restricted fields in that pre-construction context.

```java
// FIELDS:
value class Greeting {

	private String! text;

	Greeting() {
		// doesn't compile because
		// `greeting` wasn't
		// assigned
		println(greeting);
	}

}
```

That means null-restricted fields will actually be `null` for a few statements, but no code will ever be able to observe that.

That, the definite assignment analysis for variables and a kind of array constructor that I'll also skip here, means that we can declare non-null variables, parameters, and fields of all types and array types without a type having to be prepared for it.
That means a soon-to-be value class like `LocalDateTime`, for which no good default value exists, can still be used for null-restricted fields.
And this is essential for the next difference between identity classes and primitives.


## Memory Layout

Ok, so let's talk about the memory layout.
Primitives like `int` and `double` are simple bit patterns flatly embedded in fields, the stack, or registers.
Identity classes, on the other hand, are reference types, meaning each instance sits in a unique memory location on the heap and has a bunch of header bits for identity-sensitive operations.
Parameters, variables, and fields reference it by pointer.
Or at least that's the illusion the runtime maintains.
If analysis shows that an object doesn't escape a certain scope, the runtime can do really nasty things to reduce the negative performance impact of headers, indirections, and heap allocations.

And the same applies to value classes.
Technically, they're reference types and that's how we should think of them, but because the runtime doesn't have to track their non-existent identity it can be even nastier to to them.
It can, for example, at any time decide not to represent a value object as a reference type on the heap and instead shred it into its fields and keep them on the stack.
It can also embed a value object directly in a field or array, thus removing the indirection of a pointer.

And the memory layout is also where nullability comes back in.
If a value class wraps a numeric primitive, say a `long`, then all 2^64 bit patterns are already used and if a variable of that type could be `null`, a 65th bit is required, which will balloon to 128 bits in total on modern hardware.

```java
value class Euros {

	// total amount
	private long cents;

	// ...

}

// requires vsc64 bits for long
// plus 1 bit for null ~> 65 bits
Euros eur65 = new Euros(420);

// no null ~> requires 64 bits
Euros! eur64 = new Euros(420);
```

So by marking a field or array type as non-nullable, we give the runtime the information it needs to remove that extra bit that became 64 bits.

Taken together the runtime can give us primitive-like performance for non-nullable value objects and even a pretty decent speedup for nullable ones.
I want you to pause for a moment and let that sink in.
We would get "custom primitives" with great performance as a consequence of good, domain-driven decisions for our types' identity requirements and our variables' nullability.
And all we'd need to learn for that is how to wield the new keyword `value`, how to use `?` and `!`, and how to order constructor statements - that's crazy!
I would want those things even without any performance gains and we get those on top?
I'm at a loss for words.


## Remaining Differences

Ok, let's go back to our list of differences and see where the proposed value classes fit in.
As discussed, they're identity-less like primitives but can still be `null`, although thanks to null-restricted types they won't always have to be.
Their memory layout is technically that of identity classes, but the runtime has a lot of leeway to optimize all the way down to the density and flatness of primitives.
We didn't get to atomicity and even Brian's talk is very scarce on details here, but suffice it to say that value classes will probably have atomic loads/stores by default but can opt out of that if they want the performance gain.
All that's the "works like an `int`" part.

As for "codes like a class", just like identity classes, value classes can be user-defined, have members, methods, supertypes, and a flexible construction protocol.
And since they're technically reference types, they'll work just fine with generics and so will their null-restricted variants.
So, for a custom value class `ComplexNumber` we can have a `List<ComplexNumber!>` and then likewise, we can also have `List<Integer!>`, which is basically `List<int>`.
As per the current draft proposal, this is how we'd get "generics over primitives", namely as "generics over null-restricted primitive wrappers".
There are plans for how the runtime can then flatten them, so that the backing array of an `ArrayList<ComplexNumber!>` or `ArrayList<Integer!>` can contain primitive values instead of pointers, but that'll probably come after the language changes.

And I can't wait for all that to happen.
When?
Don't check the comments, I'll definitely not leave my guesses there.

Billy will be here in two weeks.
I'll see you in four.
So long ...

<!--
-->

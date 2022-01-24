---
title: "Why Java's Records Are Better* Than Lombok's `@Data` and Kotlin's Data Classes"
tags: [java-16, records, rant]
date: 2021-05-05
slug: java-record-semantics
description: "While all three remove boilerplate, the similarities don't go much further. Records have stronger semantics with important downstream benefits, which makes them better*. (\\* not always; depends on circumstances; excuse the clickbait)"
featuredImage: record-semantics
---

I'm sure by now you've all seen the examples of how records turn a full-blown POJO ...

```java
class Range {

	private final int low;
	private final int high;

	public Range(int low, int high) {
		this.low = low;
		this.high = high;
	}

	public int getLow() {
		return low;
	}

	public int getHigh() {
		return high;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (o == null || getClass() != o.getClass())
			return false;
		Range range = (Range) o;
		return low == range.low &&
				high == range.high;
	}

	@Override
	public int hashCode() {
		return Objects.hash(low, high);
	}

	@Override
	public String toString() {
		return "[" + low + "; " + high + "]";
	}

}
```

...into a single line of code:

```java
//          these are "components"
record Range (int low, int hight) { }
```

Of course Lombok's `@Data` or `@Value` (depending on your needs) could do that for years with a few more lines:

```java
@Data
class Range {

	private final int low;
	private final int high;

}
```

And if you're familiar with Kotlin, you know how data classes do the same:

```kotlin
data class Range(val low: Int, val high: Int)
```

So these are essentially the same features right?
No.
No, they're really not.
Because for records, boilerplate reduction is not the purpose, it's just a (welcome) consequence of their semantics.

<pullquote>These are really not the same features</pullquote>

Unfortunately, this gets easily lost.
The boilerplate reduction is obvious and sexy and easy to demonstrate, so it gets a lot of exposure.
But the semantics and their benefits don't.
It doesn't help that [the official documentation](https://docs.oracle.com/en/java/javase/16/language/records.html) also takes the boilerplate angle and while [JEP 395](https://openjdk.java.net/jeps/395) better explains the semantics, due to its scope it's naturally vague when it comes to describing the downstream benefits.
So I thought I'd write them down here.

First semantics, then benefits.


## Record Semantics

JEP 395 says:

<pullquote>Records are transparent carriers for immutable data</pullquote>

> [Records] are classes that act as transparent carriers for immutable data.

So by creating a record you're telling the compiler, your colleagues, the whole wide world that this type is about data.
More precisely, data that's (shallowly) immutable and transparently accessible.
That's the core semantic - everything else follows from here.

If this semantic doesn't apply to the type you want to create, then you shouldn't create a record.
If you do it anyways (maybe lured in by the promise of no boilerplate or because you think records are equivalent to `@Data`/`@Value` or data classes), you're muddying your design and chances are good that it will come back to bite you.
So don't.

(Sorry for the harsh words, but it needed to be said.)

### Transparency & Restrictions

Let's have a closer look at transparency.
Records even have a motto for that - paraphrasing [a Project Amber design document](https://cr.openjdk.java.net/~briangoetz/amber/datum.html):

> The API for a record models the state, the whole state, and nothing but the state.

To live up to that, some restrictions are needed:

* an accessor for each component with the same name and return type that returns exactly the component's value (or the API doesn't model the state)
* an accessible constructor whose parameter list matches the components (called _canonical_ constructor; or the API doesn't model the state)
* no additional fields (or the API doesn't model the whole state)
* no class inheritance (or the API doesn't model the whole state because more can be hiding elsewhere)

Why, though?
Lombok allows additional fields and Kotlin's data classes, too, as well as private "components" (that's the record term; Kotlin calls them _primary constructor parameters_).
So why is Java so strict about this?
To answer that, we need some math.

### Math (sorry)

A _set_ is a bunch of elements, e.g. we can say **C** is the set of all colors `{ blue, gold, ... }` and **N** the set of all natural numbers `{ 0, 1, ...}`.
The finite set `{ -2147483648, ..., 0, ..., 2147483647}` is what we in Java typically call **int** and if we throw in `null` we get **Integer**.
Similarly, the infinite set of all possible strings (plus `null` 🙄) is what we call **String**.

So, as you can see, types are sets where the set's values are exactly the values that are legal for that type.
That also means that _set theory_, "the branch of mathematical logic that studies sets" ([says Wikipedia](https://en.wikipedia.org/wiki/Set_theory)), is related to _type theory_,  "the academic study of type systems" ([likewise](https://en.wikipedia.org/wiki/Type_theory)), which language design relies on.

<pullquote>Types are sets</pullquote>

Now let's do something fancy and build pairs of integers (yes, _that_ fancy): `{ (0, 0), (0, 1), ... }`.
This is what a simple and terribly incomplete Java class for that would look like:

```java
class Pair {

	private final int first;
	private final int second;

}
```

We could call the corresponding set **Pair** and that would work.
But there's a bit more insight to be had because we know more about the set's structure.
Specifically, we know that it's the combination of all `int`s with all `int`s.
Set theory calls that a _product_ and it's written as **int × int** (each type in a product is called an _operand_).

That's pretty cool because set theory has all kinds of things to say about applying functions to these products.
One aspect of that is how functions that operate on a single operand can be combined to functions that operate on all operands and which properties of the functions ([injective](https://en.wikipedia.org/wiki/Injective_function), [bijective](https://en.wikipedia.org/wiki/Bijection), etc.) remain intact.

For example:

```java
// given: bijective function from int to int
IntUnaryOperator increment =
	i -> i == Integer.MAX_VALUE ? Integer.MIN_VALUE : ++i;
// then: combining two `increment`s yields a bijective function
//       (this requires no additional proof or consideration)
UnaryOperator<Pair> incrementPair =
	pair -> new Pair(
		increment.applyAsInt(pair.first()),
		increment.applyAsInt(pair.second()));

```

Did you note the accessors `Pair::first` and `Pair::second`?
They didn't exist in the class above, so I need to add them.
Otherwise I couldn't apply functions to individual components/operands and so I couldn't really use `Pair` as a pair of `int`s.
Similarly, but in the other direction, I needed a constructor that takes both `int`s as arguments so I can reconstitute a pair.

More generally, to apply set theory to a type in the way I alluded to above, all its operands need to be accessible and there must be a way to turn a tuple of operands into an instance.
If both is true, type theory calls such a type a _product type_ (and their instances _tuples_) and there are a few cool things we can do with them.

Actually, records are even better* than tuples.
JEP 395 says:

> Records can be thought of as nominal tuples.

Where _nominal_ means that records are identified by their name and not their structure.
That way you can't mix up two different record types that both model **int × int**, for example `Pair(int first, int second)` and `Range(int low, int high)`.
Also, we access the record components not by index (not `range.get1()`) but by name (`range.low()`).

(Beyond that, a record's accessors and its canonical constructor form an _embedding-projection pair_, but I hardly understand that.
Definitely too little to explain.)

### Consequences

I want to drive the point home:
Records want to be product types (because of the cool things) and for that to work, all their components must be accessible, i.e. there can be no hidden state, and construction from them must be possible.
That's why records are **transparent** carriers of immutable data.

<pullquote>Records are product types; that's why they're transparent</pullquote>

Hence the compiler generates accessors.  \
Hence we can't change their names or return type.  \
Hence we should be very careful with overriding them.  \
Hence the compiler generates a canonical constructor.  \
Hence there can be no inheritance.


## Why Records Are Better*

Most benefits we get from the algebraic structure revolve around the fact that the accessors together with the canonical constructor allow to take apart and recreate record instances in a structured manner without loss of information.

### Destructuring Patterns

[JEP 405](https://openjdk.java.net/jeps/405) proposes record and array patterns, which will enhance Java's [pattern matching](tag:pattern-matching) capabilities.
They will allow us to take records and arrays apart and apply further checks to their components:

```java
if (range instanceof Range(int low, int high) && high < low)
	return new Range(high, low);
```

Thanks to full transparency, we can be sure not to miss hidden state.
That means that the difference between `range` and the returned instance is exactly what you see: `low` and `high` are flipped - nothing more.

### `with` blocks

A future version of Java may introduce `with` blocks that make it very easy to create copies of (usually immutable) instances with some values changed.
It could look something like this:

```java
Range range = new Range(5, 10);
// SYNTAX IS MADE UP!
Range newRange = range with { low = 0; }
// range: [5; 10]
// newRange: [0; 10]
```

The language can derive `with` expressions precisely because `Range`'s API is aligned with its declaration.
And similar to before, we can rely on `newRange` being exactly like `range` except for `low` - there can be no hidden state that we failed to transport.
And the language really doesn't have to do much here:

* declare variables for components (e.g. `low`, `high`) and assign values via accessors
* execute the `with` block
* pass the variables to the canonical constructor

(Note that this feature is far from being a reality and might change considerably or even get dropped.)

### Serialization

To turn an instance into a byte stream, a JSON or XML document, or any other external representation and back again requires a way to take an instance apart into its values and then take those values and put them back together.
You can immediately see how this works really well with records.
Not only do they expose all their state and offer a canonical constructor, they do so in a structured way that makes the reflection API for that very straightforward to use.

For a lot more about how records changed serialization, check out [the Inside Java Podcast, episode 14](https://inside.java/2021/03/08/podcast-014/) (also on many audio platforms, e.g. [on Spotify](https://open.spotify.com/episode/6lmaaDwvV7NaJ3YFrid3ww)).
If you prefer a short read, I wrote [a Twitter thread](https://twitter.com/nipafx/status/1371093883631833092) about it.

### Also, The Boilerplate

Going back to the boilerplate for a second.
As explained earlier, we need the following code so a record can be a product type:

* canonical constructor
* accessors
* no inheritance

I didn't explicitly state that, but it's kinda nice if `(0, 0) = (0, 0)`, so a proper `equals` implementation is welcome as well, which immediately requires a `hashCode` implementation.

Since we need all that, the compiler might as well generate it.
So it does (and throws in `toString` for good measure) - not so much to save us from writing it but because it's a natural consequence of the algebraic structure.


## Why Records Are Worse*

Records' semantics restrict which class-building tools you can use.
As discussed, you can't add hidden state via additional fields, can't rename accessors, can't change their return type, and probably shouldn't change their return value.
Records also don't allow reassigning component values, i.e. their backing fields are `final`, and no class inheritance (you can implement interfaces, though).

So what if you need that?
Then records aren't what you're looking for and you need to create a regular class instead.
Even if that means that just to change 10% of the functionality, you'll end up with 90% of the boilerplate that a record would've prevented.

### Why Lombok's `@Data`/`@Value` Is Better*

Lombok just generates code.
There's no semantic attached, so you have all the freedom you need to adapt the class to your requirements.
Of course you don't get the benefits that come from stronger guarantees either, although Lombok may be able to generate destructuring methods in the future.

<pullquote>Lombok attaches no semantics</pullquote>

(That said, I don't advertise using Lombok.
It heavily relies on APIs internal to the compiler, which can change at any time and which means projects using it can break on any minor Java update.
That it goes to [great lengths](https://github.com/projectlombok/lombok/commit/9806e5cca4b449159ad0509dafde81951b8a8523) to [hide that technical debt](https://github.com/projectlombok/lombok/commit/27f3917d892fcb507e3f5c5b7ecfbeb147c43c90) from its users isn't great either.)

### Why Kotlin's Data Classes Are Better*

Here's what [the docs say about data classes](https://kotlinlang.org/docs/data-classes.html):

> You often create classes whose main purpose is to hold data.
> In such classes, some standard functionality and utility functions are often mechanically derivable from the data.

You can see that the semantic of holding data is there as well, but it's pretty weak and the focus is on deriving functionality, i.e. generating code.
Indeed, data classes offer more class building tools than records (mutable "components", hidden state, ...), but unlike with Lombok, you can't use all of them (can't be extended, can't create your own `copy` method, ...).
On the other hand, data classes don't give records' strong guarantees, so Kotlin can't quite build the same features on top of them.

<pullquote>Data classes have weak semantics</pullquote>

Before you get your keyboards out to write angry comments (which you can't because I didn't get around to have those yet - har har), this is no value judgement.
It's a different trade-off with different costs and benefits and if Kotlin's make more sense to you, that's fine with me.
Don't @ me (as the kids say).

<admonition type="note">

Readers have been pointing out [Kotlin's `@JvmRecord`](https://kotlinlang.org/docs/jvm-records.html#declare-records-in-kotlin), some as a big gotcha: "See, data classes can be records, too - check mate" (I'm paraphrasing [but only barely](https://news.ycombinator.com/item?id=27078785)).
If you had the same thought, I ask you to stop and mull it over for a second.
What exactly does that get you?

The data class has to abide by all record rules, which means it can't do more than records.
But Kotlin still doesn't understand the concept of transparent tuples and can't do more with a `kotlin§@JvmRecord data class` than with a regular data class.
So you have records' freedoms and data classes' guarantees - the worst of both worlds.

Why does `@JvmRecord` exist, then?
Just interoperability.
As [the proposal](https://github.com/Kotlin/KEEP/blob/master/proposals/jvm-records.md) says:

</admonition>

<pullquote>There's not much use in declaring JVM records in Kotlin</pullquote>

> There's not much use in declaring JVM records in Kotlin besides two use cases:
>
>* migrating an existing Java record to Kotlin and preserving its ABI;
>* generating a record class attribute with record component info for a Kotlin class to be read later by a potential framework relying on Java reflection to introspect records.


## Reflection

\* 👇🏾

So of course records aren't _generally_ better or worse than the other two features or others with similar design like Scala's case classes.
But they do have strong semantics with a firm mathematical foundation that, while limiting our class design space, enable powerful features that would otherwise not be possible or at least not as reliable.

It's a trade-off between developer freedom and language power.
And it's one I'm happy with and look forward to see unfolding it's full potential over the next years.

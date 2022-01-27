---
title: "Better Random Number Generation in Java&nbsp;17"
tags: [java-17, random]
date: 2021-09-13
slug: java-random-generator
description: "Java 17 expands the API for random number generation to make it more usable, extensible, and robust with `RandomGenerator` and `RandomGeneratorFactory` at its core."
featuredImage: random-generator
---

Java's API around random numbers used to be a bit muddied.
First and foremost, there's [the class `Random`][random], which has a solid API.
Then there are [its subclasses `SecureRandom`][secure-random], which is slower but a cryptographically strong random number generator, and [`ThreadLocalRandom`][thread-local-random], which is faster than `Random` but not thread-safe.

Then, off to the side, [we have `SplittableRandom`][splittable], which is also not thread-safe, but has a method `split` that returns a new `SplittableRandom` that you can pass to a task in a newly spawned thread - this works great for fork/join-style computations.
The streams of random numbers `SplittableRandom` returns, e.g. with `SplittableRandom::longs`, employ this functionality when used as a parallel stream.

<contentimage slug="random-types-before" options="narrow"></contentimage>

But have you ever tried replacing `Random` with `SplittableRandom`?
They're unrelated, so it can be a bit cumbersome.
Then there are some methods like `nextLong​(long bound)` that you can find on some of the classes but not others.
Apparently, these classes aren't doing great under the hood either with a few identical pieces of code in several classes and because there's no overarching interface, third parties can't easily provide drop-in replacements for these classes.

<pullquote>These classes aren't doing great under the hood either.</pullquote>

But all of this changes with Java 17.

[random]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Random.html
[secure-random]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/security/SecureRandom.html
[thread-local-random]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ThreadLocalRandom.html
[splittable]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/SplittableRandom.html


## The New Type Hierarchy Around `RandomGenerator`

Thanks to the work done as part of [JEP 356][jep-356], Java 17 ships with a new and better [random generator API][random-api].
One of its core elements is the new interface hierarchy for random (number) generators with [the new interface `RandomGenerator`][random-generator] at its top.

[jep-356]: https://openjdk.java.net/jeps/356
[random-api]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/random/package-summary.html
[random-generator]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/random/RandomGenerator.html

### `RandomGenerator`

`RandomGenerator`'s API is basically that of `Random` plus a few methods it was missing - like the ones with the upper bound I mentioned earlier.
Its implementations are not required to be thread-safe or cryptographically secure.

The four preexisting classes we just discussed were all refactored to share more of their code and make future RNGs easier to implement.
They were also expanded to provide the full API of `RandomGenerator`, which they now implement.
All of this while being 100% backwards compatible of course.

### Detailed Subtypes

Then there are five additional interfaces that extend `RandomGenerator`.
Their differentiating factor is how you can use one such generator to create another one that is statistically independent and individually uniform (or some approximation thereof), so you can pass them off to a new thread.

`StreamableGenerator` can return a stream of random generators.
This is helpful because if a generator can create a set of new generators all at once, it can make a special effort to ensure that they're statistically independent.
How can a generator create another generator?
That depends on the underlying algorithm.

Some can return a new generator by jumping forward a number of draws - depending on how many, they implement `JumpableGenerator`, `LeapableGenerator`, or `ArbitrarilyJumpableGenerator`.
Then we have `SplittableGenerator`, which prescribes the behavior I described earlier for `SplittableRandom`, meaning a generator that can split itself into two.

As mentioned before, all four existing classes extend the top-level interface `RandomGenerator`.
Furthermore, `SplittableRandom` also implements `SplittableGenerator`.

<contentimage slug="random-generator-hierarchy"></contentimage>

That means you can either keep using the existing classes or migrate towards the new interface to make it easier to exchange implementations.
Similarly to `List` vs `ArrayList` and `LinkedList`.

No new public classes were added, though, so how do you get an instance of, say, `LeapableGenerator`?


## Algorithm Selection

A few new algorithms have been implemented and more will likely come in the future.
I know next to nothing about this complicated field, though, so I'm not gonna speak to any specific algorithm.
Instead, I assume you know what you're looking for and will tell you how to get it.
Deal?

### By Name

Generally speaking, all the new interfaces have a static `of` method that takes an algorithm name as a `String` argument.
If an algorithm of that name is implemented and adheres to the interface `of` is called on, it will return an instance of it.
Otherwise it throws an `IllegalArgumentException`.

```java
String algorithmName = "...";

RandomGenerator.of(algorithmName);
StreamableGenerator.of(algorithmName);
JumpableGenerator.of(algorithmName);
LeapableGenerator.of(algorithmName);
ArbitrarilyJumpableGenerator.of(algorithmName);
SplittableGenerator.of(algorithmName);
```

So to create a `LeapableGenerator`, you can call `LeapableGenerator.of("Xoshiro256PlusPlus")`.
Obviously.

The Javadoc contains [a list of algorithms][algorithms] that all JDK implementations must contain, but any specific JDK may add more.
Due to advances in random number generator algorithm development and analysis, this list isn't set in stone, though.
Algorithms can be deprecated at any time and can be removed in major JDK versions.

So picking algorithms by name may not be the best way to write robust code.
Fortunately, a better alternative exists.

[algorithms]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/random/package-summary.html#algorithms

### By Properties

The second core element of the new API is the robust selection of algorithms based on requirements.
If you don't have any specific requirements, you can call `RandomGenerator.getDefault()` to get an arbitrary algorithm:

```java
RandomGenerator generator = RandomGenerator.getDefault();
```

If you need more control, you can use [the new class `RandomGeneratorFactory`][random-factory].
It also has a static `of(name)` method, which returns a factory for a specific algorithm, but that gets you back to where you started (naming algorithms) and doesn't help with writing more robust code.

For that you can call the static method `all`, which will return a stream of factories, one per algorithm.
The cool thing about that is that you can query factories for properties of the algorithm:

* Is it jumpable, leapable, or splittable?
* How many state bits does it have?
* Does it use a hardware device?
* What is its equidistribution?

You can then filter by your specific requirements, find any factory that fulfills them, and use it to create a `RandomGenerator`.

```java
RandomGenerator generator = RandomGeneratorFactory.all()
	.filter(RandomGeneratorFactory::isJumpable)
	.filter(factory -> factory.stateBits() > 128)
	.findAny()
	.map(RandomGeneratorFactory::create)
//  if you need a `JumpableGenerator`:
//  .map(JumpableGenerator.class::cast)
	.orElseThrow();
```

[random-factory]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/random/RandomGeneratorFactory.html


## Adding Algorithms

Beyond the JDK, third parties can also implement random number generators.
The interface `RandomGenerator` is registered as a service, so any JAR can provide their own implementations of it.
By using the annotation `@RandomGeneratorProperties`, the information that I mentioned before - state bits, equidistribution, etc. - can be attached to it.

The JDK classes will then pick up these implementations and on the use site, they integrate perfectly with the mechanisms described above - be it the static factory `of` methods or the more robust `RandomGeneratorFactory` approach.


## Reflection

In summary:

* a new hierarchy of interfaces makes it easier to identify key properties of an algorithm and to switch between implementations
* the four existing random number classes got refactored, slightly extended, and now implement those interfaces while their behavior stays as is
* new algorithms have been and will be implemented as internal classes
* factories can be used to robustly pick algorithms that fulfill specific requirements

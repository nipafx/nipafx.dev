---
title: "24 Java Features You Missed In 2022 - Inside Java Newscast #39"
tags: [collections, documentation, java-18, java-19, pattern-matching, performance, records]
date: 2022-12-15
slug: inside-java-newscast-39
videoSlug: inside-java-newscast-39
description: "JDK 18 and JDK 19 preview a number of big ticket features but they also come with a lot of smaller improvements. Here are 24 less-known features that were added to Java in 2022. Among them additions to `Future` and `ForkJoinPool`, to `HashSet` and `HashMap`, Security and GC improvements, Custom Localized Date-Time Formats and an Internet Address Resolution SPI, and much more."
featuredImage: inside-java-newscast-39
---

## Intro

Ho, ho, ho and welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nikolaus Parlog, Java developer advocate at Oracle and bringer of presents, and today we're gonna unbox 24 Java features you missed in 2022.
From language features to API additions, from tooling to performance - my advent calendar is filled to the brim.

Wait, it's not Nikolaus who brings the advent calendar, right?
And doesn't this look like Santa Claus' cap?
Also, this fake fur jacket looks way kinkier than anything either of the two would ever wear.
Ugh, nevermind, I can't do the voice the entire episode anyway.
I'll just look weird, then.

So are you ready for 24 features, small and large, safe and fast?
Then let's dive right in!

## Structured Concurrency Debugging

JDK 19 famously previews Project Loom's virtual threads and people have also taken note of [the structured concurrency API][structured] it is incubating.
One aspect of that approach to concurrency that can hardly be overstated is the relationship it introduces between threads.
If one thread launches a few subtasks each in their own thread and then waits for them to complete there's a clear parent-child relationship between those threads.
And it's expressed at run time, so it's visible in thread dumps and during debugging.

In fact, just the other day I noticed that IntelliJ now allows navigation of that hierarchy - so cool!
This will be a game changer for debugging when you can go from any random subtask that you paused in all the way up to the very thread that handles the entire use case or request.

<contentimage slug="intellij-debugger-structured-concurrency"></contentimage>

[structured]: https://docs.oracle.com/en/java/javase/19/docs/api/jdk.incubator.concurrent/jdk/incubator/concurrent/package-summary.html

## Chaotic Concurrency 😋

Speaking about structured concurrency:
It relies on [the class `Future`][future] but you'll usually only ask instances of them for exceptions or results when they already completed.
To make that easier to determine and request, `Future` got three new methods:

* `exceptionNow()` to immediately return the exception thrown by the task
* `resultNow()` to immediately return the task's result
* `state()` to check whether the `Future` is in an appropriate state to request exception or result - because if it's not, the other two methods throw `IllegalStateException`s

More has changed for pre-existing concurrency APIs in JDK 19:

* [`ForkJoinTask`][fork-join-task] got two new variants of joining quietly, namely `quietlyJoin` with timeout and `quietlyJoinUninterruptibly`, also with timeout.
* On [`ForkJoinPool`][fork-join-pool], you can now submit tasks lazily that you don't need to execute if contention is high with `lazySubmit`; and with `setParallelism` you can set the pool's target parallelism after creation.

[future]: https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/util/concurrent/Future.html
[fork-join-task]: https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/util/concurrent/ForkJoinTask.html
[fork-join-pool]: https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/util/concurrent/ForkJoinPool.html

## Hash, Set, and Map 🎾

When you know exactly how many elements your `HashSet` has to contain, how do you create one of correct size, so that no resizing is necessary?
Pass that number as `initialCapacity` to the constructor?
Nope, because there's a load factor in play, usually 75%.
Once the set contains that many elements relative to capacity, it will resize.

```java
// a capacity of 64 with the default load
// factor of 0.75 leads to a resize after
// 49 elements were added
var capacity64 = new HashSet<String>(64);
```

To avoid the resize, you can compute capacity from expected element count via the load factor... or you can use [the static factory method `newHashSet`][new-hash-set] that was added in JDK 19 and pass in the number of elements - it will do the math for you.
Same for `HashMap`, by the way, except [it's called `newHashMap`][new-hash-map], obviously.

```java
// this set has sufficient capacity to accept 64
// elements before resizing
var elements64 = HashSet.<String> newHashSet(64);
```

[new-hash-set]: https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/util/HashSet.html#newHashSet(int)
[new-hash-map]: https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/util/HashMap.html#newHashMap(int)

## GitHub Action

The GitHub action [oracle-actions/setup-java][setup-java] allows you to easily set up various OpenJDK builds from jdk.java.net:

* general availability builds, currently JDK 19
* early-access builds of mainline JDK, for example JDK 20 and soon JDK 21, and
* early-access builds of projects like Loom and Panama

It also allows you to set up Oracle JDK builds from oracle.com/java - the NTFC license gives you a lot of leeway to use it for free.

[setup-blog]: https://inside.java/2022/03/11/setup-java/
[setup-java]: https://github.com/marketplace/actions/setup-java-development-kits-built-by-oracle

## Compressing and Expanding

Say you have a vector of RGB values and want to create a new vector with just the reds at the beginning and everything else set to zero.
How do you do that?
A `rearrange` with a shuffle and a mask would do the trick, but it's tedious and non-obvious.
JDK 19 added a more succinct operation to the vector API to accomplish this: [`compress`][vector-compress].
Just pass in a mask of the lanes you want to select and they'll be placed in a contiguous section at the beginning of the result vector, with everything else set to 0.

To go the other way, use [`expand`][expand]:
Starting from index 0, lanes are parceled out into each result lane where the mask is true.
Spiritually speaking, compress and expand are inverse to one another but not quite because both lose information, namely the non-selected lanes.
But if you compress and then expand with the same mask, you get the input vector back with all lanes that the mask didn't select set to zero.
Beautiful.

Now, here's a cool thing!
Take an `int` - 32 bits - and imagine it as a vector with 32 lanes.
Compressing and expanding applies here, too, right?
And the mask would be 32 booleans/bits, so another `int`.
Hence `Integer` got new static methods [`compress`][integer-compress] and [`expand`][integer-expand] that accept the "input vector" and the "vector mask" as `int` arguments and return an `int`.
Same for `Long` but with `long`.
By the way, at least on x86 processors this is implemented as an intrinsic leveraging the [PEXT] instruction, which makes it lightning fast.

[vector-compress]: https://docs.oracle.com/en/java/javase/19/docs/api/jdk.incubator.vector/jdk/incubator/vector/Vector.html#compress(jdk.incubator.vector.VectorMask)
[vector-expand]: https://docs.oracle.com/en/java/javase/19/docs/api/jdk.incubator.vector/jdk/incubator/vector/Vector.html#expand(jdk.incubator.vector.VectorMask)
[integer-compress]: https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/lang/Integer.html#compress(int,int)
[integer-expand]: https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/lang/Integer.html#expand(int,int)
[PEXT]: https://www.felixcloutier.com/x86/pext

## Suppressing Javadoc Linting

You write Javadoc, right?
And you use DocLint to check for potential problems, right?
And you fix all of those immediately, right?

If you answered yes, yes, no, respectively, then I got good news for you:
You can now [suppress] DocLint warnings with the usual `@SuppressWarnings` annotation.

```java
// suppress all doclint warnings
@SuppressWarnings("doclint")
// suppress warnings for syntactic issues
@SuppressWarnings("doclint:syntax")
```

[suppress]: https://docs.oracle.com/en/java/javase/18/docs/specs/man/javadoc.html#suppressing-messages

## String Deduplication

Since 2017, the G1 garbage collector deduplicates strings, meaning it detects string instances that are equal and retains only a single copy of the backing character array.
Measurements done on a large number of Java applications big and small have shown that on average 25% of heap data are `String` objects and about 13.5% are duplicated - removing their backing character arrays reduces memory footprint by roughly 10%.
Since JDK 17, Shenandoah and since JDK 18, ZGC, Serial GC, and Parallel GC also support string dupdidup de dup dep dupli deduplication.
Damn it!

```java
// `s1` and `s2` are equal if:
boolean equal = s1.equals(s2);
```

## G1 Region Size

Ugh, if I can't even get "deduplication" out, I probably need a break, so let's have one.
By the way, I have a question.
On another Newscast, [recently][ijn-33], I mentioned that "this is a different Newscast because you actually have to sit down and watch the screen" whereas the other ones, like this one, you usually don't.
You might be, you know, preparing lunch or putting together the laundry or whatever and can still listen to me.
And I asked myself, what _are_ you actually doing?
Like, how do you usually watch these episodes?
I'm really curious to find out, so please leave a comment - I really wanna know.

Also,  let's change this around a bit.
Wait, what?
There and there.
Ah, man, see - there we go!

Ik, coming back to G1, the maximum allowed heap region size of 32MB can cause inner and outer fragmentation issues with larges objects on large heaps.
On very large heaps, it leads to increased internal region management overhead and decreased performance due to larger local allocation buffers.
Since JDK 18, it's possible to manually increase the heap region size beyond 32MB to up to 512MB with the command line option `-XX:G1HeapRegionSize`.

Good right, that was good?
Pause worked, let's keep going.

[ijn-33]: https://www.youtube.com/watch?v=vvXmO2ZMGsk

## Security Performance

JDK 19 ships with several performance improvements for security-related code:

* The JDK's SHA3 message digest algorithm performance has been [increased][JDK-8275914] up to 2x.
* The local certificate objects used to resume a TLS session from stateless session tickets are now [cached and reused][JDK-8286433], which reduces memory consumption.
* `SSLAlgorithmConstraints` are [no longer evaluated twice][JDK-8284694], which increases TLS handshake performance.
* And another speedup in the same area comes from [caching][JDK-8285398] the results of constraints checks.

Got all that?
Me neither, but good to know that Java gets faster.

[JDK-8275914]: https://bugs.openjdk.org/browse/JDK-8275914
[JDK-8286433]: https://bugs.openjdk.org/browse/JDK-8286433
[JDK-8284694]: https://bugs.openjdk.org/browse/JDK-8284694
[JDK-8285398]: https://bugs.openjdk.org/browse/JDK-8285398

## Custom Localized Date-Time Formats

To turn a date-time into a string, you need a `DateTimeFormatter`.
Creating custom formatters is easy with the static factors method `ofPattern`.
And creating localized formatters is easy, too, as long as you stick with the four predefined `FormatStyle`s `SHORT`, `MEDIUM`, `LONG`, and ?FULL.
But what about custom localized formatters?
JDK 19 is there for you!

It adds the [static factory method `DateTimeFormatter.ofLocalizedPattern`][ofLocalizedPattern] that accepts Unicode "skeletons", which only define _what_ fields you want to include but leave the formatting and order for the localization to determine.
The `DateTimeFormatterBuilder` class was also extended with the methods `getLocalizedDateTimePattern` and `appendLocalized`.

```java
var now = ZonedDateTime.now();
Stream.of(
		Locale.of("en", "US"),
		Locale.of("ro", "RO"),
		Locale.of("vi", "VN")
).forEach(locale -> {
	Locale.setDefault(locale);
	var custom = now.format(DateTimeFormatter.ofPattern("y-MM-dd"));
	var localized = now.format(DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT));
	// it's now possible to create custom localized formatters for specific patterns
	var customLocalized = now.format(DateTimeFormatter.ofLocalizedPattern("yMM"));
	System.out.printf("""
					Locale %s:
						custom: %s
						local: %s
						both: %s
					%n""",
			locale, custom, localized, customLocalized);
});
```

[ofLocalizedPattern]: https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/time/format/DateTimeFormatter.html#ofLocalizedPattern(java.lang.String)

## Javadoc Search

Since JDK 19, Javadoc's search box can handle multiple search terms.
And to make it easier to navigate results, there's now a page for those.

This seemingly small change has a pretty cool consequence - we can now sidestep the entire Java version search fiasco and create a custom browser search for each JDK version we want.
If you don't know how to do that, I link to explanations for [Firefox] and [Chrome] in the description.

[Firefox]: https://superuser.com/a/7374
[Chrome]: https://zapier.com/blog/add-search-engine-to-chrome/

## jarsigner Provider Path

The new option `-providerPath` has been added to jarsigner.
It allows you to specify the class path of an alternate keystore implementation and can be used in conjunction with the `-providerClass` option.

```sh
$ jarsigner \
	-keystore keystore \
	-storetype MYKS \
	-providerPath mods/test.myks \
	-providerClass org.test.MyProvider \
	signed.jar mykey
> Enter keystore password:
> jar signed.
```

## Address Resolution SPI

The class `java.net.InetAddress` is in charge of resolving host names and addresses, for which it relies on the operating system's native resolver, which is typically configured to use a combination of a local `hosts` file and the Domain Name System.
That has a few downsides:
For one, it clashes with virtual threads because for the time being file-system access pins them to platform threads.
And then, it makes it harder to impossible to support emerging network protocols, customization, or testing.

So since JDK 18, [you can][JEP-418] plug in your own resolver for host names and addresses by implementing the types `InetAddressResolver` and `Idres...`
Eh.
Since the announcement that Idris Elba is gonna be in Cyberpunk 2077... _mouths explosion_
Anyway.
You have to implement `InetAddressResolver` and `InetAddressResolverProvider` and register the latter as a service.

```java
public class ForwardingInetAddressResolverProvider
	extends InetAddressResolverProvider {

	@Override
	public InetAddressResolver get(Configuration configuration) {
		return new ForwardingInetAddressResolver(
			configuration.builtinResolver());
	}

	@Override
	public String name() {
		return "Forwarding";
	}

}

public class ForwardingInetAddressResolver
	implements InetAddressResolver {

	private InetAddressResolver builtinResolver;

	public ForwardingInetAddressResolver(
			InetAddressResolver builtinResolver) {
		this.builtinResolver = builtinResolver;
	}

	@Override
	public Stream<InetAddress> lookupByName(
			String host, LookupPolicy lookupPolicy)
			throws UnknownHostException {
		System.out.printf("Looking up '%s'.%n", host);
		return builtinResolver.lookupByName(host, lookupPolicy);
	}

	@Override
	public String lookupByAddress(byte[] addr)
			throws UnknownHostException {
		System.out.printf("Looking up '%s'.%n", Arrays.toString(addr));
		return builtinResolver.lookupByAddress(addr);
	}

}
```

[JEP-418]: https://openjdk.java.net/jeps/418

## Metal Rendering

On macOS, an alternative implementation of the Java 2D rendering pipeline [was developed][JEP-382] that uses the Apple Metal API instead of the deprecated OpenGL API.
It's fully functional and generally performs better, sometimes by a lot, than the OpenGL implementation.
That happened for JDK 17, but in 19, the new pipeline became the default.

Ah, this thing is itchy.
Eh, let's take it off.
Oh crap, we can't have that.
Better.

[JEP-382]: https://openjdk.org/jeps/382

## JAAS without Security Manager

Part of the Java Authentication and Authorization Service, JAAS how nobody calls it, depends on the `SecurityManger`, which, as you probably know, is deprecated for removal.
So in JDK 18, [two new methods were added][JDK-8267108] to the JAAS class `Subject`:

* `callAs` is a replacement for `doAs` and
* `current` is a replacement for `getSubject`

The new methods are similar to but a bit simpler than the old ones, which are deprecated for removed.

[JDK-8267108]: https://bugs.openjdk.java.net/browse/JDK-8267108

## Named Record Patterns

I'm sure you've heard about record patterns, which [preview][JEP-405] in JDK 19, and that you can use them to deconstruct a record into its constituent components.
But did you notice that you can also assign the record itself to a variable?
This is called a _named_ pattern and is really useful when you need to reference the record itself, too.
And it becomes outright magical when you nest record patterns because then you can capture an inner component while destructuring it further.

```java
public static void main(String[] args) {
	Object obj = RandomGenerator.getDefault().nextBoolean()
			? new Point(0, 0)
			: new ColoredPoint(new Point(1, 1), "Green");
	if (obj instanceof Point(int x, int y) point)
		System.out.printf("Point %s with x: %s / y: %s%n", point, x, y);
	else if (obj instanceof ColoredPoint(Point(var x, var y) point, var color))
		System.out.printf("%s point %s with x: %s / y: %s%n", color, point, x, y);
}

record ColoredPoint(Point point, String color) { }

record Point(int x, int y) { }
```

[JEP-405]: https://openjdk.org/jeps/405

## Simple Web Server

Need a web server to launch a static site, maybe for demos or tests?
Since Java 18, the JDK [ships][JEP-408] with a web server, which you can launch with the binary `jwebserver`.
You can do a few fancier things with it - there's link to [an article][boes] in the description - but overall it's intentionally simple and explicitly not meant to be used in production.

[JEP-408]: https://openjdk.org/jeps/408
[boes]: https://inside.java/2021/12/06/working-with-the-simple-web-server/

<!--
More ideas:

* Code Snippets in Java API Documentation (JEP 413)
* FileInputStream.transferTo(OutputStream)
* Math
	.TAU
	.ceilDiv(int, int)
	.ceilDiv(long, int)
	.ceilDiv(long, long)
	.ceilDivExact(int, int)
	.ceilDivExact(long, long)
	.ceilMod(int, int)
	.ceilMod(long, int)
	.ceilMod(long, long)
	.divideExact(int, int)
	.divideExact(long, long)
	.floorDivExact(int, int)
	.floorDivExact(long, long)
	.unsignedMultiplyHigh(long, long)
* BigDecimal.TWO
* BigInteger.parallelMultiply(BigInteger)
* Random.from(RandomGenerator)
-->

## Outro

And that's all the 24 Java features Santa Nikolaus or whoever brought in his cap - that's how this works, right?
But I found a few more and put them into a pinned comment.
Check it out if you're interested and maybe spring a like or a subscribe while you're at it.

That's it for 2022 on the Inside Java Newscast.
What a year!
Thank you very much for watching and I wish you a relaxing few days with friends and family before the craziness returns in January.
So long...

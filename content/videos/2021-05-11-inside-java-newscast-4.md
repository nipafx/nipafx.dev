---
title: "5 Secret Java API Tricks and Record Semantics - Inside Java Newscast #4"
tags: [records]
date: 2021-05-11
slug: inside-java-newscast-4
videoSlug: inside-java-newscast-4
description: "Five nifty Java API features that you need to know (and many more in the linked thread) and a quick explanation why Java records are not about reducing boilerplate."
featuredImage: inside-java-newscast-4
---

## Intro

Welcome everyone,

to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today I got two topics for you:

1. five secret Java API tips
2. the semantics of records

Ready?
Then let's dive right in!

## Five Java API Tips

Gunnar Morling, software engineer at Red Hat, recently [asked on Twitter][gunnar] for people's secret Java API tip - methods or classes that are really helpful, but maybe not that well known.
The replies were great and I want to show you a few here.
I'll link to Gunnar's tweet and all the other ones in the description below, so you can give them a little love if you want to.

Now, how do we do this?
An obvious approach would be to present the ones that got the most likes.
But then I'd have to show you [Lukas Eder's reply][lukas] and I really don't want to.
So instead I'll just pick what I like best.
Links to the relevant documentation is in the description as well.

[gunnar]: https://twitter.com/gunnarmorling/status/1387385489708158977
[lukas]: https://twitter.com/lukaseder/status/1387469154677055489

### `Pattern::asPredicate`

If you have a stream of strings and a regular expression in form of a `Pattern` instance, then how do you filter the strings that match the pattern?
Or determine whether at least one or even all the strings match the regex?
The `Stream` API has methods for that: `filter`, `anyMatch`, `allMatch`, but they all take a `Predicate`.

```java
Stream<String> strings = // ...
Pattern emailPattern = // ...

List<String> emails = strings
	// how to?
	.filter( /* ... */ )
	.toList();
```

And that's basically the answer.
`Pattern` has a method `asPredicate` which returns a `Predicate<String>` that you can use in situations like this.
Very handy!

```java
Stream<String> strings = // ...
Pattern emailPattern = // ...

List<String> emails = strings
	// ~> Pattern::asPredicate
	.filter(emailPattern.asPredicate())
	.toList();
```

[Tweet](https://twitter.com/cmiller1989/status/1387387498163224577),
[documentation](https://docs.oracle.com/en/java/javase/16/docs/api/java.base/java/util/regex/Pattern.html#asPredicate())

### Named Capturing Groups

Staying on the topic of regular expressions, did you know that Java supports named capturing groups?
I didn't.

To create a normal, unnamed capturing group, you'll put that part of the regular expression in parenthesis, right?
You can then later reference it by its index that you pass to `Matcher`'s `group` method.

```java
var domainPattern = Pattern.compile(".*@(.*)");
var domainMatcher = domainPattern.matcher("foobar@demo.com");
domainMatcher.matches();
var domain = domainMatcher.group(1);
```

But you can also reference groups by name - there's an overload for `Matcher::group` that takes a string.
How do you give a group a name, though?
Easy, just put it into angle brackets, prepend that with a question mark, and put the whole thing after the group's opening parenthesis.
Not exactly beautiful, but regular expressions rarely are.

```java
var domainPattern = Pattern.compile(".*@(?<domain>.*)");
var domainMatcher = domainPattern.matcher("foobar@demo.com");
domainMatcher.matches();
var domain = domainMatcher.group("domain");
```

What I really like about this is that it's documentation in code.
I imagine that understanding a regex with named groups is a bit easier than without.

[Tweet](https://twitter.com/helpermethod/status/1387412751136526336),
[documentation](https://docs.oracle.com/en/java/javase/16/docs/api/java.base/java/util/regex/Pattern.html#groupname)

### `Predicate::not`

Here's my entry to the list: `Predicate`'s static method `not`:

```java
@FunctionalInterface
public interface Predicate<T> {

	// [...]

	static <T> Predicate<T> not(Predicate<T> target) {
		Objects.requireNonNull(target);
		return target.negate();
	}

	default Predicate<T> negate() {
		return (t) -> !test(t);
	}

}
```

It takes a `Predicate` and returns a new one that is the negation.

```java
Predicate<Thing> isFoo = // ...
Predicate<Thing> isNotFoo = Predicate.not(isFoo);
```

This might seem unnecessary, can't you just invert the boolean expression that created the predicate in the first place?
Yes, but then that expression needs to be in a lambda, so you can sneak in the exclamation mark, and I like method references more.

```java
// * or use Predicate::negate ?
Predicate<Thing> isAlsoNotFoo = isFoo.negate();
```

Say you have a stream of strings and want to filter out the empty ones, so you call `Stream::filter`.
Either with a lambda like `string -> !string.isEmpty()`.
Or, after a static import of `Predicate::not`, with the method reference `not(String::isEmpty)`.
I prefer the second.

```java
// * this does not work:
(String::isEmpty).negate()
```

[Tweet](https://twitter.com/nipafx/status/1387393085689278467),
[documentation](https://docs.oracle.com/en/java/javase/16/docs/api/java.base/java/util/function/Predicate.html#not(java.util.function.Predicate))

### `Comparator::naturalOrder`

My colleague José Paumard threw in the static method `Comparator::naturalOrder`.
That's a really good one if a generic container needs a comparator, like `List::sort` does, and the parametric type is already comparable.
Calling `naturalOrder` will then return a comparator that simply uses the `Comparable`s `compareTo` methods.

```java
// `String` is `Comparable`
Comparator<String> naturally = // ???
	Comparator.naturalOrder();
List<String> names = // ...
names.sort(naturally);
```

Beyond passing that on directly, `naturalOrder` is also a great starting point for the many other methods on `Comparator`, which has a lot more to offer.
Whether it's reversing or chaining comparators or making them `null`-safe - `Comparator` has a method for you.

[Tweet](https://twitter.com/JosePaumard/status/1387394155882627072),
[documentation](https://docs.oracle.com/en/java/javase/16/docs/api/java.base/java/util/Comparator.html)

### `AutoClosable` streams

Ok, we had some fun - now let's talk about safety.
The `Stream` interface extends `AutoCloseable`, which means you can use it in a try-with-resources block.

And there are cases where you have to!
When using the streams returned by `Files::list` or `Files::lines`, for example.
The methods' JavaDoc always mentions when you have to close the returned stream.

```java
// nay
List<String> contentLines = Files
	.lines(file)
	.filter(not(String::isEmpty))
	.toList();

// yay
try (Stream<String> lines = Files.lines(file)) {
	List<String> contentLines = lines
		.filter(not(String::isEmpty))
		.toList();
}
```

But there is also a really helpful blog post by Mike Kowalski, a software engineering consultant and blogging member of the Java community, where he goes into more detail and lists all the methods where this is necessary.
I'll link it in the description and while you're there check out more of his posts, for example the one on why you can't afford to run Java 8.

[Tweet](https://twitter.com/mikemybytes/status/1387393015375876100),
[blog post](https://mikemybytes.com/2021/01/26/closing-java-streams-with-autocloseable/)


That was it for Java API tips.
I'm looking forward to read yours in the comments.
Now, let's talk records.


## Record Semantics

With records leaving preview in Java 16, more and more developers are experimenting with it, which is great!
Reading various blog posts and observing or participating in conversations all around the internet made me realize, though, that there's a common misunderstanding about this feature that I want to clear up.
You should know records a bit to get the most out of what follows - I'll link [a good explanation][records] below.

So here it comes.
Ready?
Records are not about avoiding boilerplate.

If they were, I'm sure a number of design decisions would've come out differently.
No, records are not about that, although they have that very welcome property as well.
At the core of records isn't boilerplate, it's tuples, nominal tuples.
Let me explain.

Say you have an integer.
Now take another one and put the two side by side.
There you go, that's a _tuple_.
Assuming that you don't hide any of the two from the outside world and that there's a clear way to create the tuple from two integers.

Now let's talk Java code.
To write a class for that tuple it needs two integer fields, two accessors for them, and a constructor that accepts two integers and assigns them to the fields.
It would also be nice if the tuple `(0, 0)` would equal another tuple `(0, 0)`, so an `equals` implementation would be welcome.
And once we have that, we need to implement `hashCode` as well.
And since we need all that - fields, accessors, constructor, `equals`, `hashCode` - and there's a good default implementation for each, the compiler might as well generate it (and throw in `toString` for good measure).

```java
public final class Tuple {

	private final int first;
	private final int second;

	public Tuple(int first, int second) {
		this.first = first;
		this.second = second;
	}

	public int first() {
		return first;
	}

	public int second() {
		return second;
	}

	@Override
	public boolean equals(Object other) {
		return this == other
			|| other instanceof Tuple tuple
			&& first == tuple.first
			&& second == tuple.second;
	}

	@Override
	public int hashCode() {
		return Objects.hash(first, second);
	}

	@Override
	public String toString() {
		return "(" + first + ", " + second + ")";
	}

}

public record Tuple(
	int first,
	int second) { }
```

So, as you can see, alleviating us of boilerplate code is _a consequence_ of records being tuples.
And that they're tuples is also the reason for their restrictions.
For example, we can't remove an accessor, change it's name or return type, and shouldn't change the value it returns because then the record is no longer a tuple.

The motto is:
The API for a record models the state, the whole state, and nothing but the state.

<pullquote>The API for a record models the state, the whole state, and nothing but the state.</pullquote>

And that comes with a number of benefits.
One of them is the reduction of boilerplate.
Another is that serialization works much better - if you're interested in more on that, check out [the Inside Java Podcast, episode 14][ijp14].
Other benefits are records' suitability for pattern matching and other language features.

There's much more to this and if you want to understand a bit of the mathematical foundation, how records are different from, for example, Lombok's `@Data` annotation or Kotlin's data classes, and what features will build on them, you'll be glad to hear I've just written [an article about that][record-semantics] that I'll link in the description.

[records]: https://blogs.oracle.com/javamagazine/records-come-to-java
[ijp]: https://inside.java/2021/03/08/podcast-014/
[record-semantics]: https://nipafx.dev/java-record-semantics/


## Outro

And that's it for today on the Inside Java Newscast.
If you have any questions about what I covered in this episode, ask ahead in the comments below and if you enjoy this kind of content, help us spread the word with a like or by sharing this video with your friends and colleagues.
I'll see you again in two weeks.
So long...

Oh, and don't forget to subscribe.
Do it now, this video is over anyways.

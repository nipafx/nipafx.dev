---
title: "Module Imports in Java 23 - Inside Java Newscast #69"
tags: [java-23, j_ms]
date: 2024-05-16
slug: inside-java-newscast-69
videoSlug: inside-java-newscast-69
description: "To reduce the overhead of using APIs, particularly in single source files, Java 23 previews module import declarations of the form `import module $moduleName`, which import all packages exported by the named module"
featuredImage: inside-java-newscast-69
---

I wrote this book ([The Java Module System](https://www.manning.com/books/the-java-module-system?a_aid=nipa&a_bid=869915cb)) seven years ago and you know what?
It's still up to date!
Except for the planned tightening of screws on strong encapsulation from Java 9 to 16, the module system didn't change.
Until now, that is, because Java 23 will preview a nifty little feature that builds on modules and - hey, hey, hey; don't leave - you can use it even if _your code isn't_ in modules.
Curious?

## Intro

Welcome everyone, to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about [JDK Enhancement Proposal 476](https://openjdk.org/jeps/476): module import declarations.
This is a preview feature that was already merged into JDK 23, so you can try it in an early access build today.
Although, I did find a bug in EA build number 22, so maybe wait for this week's 23 or next week's 24.

Anyway... ready?
Then let's dive right in!

## Star Imports

I'm a big proponent of single-type imports because of the clarity it affords, particularly when reviewing diffs.
If you need `List` and `Map`, add `import java.util.List` and `import java.util.Map`.
`import java.util.*`?
All classes from some random package that's probably half an API?
That way lies madness!
It's anarchy!
What's wrong with you, why do you want to see the world burn?!

But then I started writing [single-source-file programs for experiments or short scripts](https://dev.java/learn/single-file-program/), often outside of an IDE, and as the wind goes, so do I and I immediately and spinelessly started using star imports in those situations to make my life easier.
Fast forward a few years, and in comes JEP 476, promising mass-imports on steroids.
But they're not just more powerful, they're also quite a bit smarter.

## Module Imports

JEP 476 previews so-called _module import declarations_ of the form `import module $moduleName;`, which you can strew about your regular import statements.
`import module`, say, `java.sql` imports all public top-level types in the packages exported by the module _java.sql_.
It actually does a bit more than that but we'll get to that later.

This is at once more powerful than star imports because it can import _a lot_ of packages (`import module java.base`, for example, imports 54) _and_ it's smarter because a module usually exports a cohesive API, although _java.base_ is not a good example for that.
So if you import a module, you can be sure to have all types you need to use its API, whereas if you star-import a package, it regularly turns out that you need another package to make the API work.

So as I said, I only use star imports when prototyping or experimenting and I will definitely switch to module imports there.
On that topic, the proposal for a simplified `main` method and class [was updated for 23](https://openjdk.org/jeps/477) (more on that in a future video) to not only allow module imports, but to automatically import _java.base_ if the main class isn't explicitly defined.
That means if you just have a `main` method in the file, you need no imports to use all of `java.util`, `java.math`, `java.time`, etc.

```java
// complete Main.java; uses
//   * java.math.BigDecimal
//   * java.time.LocalDate
//   * java.util.List
//   * java.util.random.RandomGen…
//   * java.util.stream.Stream
// without explicit imports!
void main() {
	List<?> dates = Stream
		.of(1, 2, 23, 29)
		.map(BigDecimal::new)
		.map(day -> LocalDate.of(
			2024,
			RandomGenerator.getDefault().nextInt(11) + 1,
			day.intValue()))
		.toList();

	System.out.println(dates);
}
```

And if you want to experiment with, say, XML, just add `import module java.xml` - I love it!

```java
// complete Main.java
import module java.xml;

void main() {
	var xml = DatatypeFactory.newDefaultInstance();
	List<?> dates = Stream
		.of(1, 2, 23, 29)
		.map(BigDecimal::new)
		.map(day -> LocalDate.of(
			2024,
			RandomGenerator.getDefault().nextInt(11) + 1,
			day.intValue()))
		.map(d -> xml.newXMLGregorianCalendarDate(...))
		.toList();

	System.out.println(dates);
}
```

But what about module imports in production code?
I guess I'd switch to that if I'd already use star imports in such code.
I don't see why not.
If you use star-imports, I wanna know what you think you'll do - let me know in the comments.

## Module Import Details

Let's talk about a few details in the proposal.
First, as I mentioned in the intro, your code does not have to be in a module to be able to use module imports.
If it is in a module, though, the import may actually import more classes:
Say your module _bar_ requires and module-imports the module _beer_.
Then you not only import all packages _beer_ exports in general but _also_ all packages it exports explicitly to your module _bar_ with a [qualified export](https://dev.java/learn/modules/qualified-exports-opens/) if there are any.

And regardless of whether your code is in a module or not, another round of packages may be imported if _beer_ [implies readability](https://dev.java/learn/modules/implied-readability/) of _malt_ with a `requires transitive` clause, namely _malt_'s exported packages and this keeps going with more requires transitives.
That may sound like a confusing jumble of extra rules but if you know the module system basics, it's quite simple:
`import module beer` will import all packages that are exported to you via _beer_, which includes implied readability and qualified exports.
And if you don't know the module system basics, well, then I got a bri... sorry, a book to sell you.
And also some links in the description.

Importing that many packages can easily lead to ambiguities, though.
Is `List` a reference to `java.util.List` or `java.awt.List`, is `Date` a reference to `java.util.Date` or `java.sql.Date`?

```java
import module java.desktop;
import module java.sql;

void main() {
	// error: reference to Date is ambiguous
	var outdated = new Date(1997, 1, 18);

	// error: reference to List is ambiguous
	var letters = List.of("I", "J", "N");
}
```

To clarify such cases you can add a specific import for the respective type to your list of imports.

```java
import module java.desktop;
import module java.sql;

import java.util.Date;
import java.util.List;

void main() {
	// error: friends don't let friends use Date!
	var outdated = new Date(1997, 1, 18);
	var letters = List.of("I", "J", "N");
}
```

## More Modules?

When I said I wrote that book 7 years ago?
That was a bit shocking - modules are that old already, huh?
And me, too.
Wow.
Even I have to admit that adoption isn't great, but maybe this feature helps?
Module imports surely are an additional incentive for libraries and frameworks to ship modules to make their users' lives easier.
Let me know what you think.
And while you're down there, check out the links in the description, leave a like, subscribe to the channel if you haven't already, and I see you again in two weeks.
So long ...

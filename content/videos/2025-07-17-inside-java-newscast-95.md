---
title: "Java Gets a JSON API - Inside Java Newscast #95"
tags: [core-libs]
date: 2025-07-17
slug: inside-java-newscast-95
videoSlug: inside-java-newscast-95
description: "Java considers itself a \"batteries included\" language and given JSON's ubiquity as a data exchange format, that means Java needs a JSON API."
featuredImage: inside-java-newscast-95
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and tonight we're gonna talk about the JDK's path towards a JSON API.
This is based [on an email](https://mail.openjdk.org/pipermail/core-libs-dev/2025-May/145905.html) that Paul Sandoz, probably best known for being the lead of Project Babylon (woo), sent to the core-libs-dev mailing list back in May.
That means, we don't even have a JEP draft, yet, so all of this is _very_ early and this episode is more about the big picture than about details.

Ready?
Then let's dive right in.

(Boy, am I happy this take worked.)

## Start with Why

Let's start with why - why does the JDK need a JSON API?
It's decidedly _not_ because there's a lack of JSON libraries in the ecosystem.
Not only are there plenty, many of them are doing a really great job!

No, the motivation comes from the overlap of two facts:

1. JSON has become a universal and omnipresent data interchange format and
2. The JDK has a "batteries included" philosophy, which aims to provide all building blocks needed to write basic programs

Taken together, the JDK wants developers to be able to write basic programs without having to rely on third-party dependencies and nowadays that means it needs to be able to effortlessly handle JSON.

But that also means that this API is not meant to once and for all solve the JSON problem, to cover every use case, and in the process make all those existing project superfluous.
No, it aims to sit on the other end of the spectrum: be simple to use for parsing, traversing, and generating conformant JSON documents and leave more advanced features like data binding or path-based traversal to third-party libraries.
Performance should be "good enough" but will be less important than simplicity.

## Look and Feel

JSON can be described by what's called a "railroad diagram", which shows how to construct it via subtyping and composition.
Or sums and products.
Or algebraic data types.
Or data-oriented programming.
(Yes, yes, it's not all the same, but here it's close enough.)

<contentimage slug="json-value" options="bg"></contentimage>

So we need to model a "value" with possible expressions like "array", "object", and "number".
And after everything I've learned and said about data-oriented programming in recent years I would expect this to be a sealed interface with record implementations, but annoyingly it's neither.
While that approach is a perfect fit, the lack of encapsulation makes internal evolution behind a stable API tricky.
In many situations, that's no big issue but for a public JDK API it does matter.
So, to my dismay, the idea is to use interfaces with hidden implementations:
At the top, there would be `JsonValue`, extended by `JsonArray`, `JsonObject`, `JsonString`, `JsonNumber`, and so forth, each with an accessor method like `values()`, `members()`, `value()`, etc.

```java
interface JsonValue { }

interface JsonArray extends JsonValue {
	List<JsonValue> values();
}

interface JsonObject extends JsonValue {
	Map<String, JsonValue> members();
}

interface JsonString extends JsonValue {
	String value();
}

interface JsonNumber extends JsonValue {
	Number toNumber();
}
```

To get instances of these classes you could call a `parse` method with a JSON string that then returns a `JsonValue`.
Alternatively, static factory methods can create them from the Java type they contain, for example a `JsonArray` from a `List`, a `JsonObject` from a `Map`, or a `JsonString` from a, you guessed it, `String`.

```java
JsonValue doc = Json.parse("""
	{
		"name": "John Doe",
		"age": 30
	}
	""");
/* {+} */
JsonObject obj = JsonObject.of(Map.of(
	"name", JsonString.of("John Doe"),
	"age", JsonNumber.of(30)
));
```

Either way, once you have JSON values in hand, the only two mechanisms to interact with them are type checks and accessors, both presumably as part of pattern matching.
Paul gives an example for how this API can be used to safely traverse a JSON document.
Given a simple JSON object, we may want to ask whether it has "name" and "age" properties and whether the age fits into an `int` and, if so, extract said properties into `String name` and `int age` variables.
Because the JSON types are interfaces and not records and maps and lists don't interact with patterns, yet, the condition that verifies all that is a bit bulky at the moment, but once we get deconstruction patterns, it shrinks down to:

```java
var doc = Json.parse(inputString);
if (doc instanceof JsonObject(var members)
    && members.get("name")
		instanceof JsonString(String name)
    && members.get("age")
		instanceof JsonNumber(int age)) {


	// use "name" and "age" 😁

}
```

If the `Json.parse(document) instanceof JsonObject(var members)` and `members.get("name") instanceof JsonString(var name)` and `members.get("age") instanceof JsonNumber(int age)`, then we're happy and can use `name` and `age`.

Paul writes:

> So, over time, as more pattern matching features are introduced we anticipate improved use of the API.
> This is a primary reason why the API is so minimal.
> Convenience methods we add today, such as a method that accesses a JSON object component as, say, a JSON string or throws an exception, will become redundant in the future.

An example of that can be seen in the way the API handles numbers.
The JSON specification makes no explicit distinction between integral and decimal numbers, nor specifies limits on the size of those numbers, which means Java code does not generally know what Java type best fits a JSON number's string representation.
This API deals with that by making `JsonNumber` parse to the Java `Number` subtype that best fits the string and then letting the user apply pattern matching to limit what types she's willing to process.

That indeed makes this API _very_ minimal to the point where it hardly has any API.
And that doesn't come without criticism.

(Apparently, night's over.)

## Current State and Next Steps

The reason why Paul wrote this email is that Project Babylon developed a variant of this API for its internal experiments - unrelated to JSON but, yeah, it _is_ omnipresent.
So they've been working with this for a while and Paul describes it as a "pleasure", they "were able to quickly write code to ingest and convert" and "the out-of-box experience has so far been positive".

The prototype implementation is located in the JDK sandbox repository under the `json` branch, [which I link in the description](https://github.com/openjdk/jdk-sandbox/tree/json/src/java.base/share/classes/java/util/json) together with the [just as prototypical Javadoc](https://cr.openjdk.org/~naoto/json/javadoc/api/java.base/java/util/json/package-summary.html).
It passes all applicable conformance tests of the unofficial but well-established JSONTestSuite and performance is good when compared to other JSON implementations even though not a lot of optimizations have taken place yet.

So all good?
JDK Enhancement Proposal, when?
Not so fast!
This API has only been exposed to a few real-life use cases and as I alluded to a minute ago, not everybody is happy with the very minimal, very pattern-matching-heavy design that makes some common tasks more cumbersome than a simple method would.
That seems particularly true when it comes to behavior like "try to access this as an instance of that type or throw a helpful exception if it doesn't work", which is necessary to handle messy real-world use cases.
And it's not like Java's future pattern-matching features are all already settled, so that adds some uncertainty to this design, too.
I think it's safe to say that this will brew a little longer before it turns into a JEP, which might be a new one or an update of [JEP 198](https://openjdk.org/jeps/198), by the way.
But once that happens, we'll of course cover it here.

I'll see you then or, better yet, in two weeks.
So long...

(Time to have breakfast, I guess.)

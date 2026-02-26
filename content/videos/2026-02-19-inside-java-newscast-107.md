---
title: "Towards Better Checked Exceptions - Inside Java Newscast #107"
tags: [java-next]
date: 2026-02-19
slug: inside-java-newscast-107
videoSlug: inside-java-newscast-107
description: "Java's checked exceptions are both an integral part of the language and one of its most contested features. Let's talk about specific issues with checked exceptions and what could be done about them."
featuredImage: inside-java-newscast-107
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're going to talk about exceptions and what better place to do that than a German train station.
So why discuss exceptions and particularly checked exceptions now?
Unlike most other episodes, this one is _not_ triggered by a specific proposal.
It's kind of the other way around:
With Java evolving a lot in recent and coming years, it may well address error handling at some point.
But for that conversation to be fruitful, we must move beyond "checked exceptions bad, turn off please" and there are two parts to that:

First, understanding that, within the solution space for error handling in Java, checked exceptions are a net positive.
Yes, I like checked exceptions and, more than that, I think it's not just subjective preference but due to objective benefits.
But I won't be making that argument here.
It has been made countless times before with just as many counterarguments and it takes up a lot of time and energy without getting us anywhere.
Instead, we'll be operating from the position that checked exceptions remain an integral part of Java.
Because they're beneficial or otherwise because Brian Goetz enjoys our suffering - either way, they're here to stay.

Which brings us to the second part and the conversation I actually want to have, one that I believe would be much more fruitful.
Namely, if checked exceptions are so great, why do so many developers dislike them?
I mean, even the JDK devs were at some point so flustered that they created `UncheckedIOExcpetion`.
So what are sharp edges and which ones could OpenJDK realistically file off?
Let's talk about actionable steps instead of just repeating the same flame war.
And this also goes for the comments, by the way.

Ok, with what may well have been the longest Newscast intro ever behind us, let's get going.
Ready?
Then let's dive right in!


## Inherited Checkedness

As you know, whether an exception is checked or not depends on where it sits in the exception type hierarchy:
If it extends `RuntimeException`, it's unchecked; if it doesn't, it's checked.
(And, yes, we'll ignore `Error`s.)
Unfortunately, determining this essential property via inheritance collides with other reasons to build a type hierarchy, in this case particularly with unified error handling and access to information.

A good example is `SQLException`:
Catching it allows handling all SQL-related problems that code can be expected to encounter and it gives unified access to error codes and the SQL state.
But because it's checked, so are all exceptions that extend it and there are a bunch of them that really shouldn't be.
For example, what's the recourse when catching `SQLSyntaxErrorException` or `SQLInvalidAuthorizationSpecException`?
In almost all situations, an SQL syntax error or invalid DB authentication is a bug in the program and so the exception should be unchecked.

So when creating an exception type as the root for a domain-specific exception hierarchy, you need to decide for all inheriting exceptions whether they'll be checked or not and if you believe in the value of checked exceptions, like OpenJDK does, then you're very likely to err on the side of making them all checked instead of all unchecked.
All that to say, it would be great if Java would find a more detailed way to mark exceptions as checked or unchecked; one that allows us to apply that to individual types in a larger hierarchy, for example through a marker interface.


## Too Many Checked Exceptions

Because here's the thing:
That checked exceptions provide value doesn't mean that they don't have downsides, which means it's important to use them diligently and only where it makes sense for the code calling a method to handle its error.
Inherited checkedness is one reason why there are too many checked exceptions, but it's not the only one.

Another is just overly liberal use of them.
Take `InputStream`'s and `OutputStream`'s `close` methods, for example.
They throw the checked `IOException` but what can you possibly do when catching them?

```java
// just a demo (not a particularly useful method)
void closeTheStream(ByteArrayInputStream stream) {
	try {
		stream.close();
	} catch (IOException ex) {
		// What could I possibly do? Close again?
		// Also, the Javadoc says:
		// "Closing a ByteArrayInputStream has no effect."
	}
}
```

Worse, these two classes and a bunch of their subclasses state that `close` doesn't even do anything, so they force you to deal with an exception they never throw because some subtype might.
No wonder, so many of us dislike checked exceptions!

Suboptimal API design can also lead to checked exceptions being more prominent than they need to be.
APIs sometimes bundle functionality where only one part throws a checked exception but without a way to isolate that aspect, _every_ call requires dealing with this exception.

Take JDK methods like `String::getBytes`, for example:
It needs a character set and in the method's initial form, you'd specify the charset by name.
But what if no such charset exists?
That's why `getBytes` throws the checked `UnsupportedEncodingException`.

```java
// throws `UnsupportedEncodingException`
// (particularly annoying: we *know* UTF-8 exists!)
var bytes = "String".getBytes("UTF-8");
```

So even if the named charset worked well for the other 10 places in your code base, you still need to handle the checked exception here.
Ugh!
Java 6 fixed this by introducing an overload that takes a `Charset` instance.

```java
// no exception is thrown
Charset utf8 = // ...
var bytes = "String".getBytes(utf8);
```

But, interestingly, the static factory method `Charset::forName` doesn't throw a checked exception.
Passing it an illegal name is considered a programming error because there's also the static method `isSupported`, which you're supposed to use before trying to instantiate a charset.

```java
if (Charset.isSupported("UTF-8")) {
	// declares no checked exception
	var utf8 = Charset.forName("UTF-8");
	// use `utf8`
}
```

That successfully decreases the checked exception counter by one but the longer I think about it, the less convinced I am that it really improves anything.
But that's a thought that needs more time to marinate - maybe fodder for another video.

For now, let's summarize a few things libraries, the JDK as well as others in the ecosystem, can do to improve the situation:

* They can revisit which exceptions need to be checked and consider splitting exception types if necessary.
* They may also be able to restructure APIs so that operations that throw checked exception are extracted from those that don't, giving users the chance to isolate error handling in fewer places - just like with the charset example.
* It may also be possible to buffer error states instead of throwing on every call.
  An example for this would be `PrintStream` and `PrintWriter`, although these classes have other issues.


## Catching Unthrown Exceptions

Unfortunately, there's a problem with changing an API to no longer throw a checked exception, namely that such a change is source-incompatible.
A try-catch block that catches a specific checked exception demands that something in the `try` block declares to throw it, which makes the reduction of checked exceptions daunting, specifically for JDK APIs.

```java
try {
	IO.println("Hello, exceptions!");
// "error: exception IOException is never thrown
//  in body of corresponding try statement"
} catch (IOException ex) {
	// ...
}
```

And it's not like removing a handful of them would move the needle - for this to have a positive impact a decent chunk of checked exceptions would have to turn out to be unnecessary and removed, each of them a breaking change.
So it would be really helpful for this approach if the compiler could relax a bit and let us compile code that catches checked exceptions that aren't thrown.
This has its own downsides, of course, so it requires careful consideration.

But it would also help with another aspect that makes checked exceptions annoying.
As soon as you invoke a method that throws, you need to do _something_ to keep the code compiling.
So far so, begrudgingly, good but then, when you're still in the middle of working on that piece of code and comment out a method or move things around and nothing throws the exception anymore, you need to undo all that.
So checked exceptions constantly yell at you from the rafters while you're trying to line up your shot.
Very annoying!


## Functional Error Handling and Deferred Computation

This segment might as well be called "Just use `Either`" and while that _can_ help, I'd argue that the utility of this advice is pretty limited.
This video is already running long, so I'm not introducing how `Either` works - if you don't know, there's a link to an explanation in the description ([#1](https://medium.com/@samuelavike/either-monads-in-java-elegant-error-handling-for-the-modern-developer-423bbf7300e6), [#2](https://jherrlin.github.io/posts/error-handling-with-either/)), right below the like button.

First of all, let's observe that a method that returns a value but can throw a checked exception is functionally the same as a method that returns something like an `Either` of that value or that exception.

```java
String readString(Path path) throws IOException;
Either<IOException, String> readString(Path path);
```

But handling an `Either` vs an exception is of course different and there are two downsides that, in my opinion, make `Either` a niche solution in Java.

* One is that exceptions are much easier to pass up the call stack if you don't want to handle them right there.
  Just call a bunch of methods and add their exceptions to your `throws` clause.
  With `Either` all those calls need to happen in a functional pipeline and while I like those more than most, I absolutely don't want all my code to be stuck in them.

```java
// chain calls of these two methods
String readString(Path path) throws IOException;
Statement prepareStatement(String sql) throws SQLException;

Statement readPreparedStatement(Path path) throws IOException, SQLException {
	var fileContent = readString(path);
	return prepareStatement(fileContent);
}

// chain calls of these two methods
Either<IOException, String> readString(Path path);
Either<SQLException, Statement> prepareStatement(String sql);

// ① requires functional pipeline
​// ② specific exception types disappear
Either<Exception, Statement> readPreparedStatement(Path path) {
	return readString(path)
		// if the either was "left", this does nothing;
		// if the either was "right", it executes the lambda:
		//  - if that succeeds, it returns the result as "right"
		//  - if that fails, it returns the exception as "left"
		// conceptually: "either IOException, SQLException, or a statement"
		.flatMapRight(sql -> prepareStatement(sql))
}
```

* The other, and much more relevant, downside is that `Either` moves the type information from `throws` into a generic type and, frankly, that sucks.
  Because it means that when you chain operations that can throw different kinds of exceptions, say the first an `IOException` and the second an `SQLException`, the `Either`'s generic type will quickly escalate to just `Exception`, which removes a lot of information from the type system.
  In most situations, this is _not_ an improvement.

But that doesn't mean that there's _no_ room for `Either`, either.
Checked exceptions build on an implicit assumption of immediacy.
An operation can throw an exception and because you're calling the operation, you need to handle the exception.
But what if you're not calling the operation or at least not directly?

In a stream pipeline, for example, you're passing the operation on and something else executes it later on your behalf.

```java
Stream<String> fileContents(List<Path> paths) {
	return paths.stream()
		// won't compile because `readString`
		// throws `IOException`, but note that
		// it doesn't get executed yet
		.map(Files::readString)
}

// elsewhere...
List<Path> paths = // ...
// `toList` executes the stream pipeline, so if
// `readString` throws any exception it surfaces here
List<String> contents = fileContents(paths).toList();
```

Now the fact that your operation can produce an error needs to be transported from where you passed it to where you trigger the execution, for example from a `Stream::map` to its `toList`.
You could try to capture the exception types with generics but you'll run into the same issue I described earlier.

```java
Stream<String, IOException> fileContents(List<Path> paths) {
	return paths.stream()
		// in this hypothetical API, this would compile and
		// the resulting stream carries the exception type
		.map(Files::readString)
}

// elsewhere...
List<Path> paths = // ...
// `toList` throws the carried exception (here: `IOException`)
try {
	List<String> contents = fileContents(paths).toList();
} catch (IOException ex) {
	// ...
}
```

And the difficulty or sometimes outright impossibility of transporting the error information is why checked exceptions and deferred computation don't work well together.

<admonition type="note">

This often comes up as "lambdas don't work with checked exceptions" but that's mostly missing the point.
Ping me in the comments if you want me to go into more details on that.

</admonition>

So checked exceptions struggle with transporting type information from registering to executing a deferred operation.
You know what doesn't?
`Either`.
Which is why, despite its shortcomings, it's very handy in specific situations like in a stream pipeline.

```java
// use `Either`-returning method for stream pipeline
Either<IOException, String> readString(Path path);

Stream<Either<IOException, String>> fileContents(
		List<Path> paths) {
	return paths.stream()
		.map(path -> readString(path))
}

// elsewhere...
List<Path> paths = // ...
List<String> contents = fileContents(paths)
	// example for processing the stream of
	// `Either<IOException, String>`;
	// here: remove/ignore all error cases
	.filter(Either::isRight)
	.map(Either::getRight)
	.toList();
```

And I think there are two Java features that could improve this overall problem complex.
Admittedly, they are entirely speculative, but hear me out.

* One could be the ability of the Java compiler to track multiple checkedexception types in a single generic parameter.
  That way an `Either` or a beefed up `Stream` could easily collect multiple checked exceptions.
  The language nerd terminology for this would be _variadic generics_ or _union types_, two different approaches that could achieve similar outcomes for our use case.
* The other feature could be a simple way to go from a method that returns and throws to an `Either` of both and back.
  Then APIs could stick to declaring return types and checked exceptions but their users could easily switch to a form that works better for deferred computation.
  This could be a pure library feature but it could also have a language component where `try` turns into an expression that returns an `Either`.

```java
String readString(Path path) throws IOException;
Statement prepareStatement(String sql) throws SQLException;

List<Path> paths = // ...
// if Stream<T, EX> could track multple exception types:
Stream<Statement, IOException | SQLException> = paths.stream()
	.map(path -> readString(path))
	.map(sql -> prepareStatement(sql))

// if it were easy to switch to `Either` (say with `try`):
Stream<Either<IOException | SQLException, Statement> = paths.stream()
	.map(path -> try readString(path))
	.map(sql -> sql.flatMapRight(s -> try prepareStatement(s)));
```

One language change in this space that deserves a mention and does have a JEP draft is for `switch` to gain the ability to handle exceptions that were thrown by the selector expression.
In situations where the error case can be corrected to yield an instance of the same type as the successful branches, this would be very useful.
It's essentially `try`-as-an-expression for recoverable cases.
[The draft](https://openjdk.org/jeps/8323658) is also linked in the description.

```java
String readString(Path path) throws IOException;

// if `switch` could catch exceptions
String sql = switch (readPath(path)) {
	case String s -> s;
	// map the error case to the empty string
	catch IOException _ -> "";
}
```

## Stylistic Changes

Beyond the changes that could be applied to the language or to libraries, I think our style can change as well.

For example, it has long been accepted that tests just throw whatever exception they encounter.
If we write scripts or other small programs, we can just do the same.

For those of us who don't mind functional APIs, we can aggressively replace checked exceptions with `Either`, `Try`, or even just `Optional`.
And in situations where nothing can be done about an erro except letting a high-level handler catch it, wrapping a checked exception in an unchecked one is correct and easy to do, too.
For any of those options, it's straightforward to create helper methods that wrap method calls accordingly.
Yeah, it's not as low effort as a "make everything unchecked" switch but it's also not exactly burdensome.

Or, as we move towards more APIs that rely on pattern matching, we can express some error cases through domain-specific types.
Either way, teams absolutely should get together and create a style guide for their project that matches their domain and preference.

But, in the end, I think none of these variants nor the failure mechanisms of other languages, by the way, will be easy to work with if you want to do more than just let errors rip.
Because good error handling is hard - inherently.
Of course different mechanisms have different tradeoffs and I genuinely believe that some can, in aggregate, be better than others, but that doesn't change the fact that a big chunk of the complexity is essential.
An example is the general difficulty to communicate information across stack frames and abstractions (something that plagues logging, too, by the way).

An unfortunate consequence of that is that there is no Pareto principle at play where a few small or easy improvements will yield large results and anybody claiming that probably has not thought about the problem for very long.
Instead, it seems that a lot of hard work is required to move the needle.
So let's talk about and tackle that hard work.
Let me know in the comments what changes you think would make checked exceptions more usable.

Other than that, I'll see you again in two weeks.
I need to hurry up and wait to catch my train.
So long ...

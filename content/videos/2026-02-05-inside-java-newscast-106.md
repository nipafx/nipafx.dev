---
title: "LazyConstants in JDK 26 - Inside Java Newscast #106"
tags: [java-26, core-libs]
date: 2026-02-05
slug: inside-java-newscast-106
videoSlug: inside-java-newscast-106
description: "Lazily initializing fields in Java is error-prone and undermines constant-folding. JDK 26 comes with JEP 526, which previews `LazyConstant`, a type that lazily initializes a value through a given `Supplier`."
featuredImage: inside-java-newscast-106
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're going to deep-dive into lazy constants, a preview feature in [JDK 26](https://jdk.java.net/26/).
You may already know them as stable values, a preview in 25, which changed not only its name but also its API quite a bit.
In fact, this evolution tells us a lot about how OpenJDK develops features from low-level mechanism to higher-level concepts, something I will discuss towards the end of the video.
But before that, we'll go over the relevance and challenges of laziness and the `LazyConstant` and lazy collection APIs.
Ready?
Then let's dive right in!


## Laziness

When we talk about laziness in programming, we don't only mean programmers slacking off while our [code is compiling](https://xkcd.com/303/) or our [Claude is clobbering our code base](https://xkcd.com/1838/).
It also means to defer computation.
Generally speaking, we're more interested in being lazy, in deferring a computation

* the longer it takes
* the better we can do it with more information
* the higher the likelihood that we can get away without needing it at all

In the Java runtime, many processes are lazy, just to name two examples:

* Java only loads and initializes classes when the code that is currently executing first references them
* it only clears out garbage and frees up memory when empty memory is needed

Our code is also often lazy, usually in ways that are almost too obvious to notice.
Of course we don't preemptively load all users from the database or all files in the config folder - instead we wait for such actions to become necessary, usually for specific elements.
At the same time, though, our web framework does probably eagerly initialize all controllers before the first request comes in.

And it's not always clear what the right option is because, as most things in programming, laziness comes with trade-offs.
Not doing things until you definitely need them means you may produce better results or end up doing less, both of which is good.
But only doing things on demand can mean that specific demand takes longer to fulfill, which is bad.

And then there are Java-specific downsides of laziness.
Our program's infrastructure is defined by instances that usually refer to one another through fields.
Lazily initializing a part of a program thus often means lazily initializing a field and that comes with two specific challenges:

* it's more complex code that can be hard to get reliably right, particularly when concurrency is involved
* it may prevent the use of the keyword `final`, which makes code more fragile and harder to optimize because the field can be reassigned later

```java
public class UserController {

	private volatile LoginService login;

	public UserController() {
		// field `login` is lazily initialized
		// by `getLogin` instead of the
		// constructor;
		// that also means, you can never use
		// `login` directly as it may be null
	}

	// one variant to initialize lazily,
	// called "double-checked locking"
	private LoginService getLogin() {
		var login = this.login;
		if (login == null) {
			synchronized (this) {
				login = this.login;
				if (login == null)
					this.login = login =
						LoginService.initialize();
			}
		}
		return login;
	}

}
```

So, to level the playing field, Java could do with an API that makes lazy initialization easy and gives us as well as the runtime the guarantee that the value, once computed and assigned, remains constant.
Enter [JDK Enhancement Proposal 526](https://openjdk.org/jeps/526) and lazy constants.


## `LazyConstant`

JEP 526 proposes the new type `LazyConstant`.
Instead of creating a final field of type `T` and computing its value during construction, you'd declare a final field of type `LazyConstant<T>` and create it with a recipe for that computation.
To that effect, you'd call its static factory method `of` with a `Supplier<T>`.
Then, later, whenever you need the value, you just call `LazyConstant.get`.

```java
public class UserController {

	private final LazyConstant<LoginService> login;

	public UserController() {
		this.login = LazyConstant.of(LoginService::initialize);
		// using `login` later...
		IO.println(login.get());
	}

}
```

And that's the whole API.
Or at least it will be the whole API in JDK 27, but we'll get back to that later when we'll discuss its evolution.
Before that, let's take a closer look at "lazy" and "constant".

As you have no doubt inferred, the supplier you created the lazy constant with, gets executed to compute the value that `get` returns.
But at most once for the first call to `get`.
If there are multiple "first calls" concurrently, only one executes the supplier while all others wait for the result and of course all future calls to `get` just return that same result.
That takes care of the complexity of lazily initializing a field at most once, even under concurrency.

But most experienced Java developers can create a type that does that.
What sets `LazyConstant` apart is not the "lazy" aspect, it's the "constant".
Because once the value is computed, it is assigned to a field that is annotated with `@Stable`, which informs the Java runtime that it will never be reassigned; that it's _constant_.
So your reference to the lazy constant is final and its reference to the value is constant and that opens the door to an optimization called _constant folding_ where a chain of constant references can be shortened to just one load.

Unfortunately, as you may remember from Inside Java Newscast #101, reflection can change final instance fields of regular classes, so they're not actually constant - for the time being, only final static fields, record components, final instance fields in hidden classes, and now `LazyConstant` values are.
But once reflection's superpowers are guarded by a command-line option, all final fields are constant, which will considerably expand the room for this optimization.

<contentvideo slug="inside-java-newscast-101"></contentvideo>

## `LazyConstant` Behavior

Ok, rapid-fire round for a few more behavioral properties:

* `LazyConstant` is not serializable.
* `LazyConstant` rejects `null`, so don't have your supplier return that.
* If the supplier throws an exception, it will come out of `get` and if you try again later, the supplier will be called again - maybe it works better this time.
  So technically it's not "at most once" but "at most once successfully".
* If the supplier ends up calling `get` in a cycle, you're in trouble but `LazyConstant` notices and shortcuts this likely infinite loop with an `IllegalStateException`.
* If the supplier blocks indefinitely, you're in real trouble because neither the thread executing it nor any thread waiting for the result will come out of this.
  The API offers neither timeouts nor cancellations.
* `LazyConstant` really insists on the "lazy" aspect and doesn't want to compute its value when you call `equals`, so all there is left to compare is the `LazyConstant`'s identity.
  And, even if it wanted to compute values (and we'll see in a second a related case that requires that), the behavior becomes really hard to intuit real fast.
  If you want to play this out, leave a comment and we can discuss there.


## Lazy Collections

`LazyConstant` gives you a 1:1 relationship between owning class and needed value, but what if you need 1:n?
You could of course declare a `LazyConstant<List>` but then the whole list needs to be computed at once.

```java
private final LazyConstant<List<String>> list = LazyConstant.of(() -> List.of("0", "1", "2"))
```

That's probably ok in many cases, but probably less so in others.
So JEP 526 also proposes a lazy list and a lazy map, but these are not exposed in the type system.
Instead you call `List.ofLazy` and `Map.ofLazy` and get a `List` or `Map` instance, respectively, that implements the laziness under the hood.

```java
private final List<String> list = List.ofLazy(3, index -> "" + index);
private final Map<Integer, String> map = Map.ofLazy(Set.of(0, 1, 2), key -> "" + key);
```

For a lazy list, you need to provide the total size and a function that takes an index as input and produces the element at that position.
For a lazy map, you provide the key set and a function that takes a key as input and produces the associated value.
As you'd expect, the functions are executed exactly once when an element at a given index or for a given key is first needed, even under concurrent access.
Beyond this on-demand computation, these collections are unmodifiable and the runtime can apply constant-folding optimizations to code that accesses the content of lazy constants through lazy collections.

Now, for `equals`, these collections cannot be as blasé as `LazyConstant` because both `List` and `Map` demand a proper implementation and that may require the computation of some values.
Which values exactly?
All of them if two lists or maps are actually equal...

```java
var eagerList = List.of("0", "1", "2");
var lazyList = List.ofLazy(
	3,
	index -> {
		IO.println("Computing " + index);
		return "" + index;
	});

IO.println(eagerList.equals(lazyList));

/*--< OUTPUT >--*/
// Computing 0
// Computing 1
// Computing 2
// true
```

... but maybe fewer if they aren't.
I looked at the source code and could tell you what happens when, but the Javadoc doesn't specify the behavior, so it's an implementation details, which makes it a fool's errant to rely on it.
So I won't.
I'll be accepting accolades for my restraint in the comments.

## API Evolution

Let me play you a short segment from a conversation I had with John Rose, Senior Architect of the Java Virtual Machine.

> We have something called stable variables inside the JDK, which we use all over the place.
> The things became more and more useful but they were boxed inside of the JDK but that was a necessary step to have something JDK-only - friends and family we call it - until we learn how to use these things correctly and we teach the VM how to optimize them correctly.
> [Per-Ake Minborg] talked about his StableValue API, which is built on top of these stable variables, and finally we figured out #1 how to optimize them, #2 how to brush them up and make them good for polite company, so that we can put them on the street corner instead of just in our own living room.

And the evolution didn't stop there.
As John explained, the JVM has a concept of stable values, which are marked by the aforementioned `@Stable` annotation.
The first step to lifting that into an API for us were stable values in JDK 25.
Note that the name was very much based on the low-level concept and its API included the collection factory methods and had a lot of imperative functionality, too.

For JDK 26, the name changed to something more relatable for us and as the concept came into its own, it also became clear that the lazy collections are not primarily lazy but primarily collections and so their factory methods moved over there.
And as the concept became clearer, the API dropped a lot of its imperative cruft.
Not all, though.
In JDK 26,  you can still ask a `LazyConstant` whether it's initialized and you still have an `orElse` method that lets you handle the case when it isn't.
This is a distraction from the intended use case, though, and so [JDK 27 will likely drop these methods](https://openjdk.org/jeps/8376595), which is why we didn't discuss them earlier.

As lazy constants rise to a sharply defined concept, this leaves a bit of a vacuum for more low-level interaction with the `@Stable` annotation and it's likely that something will fill that.
And when it does, we'll of course cover it in an Inside Java Newscast, so subscribe if you aren't already.

I want to leave you with a few more words by John Rose, summarizing this whole process - you can watch the rest of my conversation with him by clicking here.
I'll see you again in two weeks and later this year at JavaOne.
So long ...

> That is a progression that is repeated over and over again for many features.
> First we find a pain point of something we want to do and we can't do.
> Then we do something special inside the JDK and teach the JVM about it and then eventually we make an API like virtual threads or stable values or Panama - oh my gosh Panama...

<contentvideo slug="inside-java-podcast-42"></contentvideo>

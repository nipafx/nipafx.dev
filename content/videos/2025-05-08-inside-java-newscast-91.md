---
title: "Structured Concurrency Revamp in Java 25 - Inside Java Newscast #91"
tags: [project-loom, structured-concurrency]
date: 2025-05-08
slug: inside-java-newscast-91
videoSlug: inside-java-newscast-91
description: "JDK Enhancement Proposal 505 revamps the structured concurrency API in JDK 25 by introducing a configuration and joiners."
featuredImage: inside-java-newscast-91-a
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about [JDK Enhancement Proposal 505](https://openjdk.org/jeps/505), which revamps the structured concurrency API in JDK 25.
That's the API that most Java applications will use to organize most of their concurrency and given that it leverages the utility of virtual threads, I want to hazard a guess that we'll use it more often than we use thread pools today.
Ready?
Then let's dive right in.


## Structured Concurrency

Before we get into the weeds of JEP 505, let's make sure we're all on the same page on the concept of structured concurrency.
If you're a regular viewer of this channel, this won't be news to you - feel free to skip this chapter.
Everybody else, I will only give the briefest of introductions here.
If you got an extra six minutes, check [Inside Java Newscast #17](https://www.youtube.com/watch?v=2J2tJm_iwk0), and if you're in the market for a deeper dive, there's this [excellent half-hour talk by Alan Bateman](https://www.youtube.com/watch?v=0mXGfsy7_Qo), the owner of JEP 505.

Ok, let's go!
Structured concurrency derives from a simple principle:
If a task splits into concurrent subtasks, then they all return to the same place, namely the task's code block.

So instead of committing subtasks to a thread pool over there and then passing around futures to which you add result processing and error-handling all over the place, waiting for their results who-knows-where, these subtasks are treated as a single unit of work.
A single method has the responsibility to handle the entire concurrency lifecycle of a set of related subtasks, while the task that spawned them waits for their completion.
While before, there were independent threads passing in the night, this restriction captures the natural relationship between tasks and subtasks and instills structure:
A parent thread that waits for its child threads to complete their work before it continues.

And it's this structure that brings a number of downstream benefits:

* clarity of code that always follows the same procedure:
	* set up the subtasks
	* wait for them to either complete or be cancelled
	* decide whether to succeed or fail
* error handling with short-circuiting, where a failing subtask can cancel other, ongoing subtasks
* cancellation propagation, where if a task gets canceled, so do all of its subtasks
* observability, where a thread dump clearly displays the task hierarchy

Now let's see how to actually do that in Java.


## Structured Concurrency in JDK 25

JDK 25 previews the structured concurrency API for the fifth time, with considerable changes over its previous version.
The core type remains the same, though - it's `StructuredTaskScope` and works as follows:

* you get an instance by calling the static `open` method - in JDK 24 you used to call a constructor
* you fork subtasks by passing a `Callable` or `Runnable` to the `fork` method, which runs them on a new virtual thread
* then you call `join`, which will block until... for now we'll say until all subtasks complete - unlike in JDK 24, `join` will throw all subtask-related exceptions, so no more `throwIfFailed`-method.
* finally, there's `close` but since you'll use structured task scopes in try-with-resources blocks, you won't have to explicitly call that

```java
try (var scope = StructuredTaskScope.open()) {
	var user = scope.fork(this::fetchUser);
	var order = scope.fork(this::fetchOrder);

	scope.join();

	// process results
	IO.println(user.get() + order.get());
} catch (Exception ex) {
	// error handling
}
```

The big difference between previous previews and this one is how to configure or even customize the behavior of a structured task scope:

* In JDK 24, the type `StructuredTaskScope` is a non-final class.
  It has multiple subclasses that cover most use cases but if yours isn't among them, you can create your own.
* In JDK 25, it's a sealed interface with I-don't-know-how-many implementations, but they're internal and we cannot add our own.
  Instead, we configure task scopes with a config and joiners, more on both of them in a minute.
  Where they are not powerful enough, you'd need to create your own API that wraps a task scope.

That last aspect speaks to a point the JEP makes:

> It is not a goal to create the definitive structured concurrency API for all Java programs.
> Other structured concurrency constructs can be defined by third-party libraries or in future JDK releases.

And, while you can reimplement the aforementioned short-circuiting error handling and cancellation propagation yourself, establishing parent-child thread relationships for better observability is currently out of reach for non-JDK APIs.
So our structured concurrency APIs will probably wrap a `StructuredTaskScope` and forward calls to its `fork` method.
If you end up going down that road, please let the folks on the Loom mailing list know - they're interested to learn about your use case.
But before you make that call, you should know what the configuration and joiners can do for you, so let's take a look at that next.

### Configuration

Three properties of a structured task scope can be configured:

* a name for the scope - as we'll see later, this serves monitoring purposes only
* the thread factory the scope uses to create threads for each forked subtask
* a timeout, which starts when `open` is called and, if it times out, cancels all remaining subtasks and throws an exception from `join`

These properties are defined by an instance of `StructuredTaskScope.Configuration` and the default configuration has neither name nor timeout and uses a thread factory that creates virtual threads without name.
To change the defaults, use the overload of `open` that accepts a function as an argument, which will be called with the default config to return a new config as output.

```java
try (var scope = StructuredTaskScope.open(
	/* ... */,
	cf -> cf
		.withName("weather-forecast")
		.withTimeout(Duration.ofSeconds(2))
)) {
	// ...
}
```

### Joiners

Earlier, I waffled a bit when I said that `join` will block until all subtasks complete because, generally speaking, that's not correct.
It's the task of a so-called `Joiner`...

* to react to subtask completion, be they successful or not
* to cancel the scope early if desired
* to create the exception that `join` will throw in a failure case
* to produce a result that `join` will return (where that is applicable)

And such a joiner can be passed to an overload of `open`.

```java
try (var scope = StructuredTaskScope.open(
	/* JOINER GOES HERE */,
)) {
	// ...
}
```

If the parameterless variant of `open` is called, a default joiner is used, which behaves as follows:

* it does not react to successful completion of subtasks
* it will cancel the scope if a subtask fails
* and in that case, it will throw the failed subtask's exception
* in the case of all subtasks completing successfully, no result is computed for `join` - the user is expected to get results from the subtasks themselves

```java
try (var scope = StructuredTaskScope.open() {
	var user = scope.fork(this::fetchUser);
	var order = scope.fork(this::fetchOrder);

	scope.join();

	// extract results from subtasks
	IO.println(user.get() + order.get());
} catch (FailedException ex) {
	// a subtask failed
}
```

This means that the default joiner works well for subtasks with different result types that must all complete successfully.
And now we can jiggle these requirements and see what combinations we get.
So, for example:

* All subtasks return the same type and all must succeed.
  That means a failed subtask cancels the scope but a successful scope can return a stream of these results directly from `join`.

```java
try (var scope = StructuredTaskScope.open(
	Joiner.allSuccessfulOrThrow()
)) {
	scope.fork(this::forecastA);
	scope.fork(this::forecastB);
	scope.fork(this::forecastC);

	var forecasts = scope
		.join()
		.map(Subtask::get)
		.toList();

	// use `forecasts`
} catch (FailedException ex) {
	// a subtask failed
}
```

* All subtasks return the same type but only one needs to succeed.
  That means as soon as the first subtask completes successfully, the scope is canceled and the subtask's result is returned from `join`.
  Only if all subtasks fail, will the scope itself fail as well.

```java
try (var scope = StructuredTaskScope.open(
	Joiner.anySuccessfulResultOrThrow()
)) {
	scope.fork(this::forecastA);
	scope.fork(this::forecastB);
	scope.fork(this::forecastC);

	var forecast = scope.join();

	// use `forecast`
} catch (FailedException ex) {
	// all subtasks failed
}
```

* Subtasks can return result types that are different and we want all to complete, successfully or not, before moving on.
  This joiner is very lazy and essentially does nothing.
  It's up to the user to interrogate subtasks for their state and to get results where they are available.

```java
try (var scope = StructuredTaskScope.open(
	Joiner.awaitAll()
)) {
	var fcA = scope.fork(this::forecastA);
	var fcB = scope.fork(this::forecastB);
	var fcC = scope.fork(this::forecastC);

	scope.join();

	// interrogate subtasks, e.g.
	var resultA = switch (fcA.state()) {
		case FAILED ->
			fcA.exception().getMessage();
		case SUCCESS ->
			fcA.get().toString();
		case UNAVAILABLE ->
			throw new IllegalStateException();
	};
}
// no `FailedException` will be thrown
```

And, wouldn't you know it, there's a factory method for each of these cases on `Joiner` (plus one that I spared you here), so you don't have to implement these yourself.
If you want to, though, it's not too complicated - `Joiner` has only the three methods.
But be aware that implementations must be thread-safe as subtask completion can happen in multiple threads at the same time.
And also, joiner instances can be stateful, so back at the use site, they should absolutely not be shared between scopes.

### Odds & Ends

JEP 505 goes deeper into a number of details that I want to at least mention here:

1. `join` can throw a variety of exceptions, depending on whether the scope is misused, has failed, timed out, or was cancelled.
2. About misuse:
   The API insists on the restrictions of structured concurrency and will throw if it detects misuse, for example when code exits the scope without having called `join` or when `join` is invoked by the wrong thread.
3. Cancellation is propagated via thread interrupts, meaning primarily as `InterruptedException`s during blocking calls, both up and down the tree of nested structured task scopes.
   Cancelled scopes will always cancel all remaining subtasks and a cancelled subtask may cancel the scope that owns it, depending on what the joiner decides.
4. Both structured concurrency and scoped values lean on nested scopes in a way that aligns perfectly and so subtasks automatically inherit a task's scoped values.
   If that sentence didn't make too much sense, check [Inside Java Newscast #86](https://www.youtube.com/watch?v=7tfUJLUbZiM).
   Oh, and JEP 506 proposes to finalize scoped values in JDK 25.
5. `jcmd` can print a thread dump, which comes as a tree of nested scopes and includes the scope and thread names.
   This is a huge improvement in understanding a concurrent application's state.
6. Last but not least, JEP 505 is currently proposed to target JDK 25 and I'm very optimistic that it will be targeted and integrated soon.
   If you cannot wait that long, try the Project Loom early access build, which has had this API for quite a while now - link in the description.

I'll see you again in two weeks.
So long...

---
title: "Scoped Values in Java 24 - Inside Java Newscast #86"
tags: [java-24, project-loom, structured-concurrency]
date: 2025-02-27
slug: inside-java-newscast-86
videoSlug: inside-java-newscast-86
description: "Scoped values enable a method to share immutable data both with its callees within a thread and with child threads in a convenient, safe, scalable way, particular in comparison to thread-local variables."
featuredImage: inside-java-newscast-86
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna look into scoped values, a convenient, safe, and scalable way to manage thread-local data.

Ready?
Then let's dive right in.

## Passing Data

All non-trivial methods have data as input.
Most commonly these are method arguments or instance fields, but there are exceptions where a method draws from static fields from its own class or even from another class.

(_Gasp!_
Really, no one else gasped?)

Yes, yes, such package-local or even global state is a huge red flag, but you know how it is, you can't make an omelette without... red flags?
I feel like the metaphors got away from me here...

Anyways, sometimes a method needs data that, for some reason or another, can't be passed as an argument or consigned to an instance field.
You may be writing a framework where control passes from your code to user code and back to you but you don't want to burden users with passing along arguments that are useless to them or have security implications.
Or maybe you're using something that isn't thread-safe but highly mutable like a graphics context.
Or maybe you need to keep track of thread-specific context information, for example a request ID for logging or a transaction ID to flatten nested transactions.
None of these use cases are terribly common in our code, which is why we don't often do this, but it's also not unheard of, which is why Java has a solution for this.
Now two, actually.
Let's discuss the new one first and then I'll contrast it with the old solution and explain why a new one was needed.

## Scoped Values

JDK 24 previews scoped values for the fourth time.
Let me quote from JEP 487:

> A _scoped value_ is a container object that allows a data value to be safely and efficiently shared by a method with its direct and indirect callees within the same thread, and with child threads, without resorting to method parameters.
> It is a variable of type `ScopedValue`.
> It is typically declared as a `static final` field, and its accessibility is set to `private` so that it cannot be directly accessed by code in other classes.

On that last one, I want to add that `private` should be your default but package or even global visibility isn't unheard of.

(_Gasp!_
Oh, come on!
That was gasp-worthy, there's something wrong with you people.)

Ok, so what do you do with a scoped value except declaring it?
In order to use it, you have to _bind_ it to some data and then pass a lambda that will be immediately executed.
The lambda and all code called from it will be able to access the data by calling `get()` but once it ran its course, the data will be cleaned up and no other code can access it.

```java
static final ScopedValue<Integer> ANSWER =
	ScopedValue.newInstance();

void main() throws Exception {
	ScopedValue
		.where(ANSWER, 42)
		// prints "42"
		.run(() -> IO.println(ANSWER.get()));

	// ~> NoSuchElementException
	ANSWER.get();
}
```

That means the data (the value) is only accessible within the scope of the lambda - hence the name `ScopedValue` - which makes the code easy to reason about.

```java
static final ScopedValue<Integer> ANSWER =
	ScopedValue.newInstance();

void main() throws Exception {
	ScopedValue //      ⬐ VALUE
		.where(ANSWER, 42)
		//  |<---------- SCOPE ----------->|
		.run(() -> IO.println(ANSWER.get()));

	// OUT OF SCOPE
	ANSWER.get();
}
```


## Immutability and Nesting

Leaning further into ease of use, scoped values also prohibit _setting_ new data, so the called code cannot set something that the calling code can later read - data transmission is one-way from caller to callee.
That said, code can _rebind_ the scoped value for its callees.
This may sound confusing, but it's actually pretty straightforward, just think of nested scopes:

* method _A_ binds 42 and then calls method _B_
* _B_ can then get 42 from the scoped value, rebind it to, say, 43, and then call method _C_
* when _C_ calls `get` it reads 43 - no way to see 42 and also no way to write anything to the scoped value that the outer scope, that _B_ can observe
* when control flow eventually returns from _C_ to _B_, it in turn only sees 42

<contentimage slug="scoped-values-russian-dolls"></contentimage>

```java
static final ScopedValue<Integer> ANSWER = ScopedValue.newInstance();

void a() {
	ScopedValue
		.where(ANSWER, 42)
		.run(this::b);
}

void b() {
	// prints "42"
	IO.println(ANSWER.get());
	ScopedValue
		.where(ANSWER, ANSWER.get() + 1)
		.run(this::c);
	// prints "42"
	IO.println(ANSWER.get());
}

void c() {
	// prints "43"
	IO.println(ANSWER.get());
}
```


## Threading and Inheritance

When execution splits into multiple threads, scopes can get easily lost.
If 42 was bound for the execution of method _X_, which kicks off method _Y_ in a separate thread and then finishes its own execution, should 42 be unbound?
Hard to say when we don't know whether _Y_ is still busy and might try to read the value later.
So, by default, scoped values provide thread isolation and calling `get` from a different thread than the one that bound a value won't work.

```java
	ScopedValue
		.where(ANSWER, 42)
		.run(this::x);
//	               │
//	               ↓
	new Thread(this::y).start();
//	               │ │
//	scope x ends <─┘ │
//	 └> unbind 42!   │
//	                 ↓
//     ~> NoSuchElementException
	           ANSWER.get();//💥
//	(even if x is still running)
```

But there's an exception to this scoping issue and that's the structured concurrency API.
It also hinges on scopes, namely that when a task splits into concurrent subtasks / threads, their completion is awaited and their results are collected in the same scope while the parent thread waits.
Or, in other words, the child threads' scopes are entirely contained in the parent thread's scope.

```java
	                                     //      ⋮
	                    // parent thread's scope ┤
try (var scope = new StructuredTaskScope //      │
		.ShutdownOnFailure()) {         //      │
	                // child threads' scope ──┐  │
	// fork subtasks                          │  │
	var task1 = scope.fork(this::task);  //   │  │
	var task2 = scope.fork(this::task);  //   │  │
	var task3 = scope.fork(this::task);  //   │  │
	                                     //   │  │
	// wait for completion               //   │  │
	scope.join().throwIfFailed();        //   │  │
	                                     // ──┘  │
	// collect results                   //      │
	var result = task1.get()             //      │
		+ task2.get()                    //      │
		+ task3.get();                   //      │
	IO.println(result);                  //      │
} catch (Exception ex) {                 //      │
	// handle errors                     //      │
	throw new RuntimeException(ex);      //      │
}                                        //      │
                                         //      ⋮
```

And that's perfect!
It means that all scoped values the parent thread has access to can be inherited to the child threads and indeed that's exactly how scoped values and the structured concurrency API interoperate.

```java
ScopedValue.where(ANSWER, 42).run(() -> {
	try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
		// fork subtasks: CAN READ `ANSWER`
		var task1 = scope.fork(ANSWER::get);
		var task2 = scope.fork(ANSWER::get);
		var task3 = scope.fork(ANSWER::get);

		// wait for completion
		scope.join().throwIfFailed();

		// collect results: 3*42
		var result = task1.get()
			+ task2.get()
			+ task3.get();
		IO.println(result);
	} catch (Exception ex) {
		// handle errors
		throw new RuntimeException(ex);
	}
}
```

So, TL;DR:

* in general, data in a scoped value is only accessible from the thread which bound it
* but, if the structured concurrency API is used, the data is automatically inherited to the threads it forks

## vs Thread Locals

If you have ever used `ThreadLocal`s, much of this will seem familiar to you.
They, too, allow transmitting data without passing arguments and they, too, provide thread isolation.
In fact, at first glance, their use seems very similar:

1. create a `ThreadLocal` variable that is usually private, static, and final
2. then set data
3. execute code that can get that data
4. and make use of the fact that data is isolated per thread

```java
static final ThreadLocal<Integer> ANSWER = new ThreadLocal<>();

void main() {
	ANSWER.set(42);

	// prints "42"
	IO.println(ANSWER.get());

	new Thread(() -> {
		// prints "null"
		IO.println(ANSWER.get());
	}).start();
}
```

Beyond these similarities, there are a number of crucial differences, though:

1. All code with access to the `ThreadLocal` can both read and write data, which allows for complex data flow between callers and callees.
   To keep code readable, that's best avoided, though, and indeed this isn't frequently used - yet, when reading `ThreadLocal` code, you can never be sure and need to check carefully.
   Scoped values make this much easier as there's no question to whether data flows both ways - no, it can't.

```java
static final ThreadLocal<Integer> ANSWER = new ThreadLocal<>();

void main() throws Exception {
	ANSWER.set(42);
	// prints "42"
	IO.println(ANSWER.get());

	doTask();

	// prints "63"
	IO.println(ANSWER.get());
}

void doTask() {
	ANSWER.set(63);
}
```

2. My earlier explanation of `ThreadLocal`'s API flow left out an essential step: removing the data when it is no longer needed.
   In fact, developers using this API also occasionally forget it, which can lead to performance and security issues as data can then be visible to entirely unrelated code that happens to run on the same thread.
   And when not forgetting removal, sufficiently complex use of thread local's API can just make it really hard to get right.
   None of this is an issue with scoped values as the clearly defined scope allows the API to automatically remove the data when it's no longer needed.

```java
static final ThreadLocal<Integer> ANSWER = new ThreadLocal<>();

void main() throws Exception {
	ANSWER.set(42);

	// prints "42"
	IO.println(ANSWER.get());

	// remove data
	ANSWER.remove();

	// prints "null"
	IO.println(ANSWER.get());
}
```

3. As the name suggests, thread locals isolate data per thread, but, if you want to, you can also use them to pass data from one thread to another by using an instance of `InheritableThreadLocal` instead.
   Then, if one thread launches another, the thread-local variable is copied and the new thread starts by reading the same data.
   But if a thread launches a lot of threads like this, these copies pile up and can consume a sizeable amount of memory.
   Scoped values' one-way data transmission makes copies unnecessary, so they scale really well with lots and lots of threads.

```java
static final ThreadLocal<String> QUESTION = new ThreadLocal<>();
static final ThreadLocal<Integer> ANSWER = new InheritableThreadLocal<>();

void main() throws Exception {
	QUESTION.set("???");
	ANSWER.set(42);

	new Thread(() -> {
		// prints "null"
		IO.println(QUESTION.get());
		// prints "42"
		IO.println(ANSWER.get());
	}).start();
}
```

And it was mainly that last point that triggered the development of the scoped values API because virtual threads allow orders of magnitude more threads and so thread locals' memory issue becomes more pressing.
But note that virtual threads and thread locals do work together correctly, so it's not like you _need_ to refactor from thread locals to scoped values.
You may want to for readability, though.
In fact, scoped values should be your default for this kind of use case.
Only use `ThreadLocal` for the dirty cases: when you really need two-way data transmission or unscoped life-time for your global state.

(_Gasp!_
Oh, great gasp, everyone.
Bravo!)

## Finalization

The structured concurrency and scoped value APIs are both in their fourth preview in JDK 24.
Structured concurrency will probably see a slight revamp and another preview in 25, but scoped values seem to be stable and they may finalize.
We'll find out more about that once Java 24 gets released in two and a half weeks at JavaOne - something we'll live stream on this channel, by the way; link to more details in the description.
Following that, OpenJDK will turn towards 25 and I expect new JEPs to be filed soon after.
As always, you'll learn all about that here, so subscribe if you haven't already and leave a like to help us spread the word.
So long ...

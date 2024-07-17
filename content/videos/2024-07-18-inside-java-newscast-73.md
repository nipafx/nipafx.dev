---
title: "Integrity by Default - Inside Java Newscast #73"
tags: [j_ms, performance, reflection]
date: 2024-07-18
slug: inside-java-newscast-73
videoSlug: inside-java-newscast-73
description: "Integrity is a cornerstone of the Java Platform as it enables/bolsters reliability, maintainability, security, and performance, but there are operations that undermine it. Now, Java wants to lock them down by default."
featuredImage: inside-java-newscast-73
---

Correctness, security, performance, maintainability - to varying degrees these all depend on one fundamental property of the Java Platform: integrity.
But, maybe because it is so fundamental, it doesn't get discussed very often, at least not directly.
But whenever we talk about encapsulation of internals, about command-line flags for agents, about `Unsafe`, or about the limits of certain performance optimizations, we're effectively talking about integrity.
So let's take a closer look at it as well as at Java's ongoing push in that direction.

<!-- logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about integrity by default.
Specifically, how that concept has been a goal that Java's been working towards for over a decade now, and on various avenues, but often implicitly.
Only now does[ the draft for a JDK Enhancement Proposal][jep-integrity] tie these efforts together and explain the importance of integrity by default.
Ready?
Then let's dive right in!

[jep-integrity]: https://openjdk.org/jeps/8305968

## What Even Is Integrity?

So what even is _integrity_?
(Default or not.)
In our context, it essentially means that something does what it says on the tin.
More formally, according to the JEP...

> We say that a computing construct has integrity if, and only if, its specification is complete and its implementation is correct with respect to the specification.

Those constructs can be anything, from everyday language features like array access and for loops to the classes and modules that are built on them - be they in the JDK, in our dependencies, or in our very own code bases.
The essential observation is that integrity (the completeness of specification and the correctness of implementation) composes well.
If a set of constructs has integrity, then the larger construct that is built from them has integrity, too.

Take Java arrays as an example.
Java's specification has quite a few things to say about arrays:

* their length is defined during construction
* their length never changes
* the first element has index 0
* only access within the bounds from 0 to length-1 will succeed
* and reading at an index will return the element that was last written to it (ignoring concurrency)

When put together, the specifications of all these features completely specify arrays as a feature.
And because all their implementations are correct, so is the implementation of arrays as a feature.
So the integrity of these features allows us to say that arrays in Java have integrity.

This mechanism applies just the same to other constructs in the Java Platform as well as the programs we build on it:
Type safety, well-defined initial states, the Java memory model, all its APIs, our domain logic etc. - they're either directly specified or, more often, rely on the specifications of the constructs that are used to implement them.
Likewise, their correctness hinges on correctness of their constituting constructs.

So, to rely on our programs' integrity we need to rely on the integrity of essential properties of the Java platform, which in turn often emerge from the integrity of its constructs.
And while Java generally provides that integrity, there are a few features that can nullify all guarantees.
And _integrity by default_ means that these features are off by default, that unless the person running a Java program makes a conscious choice to trade away integrity, it will be guaranteed.

So let's look at a few ways to undermine integrity and what Java has done and is doing in each of those areas.


## Deep Reflection

Encapsulation is a key ingredient when reasoning about integrity.
Say we're writing a class and one invariant is that a mutable `int` field has to be non-negative.
How do we judge whether the implementation upholds that invariant, which would imply its correctness and thus the class' integrity?

If the field is private, we only need to reason about code in the same source file and can then lean on `private`'s integrity to guarantee that no other code can change that field.
If, on the other hand, Java didn't offer visibility modifiers or we couldn't rely on their integrity, we'd have to analyze all of our source code plus that of all dependencies to ensure correctness.

```java
public class Counter {

	// always non-negative
	private int count;

	// … code operating
	//   on `count`

}
```

Did you catch that?

> or we couldn't rely on their integrity

For the almost 20 years from 1998 to 2017, we actually _couldn't_ rely on the integrity of visibility modifiers.
By using the reflection API's `setAccessible`-method, all code on the class path could change any private field it wanted, thus voiding the integrity of visibility modifiers.
Oh and for good measure, that of `final`, too.

What were the consequence?
A bunch actually, most directly an increased maintenance effort when changes in internals of OpenJDK or 3rd-party libraries cause issues in the wider ecosystem - there's a link to [one example](https://issues.apache.org/jira/browse/SPARK-42369) of many in the description, where refactoring a JDK-internal class caused an issue in a community project.
Then there are some performance improvements that couldn't be made, for example because the just-in-time compiler can't treat final variables as actually final.
Security can suffer as well when a lack of encapsulation can be used to read or even write important information in critical pieces of code - I link [an example](https://www.hackthebox.com/blog/spring4shell-explained-cve-2022-22965) for this as well.

This situation became untenable and so, in 2017, JDK 9 introduced strong encapsulation, which prevents the access of module internals.
And of course all JDK code got moved into modules.
But you still had to opt in - it wasn't until JDK 16 in 2021 that strong encapsulation became the default.

So now, JDK code as well as all other code that runs in explicit modules, can by default rely on strong encapsulation and thus the integrity of visibility modifiers, for example.
But, if that's important, we can still opt out!
The command-line options `--add-exports` and `--add-opens` allow us to define targeted exceptions from this rule.


## Unsafe

Whoever named `Unsafe`, really hit the nail on the head.
This class is basically just a collection of backdoors into Java's innermost promises.
Visibility, finality, memory safety, and probably a few more could all be violated with `sun.misc.Unsafe`.
Which is why it's not surprising that it has been chipped away at for a few years now.
Step by step, new APIs that either don't undermine Java's integrity or require opt-in - more on that in a second - have replaced `Unsafe`'s functionality, which could then be deprecated and eventually removed.

The most recent example of this is [JEP 471][jep-471]:
`Unsafe`'s memory-access methods were superseded by var handles in JDK 9 and the foreign memory API in JDK 22, and so in JDK 23 they got deprecated for removal, which is currently projected to happen no sooner than 2026.

[jep-471]: https://openjdk.org/jeps/471


## Native Code

The Java native interface and the foreign function API both allow execution of native code.
There's of course nothing wrong with that in general but it's outright harrowing in the context of integrity because native code can, and this is the technical term, do whatever the duck it wants: corrupt memory, cause undefined behavior, sidestep visibility checks, change private and final fields, and so on.
That said, the technology used to launch native code has some influence on these vectors and FFM is generally more restrictive than JNI.
Furthermore, FFM classifies its integrity-undermining methods as _restricted_ and requires the command-line option `--enable-native-access` to execute them.

And now, JNI is herded along the same path.
[JEP 472][jep-472], which is currently proposed to target JDK 24, wants to make the loading and linking steps in JNI trigger a warning by default, which can be prevented by that same `--enable-native-access` option.
In the long run, it wants those operations to throw exceptions if the option is absent.
At that point, we can be sure that a Java program's integrity isn't violated by native code as long as that option is absent.

[jep-472]: https://openjdk.org/jeps/472


## Agents

Agents are a class of Java components that are attached to a running application and use Java's instrumentation API to read and potentially modify the application's bytecode.
It should be immediately obvious how this does not gel well with integrity.
An agent could, for example, make the `int` field that we earlier wanted to be non-negative `public` and thus void the class' integrity.
Or it could just change the constructor's code to set the field to -1, or something.

```java
// source-code equivalent
// of the byte code after
// the agent changed it
public class Counter {

	// whatever 🤷
	public int count;

	public Counter() {
		count = -1;
	}
}
```

And, again, we're seeing a push to disallow this by default and require a command-line option to unlock this capability.
In this case, it was [JEP 451][jep-451], which made the JDK 21 issue a warning when an agent was dynamically loaded unless the option `-XX:+EnableDynamicAgentLoading` (I guess) was used and which proposed to turn that warning into an error at some point in the future.

[jep-451]: https://openjdk.org/jeps/451


## Integrity By Default

So, in the end, we'll get similar behavior across all operations that can undermine integrity:

* they're off by default and trying to execute them will cause an exception
* there are command-line options to enable them
* and, where applicable, these options allow us to only enable the feature for specific modules, meaning just because you unlocked, say, native access for a thoroughly verified dependency you're not automatically doing the same for all other dependencies

An important reason why this is all managed with command-line options is that the only people who can decide whether a feature is worth the loss of integrity are those running the application because they will suffer the potential fallout.
No library and no framework developer should be able to decide (and quietly!) for all their users that application integrity is worth less than whatever their project offers.
Having to tell users that they need a command-line option to make use of a project is not an accident, it's the intended effect of restricting and allowing access like this.

Consequently, if none of those command-line options are present, you can fully rely on Java's integrity.
That becomes increasingly important for the platform itself as more and more of it is written in Java instead of native code.
But it's also important for us because...

* Integrity increases the maintainability of modules as their internals can't be depended upon.
  This makes life easier for OpenJDK and 3rd party developers but also for application developers who can more readily update dependencies as those can't depend on frequently changing internal APIs.
* Integrity is a cornerstone of security as strong encapsulation allows us to isolate vulnerable code and to limit how much it can be used to escalate an attack.
* And it improves performance when optimizations can rely on invariants to actually be invariant - something Project Leyden is particularly interested in.

Even with those benefits from integrity, it's worth pointing out that an operation isn't "evil" just because it undermines it.
Reflection, native access, agents, etc. - they all have their use cases and are important parts of the Java ecosystem.
But, [remember, with great power comes great responsibility](https://www.youtube.com/watch?v=guuYU74wU70&t=70s), and so it's important to have these features off by default and then judiciously enable them exactly when needed - and that's what integrity by default provides us.

I hope I did a good job of condensing the JEP draft into this short video, but there's definitely a ton of background information, explanations, and insights that I had to skip, so if you're interested in this topic, please give it a read - the link is of course in the description.
If you think I _did_ do a good job, leave a like - that makes me happy and puts this info in front of more developers' eyes.
I'll see you again in two weeks - so long...

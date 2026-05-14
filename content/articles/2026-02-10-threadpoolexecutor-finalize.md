---
title: "Removal of ThreadPoolExecutor.finalize()"
tags: [java-27, core-libs, migration]
date: 2026-02-10
slug: threadpoolexecutor-finalize
description: "With finalization being deprecated for removal, `finalize` methods are slowly being removed"
canonicalUrl: https://inside.java/2026/02/10/quality-heads-up/
featuredImage: threadpoolexecutor-finalize
---

## Deprecation and Removal of Finalizers

Before the introduction of `try`-with-resources and the [`Cleaner` API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/Cleaner.html), classes that needed to release resources before their end of life would implement `Object.finalize()`.
The garbage collector invokes this method after an object becomes unreachable and before reclaiming its memory.
This process, known as _finalization_, has a difficult programming model that is prone to unreliable implementation, can cause security vulnerabilities, and negatively impacts performance.
It has thus been deprecated for removal in favor of the aforementioned alternatives in JDK 18, as described in [JDK Enhancement Proposal 421](https://openjdk.org/jeps/421).

Since then, the number of `finalize` implementations in the JDK has been steadily reduced.
Likewise, the Java ecosystem is required to search for and remove `finalize` implementations to prepare for the eventual removal of this mechanism.
See [JEP 421](https://openjdk.org/jeps/421) for details how to approach this.

## Removal of ThreadPoolExecutor.finalize()

[`ThreadPoolExecutor`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html) is a non-final implementation of [`ExecutorService`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html) that may be a superclass to executor services in frameworks, libraries, and applications.
Its `finalize`-method has been...

* [deprecated](https://bugs.openjdk.org/browse/JDK-8165641) in JDK 9
* [re-specified to do nothing](https://bugs.openjdk.org/browse/JDK-8190324) (thus leaving it empty) in JDK 11
* [deprecated for removal](https://bugs.openjdk.org/browse/JDK-8276447) as part of JEP 421 in JDK 18

_JDK 27 will [remove the empty method](https://bugs.openjdk.org/browse/JDK-8371856)_, which can lead to compile errors in existing code.

## Source-Incompatible Change

While `Object.finalize()` declares that it `throws Throwable`, `ThreadPoolExecutor.finalize()` does not.
That means calls to `ThreadPoolExecutor.finalize()`, either directly or by an extending class through `super.finalize()`, will now implicitly call `Object.finalize()` and thus encounter a `Throwable` when they didn't before, which is likely to result in a compile error.

_Projects encountering this situation are strongly encouraged to remove this (and other) uses of `finalize()`._

If absolutely necessary, a workaround would be to encase the invocation of `finalize()` in a `try` block.
Since this ends up calling `Object.finalize()`, which is empty, the `catch` block can likewise be empty.

---
title: "Java 8"
tags: [java-8]
date: 2017-10-23
slug: course-java-8
description: "A 2 to 3-day course, introducing Java 8's core from lambda expressions and default methods to `Stream`, `Optional`, `CompletableFuture` and the DateTime API"
length: 2-3 days
audience: "Java developers who've either never used Java 8 or just didn't dive particularly deep yet"
requirements: "Solid Java skills; a good understanding of generics helps a lot"
searchKeywords: "java 8 course"
featuredImage: java-8
---

This course teaches everything a Java developer needs to know about the Java module system that was introduced in Java 9.
It starts with good old _JAR hell_ and _the chaos of the class path_ to motivate the module system's introduction.
After that, the basics are explained before more advanced uses are introduced.
Last but not least, the course covers migration challenges when upgrading from Java 8 (most of them caused by the module system) and how to modularize existing projects.

Every aspect is taught with theoretical introductions, practical exercises, and usage recommendations.

Optionally, we can also discuss the six-month release cadence and licensing/support of JVM distributions.

<coursedetails slug="course-java-8"></coursedetails>

## Objectives

After completing this course, participants will be able to:

* confidently use lambda expressions to handle code as data
* write more readable and maintainable code with `Stream`s
* understand the intrinsics and trade-offs of stream pipelines (e.g. regarding parallelization)
* lift `null` handling from `if`-checks and NPEs into the type system with `Optional`
* write clearer and more performant multi-threaded code with `CompletableFuture`
* use the DateTime API for safer handling of dates, times, and timezones
* understand functional programming cornerstones like function composition and immutability

## Program

* generics recap (because we use them a lot)
* functional interfaces
* lambda expressions, closures, method references
* `Stream` sources, operations, collectors, specializations, optimizations, and pitfalls
* handling `Optional` the imperative and the functional way
* function composition, immutability, side-effect free code, pure functions, Monads
* creating and composing asynchronous operations, extracting results, handling errors, timing out, forking and joining computations with `CompletableFuture`
* DateTime API as replacement for `Date` and `Calendar`
* syntax and semantics of default methods and how they're used in Java 8

<!--

## Details

We start with a generics recap because we use them a lot.

Lambda expressions:

* lambda expression syntax
* lambdas vs closures
* functional interfaces
* method references

`Stream` API:

* all important sources, operations, and collectors
* the power of reductions
* primitive specializations
* the importance of stateless operations
* internal optimizations like laziness and short-circuiting
* whether and how to parallelize
* common pitfalls

`Optional` API:

* creating and receiving `Optional`s
* handling `Optional`s the imperative way
* handling `Optional`s the functional way
* using `Optional`s in streams

Functional programming:

* function composition
* immutability
* side-effect free code and pure functions
* Monads

`CompletableFuture` API:

* creating and receiving `CompletableFuture`s
* composing operations
* extracting results
* error handling
* timing out
* forking and joining computations

DateTime API

* immutability as cornerstone
* creating and manipulating instances
* timezones and `LocalDateTime` vs `ZonedDateTime`
* interacting with `Date` and `Calendar`

Default methods:

* syntax & semantics
* default methods added in Java 8
* kinds of default methods

-->


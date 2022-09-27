---
title: "Data-Oriented Programming in Java (19)"
tags: [pattern-matching, sealed, project-amber]
date: 2022-09-27
slug: talk-java-pattern-matching
# description: "Pattern Matching is finding its way into Java, one step at a time, along three paths: patterns, switch improvements, sealed classes. Let's see how they all come together."
description: "Data-oriented programming models data as data: records for entities and sealed types for alternatives. Combined with pattern matching we can define operations on the data without overloading it with functionality."
# featuredImage: java-pattern-matching
featuredImage: java-dop
slides: https://slides.nipafx.dev/patterns
# videoSlug: pattern-matching-oracle-dev-live
---

<!--
Pattern Matching is finding its way into Java, one step at a time, along three paths:

* support for patterns
	* starting with type patterns (in Java 16)
	* next are deconstruction patterns (candidate for preview in Java 18)
* improvements of `switch`
	* making it an expression (in Java 14)
	* supporting patterns (preview in Java 17)
* sealed classes (in Java 17)

In this presentation, we'll follow these three paths to see them all come together for a happy end.
We'll also discuss when (not) to use pattern matching, so you can make the right choices from day one.
-->

In data-oriented programming (DOP), we model data as data and polymorphic behavior with pattern matching.
This talk will introduce the concept of DOP and its four principles:

* model the data, the whole data, and nothing but the data
* data is immutable
* validate at the boundary
* make illegal states unrepresentable

We'll also explore how to use pattern matching as a safe, powerful, and maintainable mechanism for ad-hoc polymorphism on such data that lets us define operations without overloading the types with functionality.
The talk ends with a juxtaposition to OOP, so you not only learn how to employ DOP but also when (not).

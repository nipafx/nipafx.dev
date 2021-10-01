---
title: "Pattern Matching in Java (17)"
tags: [pattern-matching, project-amber]
date: 2021-09-16
slug: talk-java-pattern-matching
description: "Pattern Matching is finding its way into Java, one step at a time, along three paths: patterns, switch improvements, sealed classes. Let's see how they all come together."
featuredImage: java-pattern-matching
slides: https://slides.nipafx.dev/patterns
videoSlug: pattern-matching-oracle-dev-live
---

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

---
title: "Data-Oriented Programming Version 1.1"
tags: [pattern-matching, sealed, project-amber]
date: 2022-09-27
slug: talk-java-pattern-matching
description: "Data-oriented programming models data as data: records for entities and sealed types for alternatives. Combined with pattern matching we can define operations on the data without overloading it with functionality."
featuredImage: java-dop
slides: https://slides.nipafx.dev/patterns
videoSlug: java-dop-voxxed-bucharest-2023
---

In data-oriented programming (DOP), we model data as data and polymorphic behavior with pattern matching.
This talk will introduce the concept of DOP and its four principles:

* model data immutably and transparently
* model the data, the whole data, and nothing but the data
* make illegal states unrepresentable
* separate operations from data

We'll also explore how to use pattern matching as a safe, powerful, and maintainable mechanism for ad-hoc polymorphism on such data that lets us define operations without overloading the types with functionality.
The talk ends with a juxtaposition to OOP, so you not only learn how to employ DOP but also when (not).

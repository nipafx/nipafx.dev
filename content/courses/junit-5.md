---
title: "JUnit 5"
# subtitle: Next Generation Testing on the JVM
tags: [junit-5]
date: 2018-07-30
slug: course-junit-5
description: "A 1-day course introducing JUnit 5's full feature set (including nesting, parameterization, parallelization, and more) and powerful extension mechanism, also addressing its interaction with and migration from JUnit 4"
length: 1 day
audience: "Java developers who want to improve their testing skills by adopting JUnit 5"
requirements: "Some experience in annotation-based Java test frameworks (e.g. JUnit 4 or TestNG)"
searchKeywords: "junit 5 course"
featuredImage: junit-5
---

This course teaches Java developers who are already familiar with JUnit 4, TestNG, etc. everything they need to know to use JUnit 5 to its full effect.
It starts with basic tests and advanced features for test organization, parameterization, and parallelization, before moving beyond to JUnit 5's underlying architecture and powerful extension model.
The latter is particularly interesting for larger or very domain specific test code base as it allows tailoring test execution to its needs.

Every aspect is taught with theoretical introductions, practical exercises, and usage recommendations.

<coursedetails slug="course-junit-5"></coursedetails>

## Objectives

After completing this course, participants will be able to:

* use JUnit 5's powerful feature set to write readable and maintainable test code
* create custom extensions to adapt JUnit to project-specific requirements
* write JUnit 5 tests in JUnit-4-based code bases and run them side by side

## Program

* simple tests with JUnit 5
* organizing tests by nesting them
* parameterizing and parallelizing tests
* targeting tests at different operating systems and Java versions
* configuring JUnit 5
* extending JUnit 5 to fit your requirements
* understanding JUnit 5's architecture
* running JUnit 4 and JUnit 5 tests side by side
* migrating tests from JUnit 4 to JUnit 5

<!--

## Details

Quick Testing Basics (slides only)

* declaring tests as methods
* asserting properties with dedicated methods
* test lifecycle for setup and teardown
* extending framework behavior

Setup

* IDE integration
* build tool integration
* console launcher

Basics

* creating tests with `@Test`
* using the lifecycle annotations and disabling tests
* asserting properties with new assertions

Advanced

* organizing tests in nested classes and writing tests BDD-style
* creating test cases at run time
* parameterized tests
* parallelized tests

Extension Model

* limitations in JUnit 4's extension model and JUnit 5's motto "Prefer extension points over features"
* understanding extension model and existing extension points
* implementing extensions, particularly for
    * before/after behavior like benchmarks
    * disable tests akin to `@Disabled`
    * providing parameters to test methods
* applying extensions
* crafting custom annotations that fully integrate with JUnit 5
* a look into missing extension points and current work

Architecture (slides only)

* shortcomings in JUnit 4's architecture
* JUnit 5's split into Jupiter, Vintage, and Platform
* looking into a test engine
* what this means for the JVM testing ecosystem

Migration

* running JUnit 4 and 5 side by side
* migrating tests from JUnit 4 to 5

-->

---
title: "To JAR Hell And Back"
# subtitle: A Live Migration to Java 11
tags: [java-9, java-11, j_ms, migration]
date: 2017-07-25
slug: talk-java-9-migration
description: "A live-coding talk where we take a typical Java 8 code base and update it to Java 9 and beyond, overcoming some common and some less common hurdles like dependencies on internal APIs and split packages"
searchKeywords: "java 9 migration"
featuredImage: java-9-migration
slides: https://slides.codefx.org/java-9-migration
videoSlug: java-9-migration-devoxx-be-2018
repo: java-9-migration
---

I'm sure you've heard about compatibility issues when upgrading from Java 8 to 9 and beyond, but did you try it yourself yet?
This live coding session starts with a typical Java 8 application and runs up against and eventually overcomes the common hurdles:

* build system configuration
* dependency analysis with `jdeps`
* dependencies on internal APIs and Java EE modules
* split packages

To get the most out of this talk, you should have a good understanding of the module system basics - afterwards you will know how to approach *your* application's migration to Java 9 and the module system.

<!--
## Pitch

Updating to Java 9 can be non-trivial. It's one thing to know the theory and why certain things might fail but it's an entirely different thing to apply that in practice. In this live demo, I start with a project that works perfectly fine on Java 8 and show how to update to Java 9 and then modularize it.

I migrated a ~1.5 million LOC application to Java 9. I have been [writing about Project Jigsaw][fx-jigsaw] and [the module system][fx-jpms] since early summer 2015 and am currently writing [a book about it with Manning][jms]. I also [blog about Java 9][fx-java-9] and wrote [the Ultimate Guide to Java 9][sp-java-9], an article read by thousands. I have been talking at [a number of conferences][fx-talks] about Java 8, Java 9, Project Jigsaw, and JUnit 5.

The talk will use [this slide deck][fx-slides-j9-mig] and [this demo project][gh-j9-mig].

[jms]: http://tiny.cc/jms
[fx-talks]: http://blog.codefx.org/past-talks
[fx-slides-j9-mig]: http://slides.codefx.org/java-9-migration
[fx-java-9]: http://blog.codefx.org/tag/java-9
[fx-jigsaw]: http://blog.codefx.org/tag/project-jigsaw
[fx-jpms]: http://blog.codefx.org/tag/jpms
[sp-java-9]: https://www.sitepoint.com/ultimate-guide-to-java-9
[gh-j9-mig]: https://github.com/CodeFX-org/demo-java-9-migration
-->

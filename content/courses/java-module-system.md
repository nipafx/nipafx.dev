---
title: "Java Module System"
tags: [j_ms, java-9, java-11]
date: 2018-05-20
slug: course-java-module-system
description: "A 1 to 2-day course on the Java module system, from motivation and basics to underlying concepts and advanced features to migration and modularization of existing projects"
length: 1-2 days
audience: "Java developers who want to assess and potentially use modules for their projects"
requirements: "Average Java skills but experience with designing and building projects helps appreciate modules more"
searchKeywords: "java module system course"
featuredImage: java-module-system
---

This course teaches everything a Java developer needs to know about the Java module system that was introduced in Java 9.
It starts with good old _JAR hell_ and _the chaos of the class path_ to motivate the module system's introduction.
After that, the basics are explained before more advanced uses are introduced.
Last but not least, the course covers migration challenges when upgrading from Java 8 (most of them caused by the module system) and how to modularize existing projects.

Every aspect is taught with theoretical introductions, practical exercises, and usage recommendations.

Optionally, we can also discuss the six-month release cadence and licensing/support of JVM distributions.

<coursedetails slug="course-java-module-system"></coursedetails>

## Objectives

After completing this course, participants will be able to:

* understand the problems the module system solves
* create more maintainable projects with modules
* migrate existing projects from Java 8 to 9+ (which doesn't require modules)
* introduce modules to existing projects (stepwise if necessary)

## Program

The course starts with the basics:

* the problems of the class path and how the module system solves them
* defining modules with `§module-info.java` and building them from the module path
* understanding the terms _readability_ and _accessibility_ and their importance

It then teaches refined techniques beyond the basics:

* how to model optional and transitive dependencies
* how to use services to decouple modules
* how to make sure reflection is working
* how to create runtime images for or even with an application

It also makes sure participants can migrate their code bases:

* build tool support
* compatibility challenges of running on Java 9+
* preparatory dependency analysis
* stepwise modularization of an existing application

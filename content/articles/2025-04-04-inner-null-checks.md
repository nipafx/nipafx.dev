---
title: "New Null Checks in Inner Class Constructors"
tags: [java-25, core-lang, migration]
date: 2025-04-04
slug: inner-null-checks
description: "The Java compiler will now inject null checks for the outer instance into the constructor of inner classes"
canonicalUrl: https://inside.java/2025/04/04/quality-heads-up/
featuredImage: inner-null-checks
---

## Null Enclosing Instance

The Java Language Specification prescribes that various _use sites_ of inner class constructors should include null checks of the immediately enclosing instance and from then on assumes that the reference is non-null.
However it does not mandate such checks of the incoming instance at the _declaration site_ of these constructors and so core reflection, method handles, and direct bytecode invocation can pass `null` as enclosing instance, which can lead to `NullPointerException`s down the road.

Since a `null` enclosing instance is outside of the JLS and the future evolution of inner classes may lead to unexpected NPEs, Java 25 will start ensuring that references to the immediately enclosing instance are always non-null.


## Emitted Null Checks

Starting with JDK 25, when javac is targeting release 25 or higher, it will emit null checks for the enclosing instances in inner class constructors.

This behavioral change will lead to new NPEs in code that uses core reflection, method handles, or direct bytecode invocation to pass `null` as enclosing instance.
Such code is rare and usually found in libraries or frameworks (as opposed to in applications).
It should be changed to no longer pass a null reference.

In case these additional checks lead to issues, their emission can be prevented with a flag: `none§-XDnullCheckOuterThis=(true|false)`.
This should be seen as a temporary workaround and no guarantees are made for how long this flag will be available.

For more details, check [JDK-8351274](https://bugs.openjdk.org/browse/JDK-8351274).

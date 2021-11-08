---
title: "11 Tricks From dev.java - Inside Java Newscast #14"
tags: [generics, lambda, pattern-matching, records, serialization]
date: 2021-10-28
slug: inside-java-newscast-14
videoSlug: inside-java-newscast-14
description: "From compact record constructors to boolean expressions in pattern matching, from generic wildcards to chaining predicates and comparators, from jpackage to jlink - here are 11 Java tricks handpicked from dev.java."
featuredImage: inside-java-newscast-14
---

## Intro

Welcome, to the Inside Java Music Show where we cover recent developments in the OpenJDK community, backed by sick rock music.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today I'm gonna show you eleven Java tricks for records and patterns, generics and lambdas, JPackage and JShell, and more - all hand-picked from dev.java.

Ready?
Then let's dive right in!

## Compact Record Constructors

You know how to use records to model data carriers and how to verify incoming data during construction, but did you know that you don't have to list the parameters of all record constructors?
A record's _canonical_ constructor has one argument per component but in its _compact_ form, you don't have to list them.
You can't assign fields, that happens in compiler-generated code after yours, but you can reassign the parameters, which leads to the same result.

## Serializing Records

You know that every object can be serialized with black magic, but did you know that no such deviance is needed for records?
The guaranteed presence of constructor parameters and accessors makes serialization work with the object model and makes it easy for you to create reliable serializable records, immune to black magic like `writeObject`, `readObject`, and the like!

## JPackage vs Modules

You know `jpackage`, but... wait, do you know `jpackage`?
It's a command line tool that takes a whole Java app as input and produces a fully self-contained application image, meaning it includes your code, dependencies and a Java runtime.
It creates the runtime for your app with `jlink`, which you can fully configure through `jpackage`, or you can pass it the path to a runtime image that you already created.
Further configuration options include application metadata like icons and licenses, installation options and launchers as well as JVM and program options.
`jpackage` outputs in platform-specific formats like deb and rpm for Linux or exe and msi for Windows.

Now that you know `jpackage`, did you know that it can do all of that for modular as well as non-modular applications?
Like, it doesn't give a sh

## Cross-OS Runtime Images

Speaking of `jlink`, did you know that you can use it to create runtime images across operating systems?
Say your build server runs Linux and you need a Windows runtime image:
Then you just need to download and unpack a Windows JDK of the same version as the Linux one that runs `jlink` and add the Windows `jmods` folder to the Linux `jlink` executable's module path.

## Labeled Breaks and Continues

You know how to use the `break` statement to get out of a loop, but did you know that you can give it a label to break out of an appropriately labeled outer loop as well?
Likewise with `continue`, which skips the rest of current iteration of the innermost loop:
If you pass it a label, it will skip the iteration of the labeled loop instead.
But as always, just because you can, doesn't mean you should!

## Interlude

If you're wondering why this episode is so weird.
My camera is on the road but that doesn't mean we can't have a rock and roll slide show, right?
Now, on with it!

## Boolean Expressions in Pattern Matching

You know pattern matching, but did you know that you can use the variable it introduces in the same boolean expression?
If you check whether the instance `object` is of type `String` with `object instanceof String s`, you can start using `s` straight away, for example to check whether it's non-empty with `&& !s.isEmpty()`.
This works in `if` statements in Java 16 and in `switch` as a preview in Java 17.

## Generic Wildcards and Subtyping

You know generics and that a `List<Integer>` doesn't extend a `List<Number>`.
But did you know that if you add wildcards, you _can_ create a type hierarchy?
A `List<? extends Integer>` actually does extend a `List<? extends Number>`.
And the other way around, a `List<? super Number>` extends a `List<? super Integer>`.

## Creating and Chaining Predicates

You know how to write lambdas to create predicates, but did you know that the interface offers a lot of methods to create and combine them?
Call the instance methods `and`, `or`, or `negate` for boolean formulas.
Now predicates yet?
No problem!
The static factory method `not` is great to invert a method reference.
And if you pass some object to `isEqual`, you get a predicate that checks instances for equality with it.

## Creating and Chaining Comparators

If you think that was cool, hold your breath for comparators!
You know how to implement them, but did you know there are even more factory and combination methods?

To compare longs, doubles, floats, and the like, use a method reference to their static `compare` method.
If you want to compare objects by one of their attributes, pass a function extracting it to the static method `Comparator.comparing`.

To first sort by one and then another attribute, create both comparators, then chain them with the instance method `thenComparing`.
Need a `Comparator` instances that uses a `Comparable`'s `compareTo` method?
The static factory method `naturalOrder` is there for you.
If that's the wrong way around, just call `reversed` on it.
Ah, and what to do about pesky `null`?
Worry not, just pass a `Comparator` to `nullsFirst` or `nullsLast` to get a `Comparator` that does what you need.

## Executing Source Files as Scripts

You know that you can use the `java` command to launch a single source file without having to manually compile it first, but did you know that you can use this capability to write full-on scripts in Java in just three simple steps?
First, add a shebang line to the source file that points at your `java` executable, followed by `--source` and the Java version the code was written for.
Second, rename the file so it doesn't end with `.java` - this is a great opportunity to give it a good command-liney name.
Third, make it executable with `chmod +x`.
There you go, scripts in Java!

## Loading JShell with All Imports

You know how to launch `jshell` for some quick experiments but did you know that you don't have to import everything manually?
Just launch with the option `JAVASE` and all Java SE packages are imported, so you can get right to it!

## Outro

And that's it for today on the Inside Java Music Show.
I hope you liked it, do all the YouTube things and I'll see you again in two weeks.
So long...

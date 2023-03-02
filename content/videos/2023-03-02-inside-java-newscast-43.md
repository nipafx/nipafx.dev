---
title: "The Holy Grail of Java Performance - Inside Java Newscast #43"
tags: [project-leyden]
date: 2023-03-02
slug: inside-java-newscast-43
videoSlug: inside-java-newscast-43
description: "The goal of Project Leyden is to improve the startup time, time to peak performance, and footprint of Java programs. Project lead MArk Reinhold recently proposed to extend the Java programming model with features for selectively shifting and constraining computation with condensors. Let's look at his white paper and roadmap."
featuredImage: inside-java-newscast-43
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and right now I'm at the beginning of a long trek up the mountain to search for lightning in a bottle, the holy grail of Java performance.
It's not gonna be easy and you'll not always know where I'm going but trust me, if you stick with me to the end, it'll be worth it.

Ready?
Then let's walk!


## Phases Of Computation

### Compile Time

Even a journey of a thousand miles begins with a single step, so let's start our trek with the most obvious step in any program: compilation.
For JVM languages, compilation turns a bunch of source files into bytecode, right?
Yes but it does more than it has to to achieve that goal.
For example, it folds constants, meaning it evaluates simple expressions at compile time, so they don't need to be computed at run time.
Why does it do that?
You think about that while I walk a bit more...

### Run Time

Got it?
Great, put a pin in that.

Now let's talk about the other obvious phase: run time.
It takes the compilation's results and turns it into behavior: you know, the responses of a web service, for example.
One thing that stands out in Java's execution model is its inherent laziness.
Uhh, talking about laziness...
Late binding, lazy initialization - those are core concepts that both the runtime and us developers use to defer computation, for example with single-loaded... lazy-loaded singletons (sorry).
So... put a pin in that, too.

### Artifacts & Phases

So we have one phase that turns source code into bytecode and another that phase that turns bytecode into behavior.
Now, the last one is a little abstract, but generally speaking we can classify source code, bytecode, and behavior as artifacts.
So the two phases transform artifacts.
Are there more than two?
For sure!

### Good Times

Since Java 9 there's a third but optional phase: link time.
It transforms bytecode into a new kind of artifact, a run-time image, to achieve self-containment.

And then there's class-data sharing.
Creating the archive is another optional phase but this one doesn't transform the input artifact; it augments it with additional information: the class-data archive.
This improves performance, particularly launch performance.

So we have compile time, link time, archiving time, run time, STOP ... HAMMER TIME


## Shifting Computation

Every phase contributes computation so our program may achieve its goals.
Those goals are primarily to behave correctly but beyond that we may want it to be fast, small, quick to boot, etc.
One way to achieve that is to _shift_ computation, to move it around to a time where it better suits us.

### Forward And Backward

We talked about lazy initialization earlier.
It defers - shifts - computation to later, _forward_ in time, if you will.
This makes the program faster to launch than one that initializes all classes and static fields immediately on boot.
(It may also avoid unnecessary computation but let's focus on shifting.)

So lazy initialization shifts computation forward - now let's get back to constant folding during compilation.
As you probably figured out, by evaluating expressions at compile time instead of at run time, it improves run-time performance.
In our new parlance, it shifts computation, but:
It does so the other way, _backward_ in time, and also _to a different phase_ - that's pretty cool!

### Direct And Indirect

It appears that my camera just broke or at least I can't fix it out here in the Austrian mountainside, so I'll have to record the rest of the video on my little phone camera and I'll read a little bit from the script to make up for time that I lost if that's ok with you.

So we can shift computation forward, to later, and backward, to earlier, within the same phase or across phases.
There's one more distinction:
We can shift _direct_ computation, which is code that we wrote, and _indirect_ computation, which is computation done on our behalf, like loading classes or collecting garbage.
Constant folding, for example, shifts the evaluation of the expressions we wrote, which is direct computation.
Lazy initialization shifts the code we wrote in the static initializer (once gain direct computation) and loading of the class itself (which is indirect computation)

With that framework in mind, let's look at the optional phases.
Linking shifts indirect computation backward from run time to link time.
Similarly, class-data sharing shifts indirect computation backward from run time to archive-creation time.
And even the halting problem is solved during HAMMER TIME.

### Generalization

As you can see, Java often shifts computation around and sometimes even introduces new optional phases when needed but so far this process has been informal and very specific to each shift and phase.
And this is where we leave current Java behind and take a step into a new possible future in which we captured lightning in a bottle.


## Condensing Code

So let's generalize, let's allow an arbitrary number of phases in which time-shifting transformations and related optimizations can be applied.
To that end, we'd have condensers.
A _condenser_ is an optional transformation phase that takes a code artifact (like bytecode) as input and produces another artifact as output that can contain new code (like ahead-of-time compiled methods), new data (like serialized heap objects), or new metadata (like pre-loaded classes).
The condenser:

* performs some of the computation expressed in the input artifact, thereby shifting that computation from some later phase to the current phase
* applies optimizations enabled by that shift so the new artifact is faster, smaller, or otherwise "better"
* and it possibly imposes constraints, but more on that later

Condensation has three critical properties:

1. It is _meaning preserving_:
   The resulting artifact runs the application according to the Java Platform Specification, just as the original artifact did.
2. It is _composable_:
   The artifact output by one condenser can be the input to another, so performance improvements accumulate across a chain of condensers.
3. It is _selectable_:
   Developers choose how, what, and when to condense.


## Dynamism And Constraints, Specifications And Performance

The challenge in shifting computation while preserving meaning is Java's natural dynamism:
A running program can load and redefine classes and reflectively access fields and invoke methods in ways that are impossible to predict.
Generally speaking, the Java Platform Specification does not allow computation to be shifted in time arbitrarily, which prevents many powerful optimizations.

And this is where the constraints that I mentioned a minute ago come in.
The Java Platform Specification, in particular the Java Language Specification and the Java Virtual Machine Specification, would be revised so that a list of _permitted_ constraints is created:
From the relatively weak constraint of selecting classes that cannot be redefined to the very strict closed-world constraint and many more in between.
The Java specifications would also define the concept of condensers.

If all this comes together, we get condensers, the requirement for them to preserve meaning, to be composable and selectable as well as a list of constraints they may impose.
In such a future, a program's performance would be an emergent property of the condensers selected by its developers.
As they stand in front of a cabinet of lightning-filled jars, they can pick and choose as their program's properties permit and performance requirements demand.
After all, these properties and demands are very different across the ecosystem and hence this flexibility is needed to allow _all_ programs to improve performance and not just those that can accept the very strict closed-world constraint.


## Roadmap

The path I've just laid out to you is described in Mark Reinhold's white paper [_Selectively Shifting and Constraining Computation_][paper], published last October.
It's the first step of [Project Leyden][leyden], which has the goal to improve startup time, time to peak performance, and footprint of Java programs.
The article, linked in the description of course, lays out Leyden's fundamental challenges and approach and it ends with a roadmap:

[paper]: https://openjdk.org/projects/leyden/notes/02-shift-and-constrain
[leyden]: https://openjdk.org/projects/leyden/

### Specifications And Tools

First, the Java Platform Specification (and the TCK for that matter) must be extended with the new concepts of condensers and constraints.
Various tools, like jlink, must be improved to support condensers and artifact formats, like JAR files for example, must be augmented to accommodate new code, data, and metadata.

Bad news, clearly this episode has to end at the peak, but I'm not gonna make it there today, particularly because I also have to trek back down and if there's one thing that I know about the mountains it's not to strand there during the night.
So I'm gonna regroup, I'm gonna come back another day.

### Condensers And Constraints

And we're back.
Where were we?
Ah, right.

Then it's time to get to the meat of the matter: researching and developing condensers and suitable constraints.
To list a few possible examples:

* selective prohibition of redefinition of classes, which would allow pre-resolution of the selected classes, field accesses, and method invocations
* selective prohibition of run-time subclassing, which would allow non-speculative ahead-of-time compilation of the selected classes
* and selective prohibition of reflection, which would allow dead-code elimination

Put these and more together and you get the full-blown closed-world constraint, where you can create native images, fast-to-boot and very small, within the bounds of the Java specifications.
We'd truly have found the holy grail of Java performance.


## Outro

And that's it for today on the Inside Java Newscast.
Thank you very much for coming along on my hike, I hope you enjoyed it as much as I did.
In two weeks Billy will go over all changes in Java 20 with a fine comb and two weeks after, I finally get to show you my new studio.
Until then: like, subscribe, comment - you know the drill.
So long...

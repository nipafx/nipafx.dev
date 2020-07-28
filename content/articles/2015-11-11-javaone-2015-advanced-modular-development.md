---
title: "JavaOne 2015: Advanced Modular Development"
tags: [java-next, impulse, java-9, community, project-jigsaw]
date: 2015-11-11
slug: javaone-2015-advanced-modular-development
description: "JavaOne 2015 saw a series of talks by the Project Jigsaw team about modularity in Java 9. This one details different migration scenarios."
searchKeywords: "JavaOne"
featuredImage: javaone-project-jigsaw-advanced-sf
---

[codefx_series\_javaone2015]

Let's build on the introduction with some advanced modular development and migration advice!

### Overview

-   **Content**: How to migrate applications and libraries to the module system
-   **Speaker**: Mark Reinhold, Alex Buckley, Alan Bateman
-   **Links**: [Video](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=6h24m59s) and [Slides](http://openjdk.java.net/projects/jigsaw/j1/adv-modular-dev-j1-2015.pdf)

[toc exclude=Overview]

## Introductory Remarks[](https://www.youtube.com/watch?v=8RhwmJlZQgs#t=6h25m46s){.link-playvideo}

Mark Reinhold begins by emphasizing that the current prototype is still a work in progress, a proposal with some rough edges and missing parts.
The reason the Jigsaw team is spending so much time talking about it is to spread the word and gather feedback.

So try it out and give feedback!

## Application Migration[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=6h27m19s){.link-playvideo}

<div style="float:right; width:50%;">

[![javaone-project-jigsaw-migration-scenario](http://blog.codefx.org/wp-content/uploads/javaone-project-jigsaw-migration-scenario-300x141.png){.aligncenter .size-medium .wp-image-2340 width="300" height="141"}](http://blog.codefx.org/wp-content/uploads/javaone-project-jigsaw-migration-scenario.png)

Copyright © 2015, Oracle and/or its affiliates.

All rights reserved.

</div>

In the talk's first part, Alex Buckley covers how to migrate an application to the module system.
He discusses this under the assumption that the application's dependencies are not yet published as modules.
(Because if they were, this would be fairly simple and straight-forward.)

### Top-Down Migration[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=6h29m55s){.link-playvideo}

Whenever a JAR is turned into a module, two questions have to be answered:

-   What does the module require?
-   What does the module export?

The first question can be answered with the help of *jdeps*.
The second requires the module's authors to consciously decide which packages contain its public API.

Both answers must then be poured into the `module-info.java` as explained in the [introduction to modular development](javaone-2015-introduction-to-modular-development) and the [quick-start guide](http://openjdk.java.net/projects/jigsaw/quick-start).

### Automatic Modules[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=6h32m55s){.link-playvideo}

Buckley now addresses the intrinsic problem of his example: What to do with the application's dependencies that were not yet published as modules?
The solution are *automatic modules*.

<div style="float:right; width:50%;">

[![javaone-project-jigsaw-automatic-modules](http://blog.codefx.org/wp-content/uploads/javaone-project-jigsaw-automatic-modules-300x163.png){.aligncenter .size-medium .wp-image-2337 width="300" height="163"}](http://blog.codefx.org/wp-content/uploads/javaone-project-jigsaw-automatic-modules.png)

Copyright © 2015, Oracle and/or its affiliates.

All rights reserved.

</div>

Simply by placing a JAR on the module path instead of the class path it becomes an automatic module.
This is a full fledged module but requires no changes to the JAR itself.
Its name is derived from the JAR name and it exports all its packages.
It can read all modules on the module path (by implicitly requiring them all) *and* all classes on the class path.

This provides the maximum compatibility surface for migrating JAR files.

### System Structure[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=6h38m15s){.link-playvideo}

Even with the slightly exceptional automatic modules, which add a lot of edges to the module path, the situation is better than it was on the class path.
There everything could access everything else and the JVM simply erased any system structure envisioned by the developers.

### Compiling And Running The Example[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=6h40m05s){.link-playvideo}

The example is compiled and run with the commands covered by the [quick-start guide](http://openjdk.java.net/projects/jigsaw/quick-start).

Buckley also demonstrates the javac flag `-modulesourcepath` to enable [multi-module compilation](http://openjdk.java.net/projects/jigsaw/quick-start#multimodulecompile).
It requires a single directory and expects it to contain one subdirectory per module.
Each module directory can then contain source files and other resources required to build the module.
This corresponds to the new directory schema proposed by [JEP 201](http://openjdk.java.net/jeps/201) and

### Summary[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=6h43m48s){.link-playvideo}

For top-down migration the application's JARs are transformed into modules by creating `module-info.java` files for them.
The dependencies are turned into automatic modules by putting them on the module path instead of the class path.

## Library Migration[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=6h44m36s){.link-playvideo}

Alan Bateman approaches the same scene but from a different perspective.
He is showing how to convert libraries to modules without requiring the application's using them to do the same.

### Bottom-Up Migration[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=6h45m25s){.link-playvideo}

For libraries the same questions need to be answered as for application modules:

-   What does the module require?
-   What does the module export?

Again, *jdeps* is brought out to answer the first.
But here Bateman also demonstrates how the flag `-genmoduleinfo` can be used to generate a first draft of the `module-info.java` files.
In this mode *jdeps* derives the module name from the JAR name, requires the correct dependencies and simply exports all packages.
The module authors should then decide which exports to take out.

Bateman then compiles and packages the modules like described above and in the [quick-start guide](http://openjdk.java.net/projects/jigsaw/quick-start).

### Mixing Class Path And Module Path[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=6h52m18s){.link-playvideo}

The application is not yet converted to modules, which has two implications:

<div style="float:right; width:50%;">

[![javaone-project-jigsaw-library-modules](http://blog.codefx.org/wp-content/uploads/javaone-project-jigsaw-library-modules-300x195.png){.aligncenter .size-medium .wp-image-2338 width="300" height="195"}](http://blog.codefx.org/wp-content/uploads/javaone-project-jigsaw-library-modules.png)

Copyright © 2015, Oracle and/or its affiliates.

All rights reserved.

</div>

-   Both the class path and the module path are required to run it.
-   The application can not express which modules it depends on.

Mixing class and module path on the command line is verbose but straight forward.
On top of that the flag `-addmods` must be used to specify the root modules against which the module system has to resolve the module path.
In the running examples, this would be the freshly converted library modules.

### Advanced Migration Challenges[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=6h54m47s){.link-playvideo}

In the presented example one of the newly created library modules uses reflection to access the application's code.
This is problematic because modules can only access code from modules on which they depend and clearly libraries can not depend on the applications using them.

The solution is [`addReads` on the new class `java.lang.Module`](http://cr.openjdk.java.net/~mr/jigsaw/spec/api/java/lang/reflect/Module.html#addReads-java.lang.reflect.Module-).
It can be used to allow the module calling the method to read a specified module.
To get a module call `Class.getModule()`.

## Putting It All Together[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=7h00m46s){.link-playvideo}

<div style="float:right; width:50%;">

[![javaone-project-jigsaw-migration-done](http://blog.codefx.org/wp-content/uploads/javaone-project-jigsaw-migration-done-300x182.png){.aligncenter .size-medium .wp-image-2339 width="300" height="182"}](http://blog.codefx.org/wp-content/uploads/javaone-project-jigsaw-migration-done.png)

Copyright © 2015, Oracle and/or its affiliates.

All rights reserved.

</div>

Putting both approaches together results in a nice dependency graph and super short command to launch the application.

Bateman then goes on to package the resulting application in a minimal self-contained run time image with *jlink* as described in [the introduction to modular development](http://blog.codefx.org/java/dev/javaone-2015-introduction-to-modular-development#Linking).

## Summary[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=7h04m49s){.link-playvideo}

In summary, the two approaches show how application and library maintainers can modularize their projects independently and at their own pace.
But note that some code changes may be required.

> Go forth and modularize!

<contentimage slug="javaone-project-jigsaw-advanced-sf"></contentimage>

[Published](https://www.flickr.com/photos/parksjd/9162806331) by [Joe Parks](https://www.flickr.com/photos/parksjd/) under [CC-BY-NC 2.0](https://creativecommons.org/licenses/by-nc/2.0/).

## Questions

The vast majority of questions were interesting so here we go.

### Can Someone Override Your Security Packages?[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=7h07m30s){.link-playvideo}

The Jigsaw team is prototyping an optional verification step.
At build time, it would compute a module's strong hash and bake that into the modules depending on it.
It would then validate the hash at launch time.

### Is It Possible To Access Non-Exported Types?[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=7h09m47s){.link-playvideo}

Not from code.
If certain types must be available in this way (e.g. for a dependency injection framework), they have to be exported.
There is intentionally no way to break module encapsulation with reflection.

But it is possible with the command line flag `-XaddExports` as explained in [JEP 261](http://openjdk.java.net/jeps/261) under section Breaking Encapsulation.

### Is Jigsaw Compatible With OSGi?[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=7h11m00s){.link-playvideo}

No, but OSGi will run on top of it.

### What About JNI?
Can Modules Contain DLLs, SOs?[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=7h12m11s){.link-playvideo}

JNI works exactly as before and modules can contain all kinds of resources including OS-specific libraries.

### Why Is The Main Class Not Specified in `module-info.java`?[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=7h12m52s){.link-playvideo}

Because it's not an essential information for the compiler and the JVM.
In fact, it isn't even an essential property of the program as it might change for different deployments of the same project version.

### How To Express Dependencies On Unmodularized JARs?[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=7h16m15s){.link-playvideo}

The library can require its dependencies as shown above.
If those were not yet modularized, the documentation should mention that they have to be added to the module path (as opposed to the class path) nonetheless.
They would then be turned into automatic modules, which makes them available to the library.
Of course the class path remains an exit hatch and the library can always be put there and everything works as before.

Alternatively, Buckley suggests to use reflection if the collaboration between the projects is limited.
The library would then not have to require its dependency and instead start reading it at runtime regardless of whether it is placed on the class or the module path.

### What About Tools Like Maven?[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=7h19m24s){.link-playvideo}

The Jigsaw team hopes to work with all tool vendors to enable support but there are no plans at the moment because it is still fairly early.

Buckley tries to manage expectations by describing the incorporation of the module system into tools as a distributed problem.
The Java 9 release should not be seen as the point at which everything must cooperate perfectly but as the start to getting everything cooperating.

### What About (Context-) Class Loaders?[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=7h21m26s){.link-playvideo}

The module system is almost orthogonal to class loaders and there should be no problematic interaction.
Loaders are describes as a low-level mechanisms while the modules are a higher abstraction.

For more details wait for the upcoming summary of a peek under the hood of Project Jigsaw.

### Is It Possible To Package Multiple Modules Into A Single JAR?[](https://www.youtube.com/watch?v=8RhwmJlZQgs&t=7h22m28s){.link-playvideo}

Or on other words, will it be possible to build a [fat](http://stackoverflow.com/q/19150811/2525313 "What is a fat JAR?
- StackOverflow")/[uber](http://stackoverflow.com/q/11947037/2525313 "What is an uber jar?
- StackOverflow") JAR containing several modules, typically all of its dependencies?

For now there is no support but creating an image might be a solution for some of the use cases.
Reinhold promises to think about it as this question has come up repeatedly.

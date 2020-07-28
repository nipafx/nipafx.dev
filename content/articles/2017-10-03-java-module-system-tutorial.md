---
title: "Code-First Java Module System Tutorial"
tags: [java-9, java-basics, j_ms]
date: 2017-10-03
slug: java-module-system-tutorial
description: "Tutorial of Java 9 module system basics: declare modules with module-info.java, compile, package, launch them, learn of module path and readability graph."
intro: "Learn all the module system basics in this tutorial: how to declare modules with module-info.java, compile, package, and launch them and what role the module path and readability graph play."
searchKeywords: "module system"
featuredImage: jpms-tutorial-pieces
---

The Java Platform Module System (JPMS) brings modularization to Java and the JVM and it changes how we program in the large.
To get the most out of it, we need to know it well, and the first step is to learn the basics.
In this tutorial I'll first show you a simple *Hello World* example and then we'll take an existing demo application and modularize it with Java 9.
We will create module declarations (`module-info.java`) and use the module path to compile, package, and run the application - code first, explanations second, so you can cut to the chase.

I use two projects in this tutorial and both can be found on GitHub: The first is [a very simple *Hello World* example](https://github.com/CodeFX-org/demo-jpms-hello-world), the other [the *ServiceMonitor*](https://github.com/CodeFX-org/demo-jpms-monitor), which is the same one I use in [my book on the module system](https://www.manning.com/books/the-java-module-system?a_aid=nipa&a_bid=869915cb).
Check them out if you want to take a closer look.
All commands like `javac`, `jar`, and `java` refer to the Java 9 variants.

[toc heading_levels="2,3"]

## Hello, Modular World {#hellomodularworld}

Let's start with the simplest possible application, one that prints *Hello, modular World!* Here's the class:

```java
package org.codefx.demo.jpms;

public class HelloModularWorld {

	public static void main(String[] args) {
		System.out.println("Hello, modular World!");
	}

}
```

To become a module, it needs a `module-info.java` in the project's root source directory:

```java
module org.codefx.demo.jpms_hello_world {
	// this module only needs types from the base module 'java.base';
	// because every Java module needs 'java.base', it is not necessary
	// to explicitly require it - I do it nonetheless for demo purposes
	requires java.base;
	// this export makes little sense for the application,
	// but once again, I do this for demo purposes
	exports org.codefx.demo.jpms;
}
```

With the common `src/main/java` directory structure, the program's directory layout looks as follows:

<contentimage slug="jpms-tutorial-directory-hw"></contentimage>

These are the commands to compile, package and launch it:

```shell
$ javac
	-d target/classes
	${source-files}
$ jar --create
	--file target/jpms-hello-world.jar
	--main-class org.codefx.demo.jpms.HelloModularWorld
	-C target/classes .
$ java
	--module-path target/jpms-hello-world.jar
	--module org.codefx.demo.jpms_hello_world
```

Very similar to what we would have done for a non-modular application, except we're now using something called a "module path" and can define the project's main class (without a manifest).
Let's see how that works.

### Modules

The basic building block of the JPMS are modules (surprise!).
Like JARs, they are a container for types and resources; but unlike JARs, they have additional characteristics - these are the most fundamental ones:

<pullquote>Modules are like JARs with additional characteristics</pullquote>

-   a name, preferably one that is globally unique
-   declarations of dependencies on other modules
-   a clearly defined API that consists of exported packages

The JDK was split into about a hundred so-called *platform modules*.
You can list them with `java --list-modules` and look at an individual module with `java --describe-module ${module}`.
Go ahead, give it a try with *java.sql* or *java.logging*:

```shell
$ java --describe-module java.sql

> java.sql@9
> exports java.sql
> exports javax.sql
> exports javax.transaction.xa
> requires java.logging transitive
> requires java.base mandated
> requires java.xml transitive
> uses java.sql.Driver
```

A module's properties are defined in a *module declaration*, a file `module-info.java` in the project's root, which looks as follows:

```java
module ${module-name} {
	requires ${module-name};
	exports ${package-name};
}
```

It gets compiled into a `module-info.class`, called *module descriptor*, and ends up in the JAR's root.
This descriptor is the only difference between a plain JAR and a *modular JAR*.

Let's go through the three module properties one by one: name, dependencies, exports.

#### Name

The most basic property that JARs are missing is a name that compiler and JVM can use to identify it with.
It is hence the most prominent characteristic of a module.
We will have the possibility and even the obligation to give every module we create a name.

Naming a module will often be pretty natural as most tools we use on a daily basis, be it IDEs, build tools, or even issue trackers and version control systems, already have us name our projects.
But while it makes sense to take that name as a springboard on the search for a module name, it is important to choose wisely!

<pullquote>The best name for a module is the reverse-domain naming scheme that is already commonly used for packages</pullquote>

The module system leans heavily on a module's name.
Conflicting or evolving names in particular cause trouble, so it is important that the name is:

-   globally unique
-   stable

The best way to achieve that is the reverse-domain naming scheme that is already commonly used for packages:

```java
module org.codefx.demo.jpms {

}
```

#### Dependencies And Readability {#dependencies-readability}

Another thing we missed in JARs was the ability to declare dependencies, but with the module system, these times are over: Dependencies have to be made explicit - all of them, on JDK modules as well as on third-party libraries or frameworks.

<pullquote>All dependencies have to be made explicit with `requires` directives</pullquote>

Dependencies are declared with `requires` directives, which consist of the keyword itself followed by a module name.
When scanning modules, the JPMS builds a *readability graph*, where modules are nodes and `requires` directives get turned into so-called *readability edges* - if module *org.codefx.demo.jpms* requires module *java.base*, then at runtime *org.codefx.demo.jpms* reads *java.base*.

The module system will throw an error if it cannot find a required module with the right name, which means compiling as well as launching an application will fail if modules are missing.
This achieves *reliable configuration* one of [the goals of the module system](motivation-goals-project-jigsaw), but can be prohibitively strict - check my post on [optional dependencies](java-modules-optional-dependencies) to see a more lenient alternative.

All types the *Hello World* example needs can be found in the JDK module *java.base*, the so-called *base module*.
Because it contains essential types like `Object`, all Java code needs it and so it doesn't have to be required explicitly.
Still, I do it in this case to show you a `requires` directive:

```java
module org.codefx.demo.jpms {
	requires java.base;
}
```

#### Exports And Accessibility {#exports-accessibility}

A module lists the packages it exports.
For code in one module (say *org.codefx.demo.jpms*) to access types in another (say `String` in *java.base*), the following *accessibility* rules must be fulfilled:

<pullquote>A module's API is defined by its `exports` directives</pullquote>

-   the accessed type (`String`) must be public
-   the package containing the type (`java.lang`) must be exported by its module (*java.base*)
-   the accessing module (*org.codefx.demo.jpms*) must read the accessed one (*java.base*), which is typically achieved by requiring it

If any of these rules are violated at compile or run time, the module systems throws an error.
This means that `public` is no longer really public.
A public type in a non-exported package is as inaccessible to the outside world as a non-public type in an exported package.
Also note that reflection lost its superpowers.
It is bound by the exact same accessibility rules unless [command line flags](five-command-line-options-hack-java-module-system) are used.

<pullquote>Reflection lost its superpowers</pullquote>

Since our example has no meaningful API, no outside code needs to access it and so we don't actually have to export anything.
Once again I'll do it nonetheless for demonstration purposes:

```java
module org.codefx.demo.jpms_hello_world {
	requires java.base;
	exports org.codefx.demo.jpms;
}
```

### Module Path {#modulepath}

We now know how we can define modules and their essential properties.
What's still a little unclear is how exactly we tell the compiler and runtime about them.
The answer is a new concept that parallels the class path:

The *module path* is a list whose elements are artifacts or directories that contain artifacts.
Depending on the operating system, module path elements are either separated by `:` (Unix-based) or `;` (Windows).
It is used by the module system to locate required modules that are not found among the platform modules.
Both `javac` and `java` as well as other module-related commands can process it - the command line options are `--module-path` and `-p`.

All artifacts on the module path are turned into modules.
This is even true for plain JARs, which get turned into [automatic modules](http://openjdk.java.net/projects/jigsaw/spec/sotms/#automatic-modules).

### Compiling, Packaging, Running {#compilingpackagingrunning}

Compiling works much like without the module system:

```shell
$ javac
	-d target/classes
	${source-files}
```

(You of course have to replace `${source-files}` with an actual enumeration of the involved files, but that crowds the examples, so I don't do it here.)

The module system kicks in as soon as a `module-info.java` is among the source files.
All non-JDK dependencies the module under compilation requires need to be on the module path.
For the *Hello World* example, there are no such dependencies.

Packaging with `jar` is unchanged as well.
The only difference is that we no longer need a manifest to declare an application's entry point - we can use `--main-class` for that:

```shell
$ jar --create
	--file target/jpms-hello-world.jar
	--main-class org.codefx.demo.jpms.HelloModularWorld
	-C target/classes .
```

Finally, launching looks a little different.
We use the module path instead of the class path to tell the JPMS where to find modules.
All we need to do beyond that is to name the main module with `--module`:

```shell
$ java
	--module-path target/jpms-hello-world.jar
	--module org.codefx.demo.jpms_hello_world
```

And that's it!
We've created a very simple, but nonetheless modular Hello-World application and successfully build and launched it.
Now it's time to turn to a slightly less trivial example to see mechanisms like dependencies and exports in action.

[jms_in\_action title="Go deeper:"]

## The *ServiceMonitor* {#theapplicationbeforethemodulesystem}

Let's imagine a network of services that cooperate to delight our users; maybe a social network or a video platform.
We want to monitor those services to determine how healthy the system is and spot problems when they occur (instead of when customers report them).
This is where the example application, the *ServiceMonitor* comes in: It monitors these services (another big surprise).

As luck would have it, the services already collect the data we want, so all the *ServiceMonitor* needs to do is query them periodically.
Unfortunately not all services expose the same REST API - two generations are in use, Alpha and Beta.
That's why `ServiceObserver` is an interface with two implementations.

Once we have the diagnostic data, in the form of a `DiagnosticDataPoint`, they can be fed to a `Statistician`, which aggregates them to `Statistics`.
These, in turn, are stored in a `StatisticsRepository` as well as made available via REST by `MonitorServer`.
The `Monitor` class ties everything together.

All in all, we end up with these types:

-   `DiagnosticDataPoint`: service data for a time interval
-   `ServiceObserver`: interface for service observation that returns `DiagnosticDataPoint`
-   `AlphaServiceObserver` and `BetaServiceObserver`: each observes a variant of services
-   `Statistician`: computes `Statistics` from `DiagnosticDataPoint`
-   `Statistics`: holds the computed statistics
-   `StatisticsRepository`: stores and retrieve `Statistics`
-   `MonitorServer`: answers REST calls for the statistics
-   `Monitor`: ties everything together

<contentimage slug="jpms-tutorial-monitor-classes"></contentimage>

The application depends on the [Spark micro web framework](http://sparkjava.com/) and we reference it by the module name *spark.core*.
It can be found in the `libs` directory together with its transitive dependencies.

With what we learned so far, we already know how to organize the application as a single module.
First, we create the module declaration `module-info.java` in the project's root:

```java
module monitor {
	requires spark.core;
}
```

Note that we should choose a module name like *org.codefx.demo.monitor*, but that would crowd the examples, so I'll stick to the shorter *monitor*.
As explained, it requires *spark.core* and because the application has no meaningful API, it exports no packages.

We can then compile, package, and run it as follows:

```shell
$ javac
	--module-path libs
	-d classes/monitor
	${source-files}
$ jar --create
	--file mods/monitor.jar
	--main-class monitor.Main
	-C classes/monitor .
$ java
	--module-path mods
	--module monitor
```

As you can see, we no longer use Maven's `target` directory and instead create classes in `classes` and modules in `mods`.
This makes the examples easier to parse.
Note that unlike earlier, we already have to use the module path during compilation because this application has non-JDK dependencies.

And with that we've created a single-module *ServiceMonitor*!

## Splitting Into Modules {#splittingintomodules}

Now that we got one module going, it's time to really start using the module system and split the *ServiceMonitor* up.
For an application of this size it is of course ludicrous to turn it into several modules, but it's a demo, so here we go.

The most common way to modularize applications is a separation by concerns.
*ServiceMonitor* has the following, with the related types in parenthesis:

-   collecting data from services (`ServiceObserver`, `DiagnosticDataPoint`)
-   aggregating data into statistics (`Statistician`, `Statistics`)
-   persisting statistics (`StatisticsRepository`)
-   exposing statistics via a REST API (`MonitorServer`)

But not only the domain logic generates requirements.
There are also technical ones:

-   data collection must be hidden behind an API
-   Alpha and Beta services each require a separate implementation of that API (`AlphaServiceObserver` and `BetaServiceObserver`)
-   orchestration of all concerns (`Monitor`)

This results in the following modules with the mentioned publicly visible types:

-   *monitor.observer* (`ServiceObserver`, `DiagnosticDataPoint`)
-   *monitor.observer.alpha* (`AlphaServiceObserver`)
-   *monitor.observer.beta* (`BetaServiceObserver`)
-   *monitor.statistics* (`Statistician`, `Statistics`)
-   *monitor.persistence* (`StatisticsRepository`)
-   *monitor.rest* (`MonitorServer`)
-   *monitor* (`Monitor`)

Superimposing these modules over the class diagram, it is easy to see the module dependencies emerge:

<contentimage slug="jpms-tutorial-monitor-modules"></contentimage>

### Reorganizing Source Code {#reorganizingsourcecode}

A real-life project consists of myriad files of many different types.
Obviously, source files are the most important ones but nonetheless only one kind of many - others are test sources, resources, build scripts or project descriptions, documentation, source control information, and many others.
Any project has to choose a directory structure to organize those files and it is important to make sure it does not clash with the module system's characteristics.

If you have been following the module system's development under Project Jigsaw and studied [the official quick start guide](http://openjdk.java.net/projects/jigsaw/quick-start) or [some early tutorials](jigsaw-hands-on-guide), you might have noticed that they use a particular directory structure, where there's a `src` directory with a subdirectory for each project.
That way *ServiceMonitor* would look as follows:

```shell
ServiceMonitor
 + classes
 + mods
 - src
	+ monitor
	- monitor.observer
	   - monitor
		  - observer
			 DiagnosticDataPoint.java
			 ServiceObserver.java
	   module-info.java
	+ monitor.observer.alpha
	+ monitor.observer.beta
	+ monitor.persistence
	+ monitor.rest
	+ monitor.statistics
 - test-src
	+ monitor
	+ monitor.observer
	+ monitor.observer.alpha
	+ monitor.observer.beta
	+ monitor.persistence
	+ monitor.rest
	+ monitor.statistics
```

This results in a hierarchy `concern/module` and I don't like it.
Most projects that consist of several sub-projects (what we now call modules) prefer separate root directories, where each contains a single module's sources, tests, resources, and everything else mentioned earlier.
They use a hierarchy `module/concern` and this is what established project structures provide.

The default directory structure, implicitly understood by tools like Maven and Gradle, implement that hierarchy.
First and foremost, they give each module its own directory tree.
In that tree the `src` directory contains production code and resources (in `main/java` and `main/resources`, respectively) as well as test code and resources (in `test/java` and `test/resources`, respectively):

```shell
ServiceMonitor
 + monitor
 - monitor.observer
	- src
	   - main
		  - java
			 - monitor
				- observer
				   DiagnosticDataPoint.java
				   ServiceObserver.java
			 module-info.java
		  + resources
	   + test
		  + java
		  + resources
	+ target
 + monitor.observer.alpha
 + monitor.observer.beta
 + monitor.persistence
 + monitor.rest
 + monitor.statistics
```

I will organize the *ServiceMonitor* almost like that, with the only difference that I will create the bytecode in a directory `classes` and JARS in a directory `mods`, which are both right below `ServiceMonitor`, because that makes the scripts shorter and more readable.

Let's now see what those declarations infos have to contain and how we can compile and run the application.

### Declaring Modules {#declaringmodules}

We've already covered how modules are declared using `module-info.java`, so there's no need to go into details.
Once you've figured out how modules need to depend on one another (your build tool should know that; otherwise [ask JDeps](jdeps-tutorial-analyze-java-project-dependencies)), you can put in `requires` directives and the necessary `exports` emerge naturally from imports across module boundaries.

```java
module monitor.observer {
	exports monitor.observer;
}

module monitor.observer.alpha {
	requires monitor.observer;
	exports monitor.observer.alpha;
}

module monitor.observer.beta {
	requires monitor.observer;
	exports monitor.observer.beta;
}

module monitor.statistics {
	requires monitor.observer;
	exports monitor.statistics;
}

module monitor.persistence {
	requires monitor.statistics;
	exports monitor.persistence;
}

module monitor.rest {
	requires spark.core;
	requires monitor.statistics;
	exports monitor.rest;
}

module monitor {
	requires monitor.observer;
	requires monitor.observer.alpha;
	requires monitor.observer.beta;
	requires monitor.statistics;
	requires monitor.persistence;
	requires monitor.rest;
}
```

By the way, you can use [JDeps to create an initial set of module declarations](https://blog.codefx.org/tools/jdeps-tutorial-analyze-java-project-dependencies/#JDeps-And-Modules).
Whether created automatically or manually, in a real-life project you should verify whether your dependencies and APIs are as you want them to be.
It is likely that over time, some quick fixes introduced relationships that you'd rather get rid of.
Do that now or create some backlog issues.

### Compiling, Packaging, And Running {#compilingpackagingandrunning}

Very similar to before when it was only a single module, but more often:

```shell
$ javac
	-d classes/monitor.observer
	${source-files}
$ jar --create
	--file mods/monitor.observer.jar
	-C classes/monitor.observer .

# monitor.observer.alpha depends on monitor.observer,
# so we place 'mods', which contains monitor.observer.jar,
# on the module path
$ javac
	--module-path mods
	-d classes/monitor.observer.alpha
	${source-files}
$ jar --create
	--file mods/monitor.observer.alpha.jar
	-C classes/monitor.observer.alpha .

# more of the same ... until we come to monitor,
# which once again defines a main class
$ javac
	--module-path mods
	-d classes/monitor
	${source-files}
$ jar --create
	--file mods/monitor.jar
	--main-class monitor.Main
	-C classes/monitor .
```

Congratulations, you've got the basics covered!
You now know how to organize, declare, compile, package, and launch modules and understand what role the module path, the readability graph, and modular JARs play.

<contentimage slug="jpms-tutorial-pieces"></contentimage>

## On The Horizon {#goingdeeper}

If you weren't so damn curious this post could be over now, but instead I'm going to show you a few of the more advanced features, so you know what to read about next.

### Implied Readability {#impliedreadability}

The *ServiceMonitor* module *monitor.observer.alpha* describes itself as follows:

```java
module monitor.observer.alpha {
	requires monitor.observer;
	exports monitor.observer.alpha;
}
```

Instead it should actually do this:

```java
module monitor.observer.alpha {
	requires transitive monitor.observer;
	exports monitor.observer.alpha;
}
```

Spot the `transitive` in there?
It makes sure that any module reading *monitor.observer.alpha* also reads *monitor.observer*.
Why would you do that?
Here's a method from *alpha*'s public API:

```java
public static Optional<ServiceObserver> createIfAlphaService(String service) {
	// ...
}
```

It returns an `Optional<ServiceObserver>`, but `ServiceObserver` comes from the *monitor.observer* module - that means every module that wants to call *alpha*'s `createIfAlphaService` needs to read *monitor.observer* as well or such code won't compile.
That's pretty inconvenient, so modules like *alpha* that use another module's type in their own public API should generally require that module with the `transitive` modifier.

[There are more uses for implied readability.](java-modules-implied-readability)

### Optional Dependencies {#optionaldependencies}

This is quite straight-forward: If you want to compile against a module's types, but don't want to force its presence at runtime you can mark your dependency as being optional with the `static` modifier:

```java
module monitor {
	requires monitor.observer;
	requires static monitor.observer.alpha;
	requires static monitor.observer.beta;
	requires monitor.statistics;
	requires monitor.persistence;
	requires static monitor.rest;
}
```

In this case *monitor* seems to be ok with the *alpha* and *beta* observer implementations possibly being absent and it looks like the REST endpoint is optional, too.

[There are a few things to consider when coding against optional dependencies.](java-modules-optional-dependencies)

### Qualified Exports {#qualifiedexports}

Regular exports have you make the decision whether a package's public types are accessible only within the same module or to all modules.
Sometimes you need something in between, though.
If you're shipping a bunch of modules, you might end up in the situation, where you'd like to share code between those modules but not outside of it.
Qualified exports to the rescue!

```java
module monitor.util {
	exports monitor.util to monitor, monitor.statistics;
}
```

This way only *monitor* and *monitor.statistics* can access the `monitor.util` package.

### Open Packages And Modules {#openpackagesandmodules}

I said earlier that reflection's superpowers were revoked - it now has to play by the same rules as regular access.
Reflection still has a special place in Java's ecosystem, though, as it enables frameworks like Hibernate, Spring and so many others.

The bridge between those two poles are open packages and modules:

```java
module monitor.persistence {
	opens monitor.persistence.dtos;
}

// or even

open module monitor.persistence.dtos { }
```

An open package is inaccessible at compile time (so you can't write code against its types), but accessible at run time (so reflection works).
More than just being accessible, it allows reflective access to non-public types and members (this is called *deem reflection*).
Open packages can be qualified just like exports and open modules simply open all their packages.

### Services

Instead of having the main module *monitor* depend on *monitor.observer.alpha* and *monitor.observer.beta*, so it can create instances of `AlphaServiceObserver` and `BetaServiceObserver`, it could let the module system make that connection:

```java
module monitor {
	requires monitor.observer;
	// monitor wants to use a service
	uses monitor.observer.ServiceObserverFactory;
	requires monitor.statistics;
	requires monitor.persistence;
	requires monitor.rest;
}

module monitor.observer.alpha {
	requires monitor.observer;
	// alpha provides a service implementation
	provides monitor.observer.ServiceObserverFactory
		with monitor.observer.alpha.AlphaServiceObserverFactory;
}

module monitor.observer.beta {
	requires monitor.observer;
	// beta provides a service implementation
	provides monitor.observer.ServiceObserverFactory
		with monitor.observer.beta.BetaServiceObserverFactory;
}
```

This way, *monitor* can do the following to get an instance of each provided observer factory:

```java
List<ServiceObserverFactory> observerFactories = ServiceLoader
	.load(ServiceObserverFactory.class).stream()
	.map(Provider::get)
	.collect(toList());
```

It uses [the `ServiceLoader` API](http://download.java.net/java/jdk9/docs/api/java/util/ServiceLoader.html), which exists since Java 6, to inform the module system that it needs all implementations of `ServiceObserverFactory`.
The JPMS will then track down all modules in the readability graph that provide that service, create an instance of each and return them.

There are two particularly interesting consequences:

-   the module consuming the service does not have to require the modules providing it
-   the application can be configured by selecting which modules are placed on the module path

Services are a wonderful way to decouple modules and its awesome that the module system gives this mostly ignored concept a second life and puts it into a prominent place.

## Reflection

Ok, we're really done now and you've learned a lot.
Quick recap:

-   a module is a run-time concept created from a modular JAR
-   a modular JAR is like any old plain JAR, except that it contains a module descriptor `module-info.class`, which is compiled from a module declaration `module-info.java`
-   the module declaration gives a module its name, defines its dependencies (with `requires`, `requires static`, and `requires transitive`) and API (with `exports` and `exports to`), enables reflective access (with `open` and `opens to`) and declares use or provision of services
-   modules are placed on the module path where the JPMS finds them during module resolution, which is the phase that processes descriptors and results in a readability graph

If you want to learn more about the module system, read the posts I linked above, check [the JPMS tag](https://blog.codefx.org/tag/jpms/), or get [my book *The Java Module System* (Manning)](https://www.manning.com/books/the-java-module-system?a_aid=nipa&a_bid=869915cb).
Also, be aware that migrating to Java 9 can be challenging - check my [migration guide](java-9-migration-guide) for details.

---
title: "Does Java 22 Kill Build Tools? - Inside Java Newscast #63"
tags: [java-22, on-ramp]
date: 2024-02-15
slug: inside-java-newscast-63
videoSlug: inside-java-newscast-63
description: "Java 22 brings multi source-file execution to the platform. It allows us to run programs consisting of multiple source files and even dependencies with just a simple `java` command. For experienced developers, this will make exploration and experimentation simpler but it's a real game changer for people just learning Java or even just to program: They can now write Java code from single to multiple source files and even add dependencies before they need to consider an IDE or build tool."
featuredImage: inside-java-newscast-63
---

Hey, take a look at this:

```shell
project-folder
 └─ Hello.java

$ java Hello.java
```

So, this is a single Java source file and I'm gonna run it with just the `java` command, right?
`java Hello.java`
And it just runs, without compiling it first
But you already knew that.
Well, let me try something new:

```shell
project-folder
 ├─ Hello.java
 └─ Greetings.java

$ java Hello.java
```

Do you see that file?
`Greeting.java`?
Let's rope that one in.
I'm gonna run the same command...
Boom!
Still works.
Even changed the output.

Now, that's not all.
See this JAR there, in the `lib` folder?
Wait, let me open that up.
See that JAR there?

```shell
project-folder
 ├─ lib
 │   └─ audience.jar
 ├─ Hello.java
 └─ Greetings.java

$ java -cp "lib/*" Hello.java
```

I'm gonna use that as well.
Now, I need to change the command a tiny bit... there you go: It still works!

And there you have it:
Java 22 can launch multiple source files and even their JAR dependencies straight up without requiring us to call `javac`, let alone `jar`.
Does that toll the bell for Maven and Gradle?


## Intro

Welcome everyone, to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and to answer my own question, does this feature kill build tools?
No, of course not!
What a ridiculous, clickbaity question to ask!

But it does push their use back a bit and in the right circumstances, that's very good.
I'll explain later what I mean by that.
First, let's explore how this new feature works.
Ready?
Then let's dive right in!


## Launching Multiple Source Files

You've already seen the gist.
Since Java 11 you can in-memory compile and then launch a single source file with just the `java` launcher by passing the path to the source file.
What's new in 22 is that if that file references classes from other files, Java will go looking for them and, if it succeeds, keep compiling and executing.

Let's see how it finds those files, though.
In the example I showed you, the _initial source file_ (that's the one I passed as a launcher argument) contains no package declaration and is thus in the unnamed package.
In that case, Java considers the folder containing it the so-called _source tree root_ and will resolve all referenced classes from there:

* It will expect other classes in the unnamed package to also be directly in that root directory.
* For classes in named packages, it will map the package to a folder hierarchy in the common way, where each package name section corresponds to a folder, and anchor that hierarchy in the root, and look for the class in the resulting path.

```shell
project-folder # ③ source tree root
 ├─ org # ⑦ searched in folder hierarchy …
 │   └─ example # … that matches pkg name …
 │       └─ Audience.java # … anchored in root
 ├─ Greeting.java # ⑤ searched in root
 └─ Hello.java # ① initial source file

$ java Hello.java # ① initial source file
```

```java
// Hello.java
// ② no package declaration ⇝ unnamed package
class Hello {

	public static void main(String[] args) {
		System.out.println(
			Greeting.get() // ④ in unnamed pkg
				+ ", "
				+ org.example.Audience.get()");
				// ↑↑↑ ⑥ in a named package
	}

}
```

If classes are not found in these locations, we'll get an error.
Simple enough and corresponds to our intuition, I think.

If the initial file declares a package, the file must be in the folder hierarchy that matches the package name as just described.
From there, determining the source tree root is a bit more involved, but I'll spare you the details (this time I _did_ look them up, though), because it's just a bit of back and forth to implement the same intuition:
The folder that contains the directory hierarchy that corresponds to the package name is considered root.

```shell
project-folder # ③ source tree root based on …
 └─ org         # … walking up org/example/ …
     └─ example # … (matches the package name) …
         ├─ Audience.java
         ├─ Greeting.java
         └─ Hello.java # … from initial src

$ java org/example/Hello.java # ① initial src
```

```java
// Hello.java
// ② package name
package org.example;
class Hello { /* ... */ }
```

The cool thing about Java not simply interpreting the working directory as the source tree root is that no matter from where you launch the program and which path you have to specify to get to the main class, as long as the structure of the project is ok, the program will run.

```shell
project-folder
 └─ org
     └─ example
         ├─ Audience.java
         ├─ Greeting.java
         └─ Hello.java

# All these commands work

# from home/nipa/code/project-folder:
$ java org/example/Hello.java

# from home/nipa/code:
$ java project-folder/org/example/Hello.java

# from home/nipa/code/project-folder/org/example:
$ java Hello.java
```

## Launching With Dependencies

Adding dependencies into the mix is straightforward.
Just use the launcher option `--class-path` or its short form `-cp` and point to the folder that contains the JARs.

No, wait, that won't work, actually, because the class path doesn't understand what a folder is.
You'll have to point _into_ the folder with `$folderName/*` and at least on Linux you need to quote that to avoid expansion by the shell.
So if your JARs sit in the `lib` folder, add `-cp "lib/*"` to the `java` command; or `\` for you Windozers.

```shell
project-folder
 ├─ lib
 │   └─ audience.jar
 ├─ Hello.java
 └─ Greetings.java

$ java -cp "lib/*" Hello.java
```

```java
// Hello.java
class Hello {

	public static void main(String[] args) {
		System.out.println(Greeting.get() + ", " + org.example.Audience.get());
	}

}

// Greeting.java
class Greeting {

	static String get() {
		return "Hello";
	}

}
```


## Compilation Odds & Ends

There are few more odds and ends when it comes to compilation:

1. Java only compiles files that are directly or indirectly referenced from the initial file, which means you can have source files with compile errors lying around in the same folder hierarchy as long as you don't reference them and the program will still run.
2. There are no guarantees in which order different files are compiled or whether that even happens before or after `main` started executing.
3. This "compiling on the fly" means that you can get compile errors _during program execution_, which is something we're not used to.

And then there are a few odds and ends beyond that, but I'll leave those for you to study.
One interesting aspect hidden in these details is the design philosophy.
It's not just "make things easy", it's also "make the transitions from single-source to multi-source and from multi-source to JARs" smooth.
Those steps should feel natural and come with no or only minimal readjustments to the new situation.


## But... Why?

Now that we better understand the mechanics of multi source-file execution, let's discuss why it was introduced.
That was the work of [JDK Enhancement Proposal 458](https://openjdk.org/jeps/458), by the way, link in the description - just below the like and subscribe buttons.
Oh, and this is no preview feature, it's final in [JDK 22](https://jdk.java.net/22/).

But back to _why_.
This just does a bit of work that IDEs and build tools already do, right, so what's the point?
For experienced developers in situations where quickly setting up a new project in those tools is no hassle, there is no point.
Just keep doing what you're already doing.

But maybe you're experimenting with a new feature, are participating in Advent of Code, want to figure out the fastest way to parse 1 billion rows, or are exploring an unknown problem space in the hope of arriving at a prototypical solution.
Then a light-weight editor and a few flat files may just be the way to go; at least for a while.
And with this addition to single source-file execution, you can go much further before you need to force your exploration into a structure that a build tool is happy with - only really when you need to manage dependencies or create an artifact.

And while pausing to add some structure and set up tools may break the flow of an experienced developer, it's not much more than an annoyance.
But imagine you're just starting out, trying to understand basic programming concepts, the Java language, some APIs, and as soon as you're confident enough to write a program that spills over into a second file, you have to pause and learn what a build tool or IDE is, how it works, which one to use, how to set them up, etc.
For newbies this is a real roadblock.

I still remember how shocked and awed I felt when I first saw Eclipse and a POM.
And that's not their fault, by the way!
Properly building a project comes with complexity.
And so it's very cool that this addition defers that complexity until you actually, you know, want to build a project and not just run a bit of code.


## Outro

And that's it for today on the Inside Java Newscast.
I'm at [Jfokus](https://www.jfokus.se/) right now and we're going to record a bit more here, I reckon, so say tuned, subscribe, so you don't miss those videos and I'll see you again inb two weeks.
So long ...

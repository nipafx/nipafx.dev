---
title: "Script Java Easily in 21 and Beyond - Inside Java Newscast #49"
tags: [java-basics]
date: 2023-05-25
slug: inside-java-newscast-49
videoSlug: inside-java-newscast-49
description: "To give Java and programming beginners a better learning path, JEP 445 proposes to allow stand-alone main methods that are non-public, non-static, and don't have an args array and we're also JEP draft for multi-file programs"
featuredImage: inside-java-newscast-49
---

## Intro

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today we're gonna look at how the smallest possible Java program will soon turn from "public class Hello public static void main String bracket bracket args" to, wait for it, "void main".

```java
void main() {
	System.out.println("Hello, world!");
}
```

If you just had a deja vu, don't worry, your brain is fine (probably).
The familiarity comes from me having said almost the exact same words back in October 2022 at the beginning of Newscast #35.
Back then we already discussed why Java needs to be more beginner friendly, how a simple launch protocol with a gradual incline up to the highway of Java concepts would help, and what that could look like.
And we're talking about it again today because of the one word I changed.

> May soon turn from... \
> _May_ soon...
>
> Will soon turn... \
> _Will_ soon...

Because in the last half year, the idea has matured and its core has made it into JDK Enhancement Proposal 445, which is targeted at JDK 21.
Usually, I'd go over the whole JEP, including the motivation, but we already did all that in October, so I'm gonna spare you the repetition.
If you didn't see that episode, I highly recommend you watch it right after this one, so you understand the context of this proposal.
Today, I'll only cover the technical details.
And because that won't make for a full episode, I'm gonna break the oath Mark Reinhold made me swear on a leather-bound printout of the JLS, and talk a bit about a related JEP draft that I find very exciting.

Ready?
Then let's dive right in!


## A Relaxed Launch Protocol

Visibility and instance vs static are proper programming concepts that help us structure large programs.
For the simple scripts you'll typically find in a single source file, they're overkill, though, and come with a lot of baggage for a beginner to grok.
The `args` argument array is more useful but also often not needed early on.

So JEP 445 proposes to no longer require `public`, `static`, and `args` for its `main` method.
That means any or even all of those pieces can be absent and the launcher still identifies the method and executes the program.
If the `main` method is not static, the launcher first creates an instance on which to call the method - this means the class needs the default or an explicit parameterless constructor.
Consequently, the entry point gets simpler to "class Hello void main".

```java
class Hello {

	void main() {
		System.out.println("Hello, World!");
	}

}
```

We could now go into the exact order in which the launcher will consider `main` methods on a class as the entry point, but this is only relevant if a source file has multiple `main` methods and I think we can all agree that that's confusing.
So just don't do that - keep it simple and just have one `main`.
The only noteworthy part of that is that a `public static void main(args)` method declared in the launched class or a superclass is considered first to guarantee backwards compatibility.
And because a static main method in a superclass is a bit odd, we'll now get a warning for that.


## The Unnamed Class

Another concept that is extremely useful in everyday programming but not yet when learning Java or putting together a small script is the class.
In fact, in such situations the main class often only acts as a container of its methods and fields, similarly to how a package is a container of classes, and a module is a container of packages.
And just like we have the unnamed module and the unnamed package for situations in which explicit and named modules or packages aren't yet needed, JEP 445 proposes the unnamed class.

It allows Java source files that contain methods, fields, and even inner classes as top-level elements, meaning they don't have to be wrapped in a class.
(Imports are allowed, too, of course.)
The compiler will then just wrap everything (except the imports) in an _unnamed_ top-level class and from there on it's mostly business as usual.
An unnamed class' members can have the same modifiers as regular class' members and the modifiers have the same defaults.
And the class can have static and instance initializers.
An unnamed class resides in the unnamed package and the unnamed package resides in the unnamed module - makes sense, right?

```java
// all lines of Hello.java (i.e. no other code necessary)
import java.util.List;

String greeting = "Hello";
String audience = "World";

void main() {
	System.out.println(createGreeting());
}

String createGreeting() {
	// what's this? ~> IJN #47
	return STR."""
		\{greeting},
		\{audience}!
		""";
}

record NoReason(List<String> reasons) { }
```

That turns a simple Hello World into "void main" and off you go!
I like that so much!

```java
void main() {
	System.out.println("Hello, World!");
}
```

There are few noteworthy details, though, and I gotta admit that it's really impressive how they all naturally flow from a single property:
Just like their unnamed module and package counterparts, unnamed classes can not be referenced by name.
And this has a few purely syntactic consequences:

* they can implement no interface and extend no class besides `Object`
* no class can extend the unnamed class
* they can define no constructors
* no instances can be created explicitly

And those limitations make perfect sense for a simple program's entry point!
Because that's what the unnamed class _must_ be and so it _must_ contain a suitable `main` method.


## The On-Ramp

This proposal adds another section to the on-ramp from Java or even programming beginner to Java developer.
I like to see the single-file source code execution, introduced in Java 11, as the mid-section of that ramp and the simplified launch protocol and unnamed class as parts of its early section.
What I think is still missing here are simple ways to read from and write to the terminal (and yes, simpler than `System.out.println`) and an easy way to parse the argument array.
Interaction with the terminal was mentioned by Brian Goetz' white paper last October, so I'm sure that is being considered.

Put all that together and you got a good way to start out with a simple `main` and then progress to more methods, Java APIs, external configuration via arguments, and eventually a full-blown class with inner classes - and you can take most of those steps in any order you want.
What is still missing from that picture is the late section of the ramp, where you want to turn a single-file script into a small, local project with multiple files and maybe even third-party dependencies.
And this is where the JEP draft comes in, link in the description of course.

It's called _Launch Multi-File Source-Code Programs_ and proposes exactly that.
It would expand the `java` launcher so that you could throw multiple source files and even JARs at it and it would compile the sources in memory and launch their `main` method.
The source files could be in the unnamed package, but you can also create a package / directory hierarchy.

```
MyFirstJava
├─ app
|  └─ Prog.java
├─ util
|  └─ Helper.java
└─ Lib
	└─ library.jar
```


```java
// Prog.java`:
package app;

import util.Helper;

class Prog {
	void main() {
		Helper.run();
	}
}
```

```shell
# run with
java -cp 'Lib/*' app/Prog.java
```

This takes you from single-file scripts to multiple files, then a package structure, and maybe even dependencies somewhere along the way.
The point where this imagined on-ramp leads onto the Java highway is when you want to package your program in non-source form:
To create a JAR, you'd need to leave `java` behind and switch to `javac` and `jar`, or better yet, a build tool.
I think that's a very natural inflection point.

What's still missing, though, is a good way to _get_ the dependencies.
I mean, how do you download a JAR and its transitive dependencies without touching a build tool?
Not easily, that's for sure!
I'm curious to see whether this problem will be tackled and if so, how.


## Outro

And that's it for today on the Inside Java Newscast.
If you enjoyed the video, you can do me a favor and give it a like and if you're looking forward to Java 21, make sure to subscribe because then I'll see you in two weeks with a rundown of all its features - it's gonna be wild!
Don't believe me?
Here's a little preview.

(What's happening?) \
(What's happening?) \
WHAT'S HAPPENING?!

---
title: "The Simplest Hello World - Inside Java Newscast #35"
tags: [project-amber]
date: 2022-10-06
slug: inside-java-newscast-35
videoSlug: inside-java-newscast-35
description: "Visibility, classes, methods, instance and static members, parameters - a newcomer to programming needs to learn all of these concepts to truly understand a simple hello-world program in Java. Time to make that simpler and cut down on what needs to be known up front."
featuredImage: inside-java-newscast-35
---

## Intro

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today we're gonna look at how the smallest possible Java program may soon turn from "public class Hello public static void main String bracket bracket args" to, wait for it, "void main".

Right?!
That we get to see the day!
But there's a lot more to this than meets the eye and before getting to the technical aspects we need to explore why and for whom this set of changes is being proposed.
Because we'll also see that it's not actually just one change, but a set of them packaged together.
Ready?
Then let's dive right in!

## Target Audience

If you're watching this channel, chances are high that you have at least a few years of experience coding with Java and feel very at-home with the language.
Then this change is not proposed for you!
Yes, us experienced Java devs will have it easier to write scripts in Java, something I find really refreshing, but that's just a bonus.
We're not the target audience!

Then who is?
Students!
Newcomers to Java or even to programming.
People who can really benefit from a quick win and see their first piece of code working immediately without wading through a lengthy tirade about visibility, classes, instances, and so forth or, worse, "just install this IDE", which might very well be the most complex app they've ever launched.
For them, every concept that they don't have to learn upfront is a win.
So let's talk about those concepts.

## Concept Overload

Looking at a small Java program, here's what's staring back at you:

* visibility
* classes
* methods and their
	* visibility
	* static-ness
	* return type
	* a special name
	* and parameters
* finally the convoluted `System.out.println`

That's a lot to grok, particularly if it's the first time you're writing code, ever.
And yes, you can tell a beginner to "just ignore all that", but that kills the very curiosity that drives learning.

A few days ago, Brian Goetz, Java Language Architect at Oracle, and his team published [a design document][on-ramp-doc] that he has also sent to the Project Amber mailing list.
Instead of expecting beginners to jump on the highway of Java concepts, it proposes to build an on-ramp.
Let's change the Java launch protocol in a way that

* (a) users can write a Java program on a small set of concepts (not necessarily the smallest one, though)
* (b) new concepts can be learned in the order in which they appear useful to the beginner
* (c) there's no unlearning, no subtle "this works differently now", as they drive up the on-ramp

So let's see how to make the launch protocol more tolerant, so it can support these goals.

[on-ramp-doc]: https://openjdk.org/projects/amber/design-notes/on-ramp

## A More Tolerant Launch Protocol

Let's tackle this inside out, which also happens to sort this in order of increasing excitement.

First and least, `System.out.println()` is stupid long and let's not even talk about what you need to do to create a simple `readln()` equivalent for `System.in`.
So the proposal is to create two static methods `println()` and `readln()` that will then be auto-imported.

Next up is `main` itself.
Skipping some details, the idea is to make most of the magic incantations optional:
`args`, `static`, `public` - some or all can be absent and the launcher will still find the `main` method in a class in the unnamed package, which is where simple scripts usually start out.
Like this entire proposal, this will of course be structured so that old programs behave like they always did - it's all 1000% backwards compatible.

Finally, and most extravagant, is the proposal to drop the requirement for `main` and other methods in the same file to be wrapped into a class.
Yes, you got that right, free floating methods!
But just in the freshly minted concept of the _unnamed class_, so nothing to put into your IRL project.

There are two cool things at play here:
One is that `void main` is so much simpler than the full sing-song - learn about methods as containers for statements and off you go.
The other is that there's a natural progression to a regular program!

* Need arguments?
  Great time to learn how they work and add `args`.
* Need to simplify code?
  Learn how to create more methods, how to pass arguments and results.
* Need shared state?
  Add fields!
  (Yes, the unnamed class can have fields.)
* Need more functionality?
  Explore JDK APIs beyond `println` and `readln` and how to import and use them.
* Need a better structure?
  Take all you already learned, wrap a class around it, and put it into a separate source file.
* Even more structure?
  Now's the time for packages and visibility.

So not only many small steps, most don't even require a specific order!
The beginner can start simple and then add concepts as they're needed to accomplish a goal.
So cool!

## What Is This?

If this isn't your first Inside Java rodeo you might have noticed the curious absence of the words "JDK Enhancement Proposal".
That's because this isn't one yet.
The idea of an on-ramp has been stewing in the whiteboard phase for a while and has just now graduated into a Project Amber design document.
That means it's still very early and lots of things can evolve or be dropped before we see any actual change.

So now is a good time to chime in!
Not from a code golf, "how can we get rid of every character"-perspective, but with the intent to provide future developers the best possible way to learn programming with Java.
There are links to the document, [to Brian's email][on-ramp-mail], and to the [Project Amber mailing list][amber-list] in the description.

[on-ramp-mail]: https://mail.openjdk.org/pipermail/amber-spec-observers/2022-September/003715.html
[amber-list]: https://mail.openjdk.org/mailman/listinfo/amber-spec-observers

## Outro

And that's it for today on the Inside Java Newscast.
Since you made it all the way to the end, you probably liked the video - why not let YouTube know?
Also, subscribe, click the bell, and don't forget to share this video with your friends and enemies.
In two weeks is JavaOne and I'll be pretty busy with that, so I'll see you again in four.
So long...

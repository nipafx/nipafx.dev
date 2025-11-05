---
title: "Try the New Valhalla EA Build - Inside Java Newscast #100 "
tags: [project-valhalla]
date: 2025-11-06
slug: inside-java-newscast-100
videoSlug: inside-java-newscast-100
description: "JEP 401, Value Classes and Objects, has recently re-entered \"candidate\" status and is getting ready to target a release."
featuredImage: inside-java-newscast-100
---

One
Hundred
Episodes
Wow!
Thank you so much for watching, y'all, I really appreciate that.
And we'll celebrate it later when I'll be answering your questions about this show but first, let's talk about Valhalla!

<!-- logo -->

Welcome everyone to Inside Java Newscast number one hundred - sorry, I just had to say it again - where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and last time I asked you how to celebrate the jubilee and the most requested single topic was Valhalla often plus "when" and your wish is my command, so we'll address both today.
"We" is me on Valhalla, including the new EA build that was released last week, and then later Brian Goetz himself on the "when" part.
After that, it's time to crack open a drink and chat.

Ready? Then let's dive right in.

## Reset

So, Valhalla.
This is a huge project!
OpenJDK dubbed it _Java's biggest refactor_, and there have been countless talks, articles, videos, and even prototypes about it, so pretty much everybody has an idea what all this is about.
But the issue there is that that idea may not fit the project's evolved understanding of the subject matter nor the plan that has formed for rolling out its features piece by piece and I'm worried that lead to expectations that won't be met in the short term or in some parts even in the long term.

So today I want to do a reset.
For the next couple of minutes, take everything you know about Project Valhalla and put it aside.
The _more_ you know about Valhalla, the more I'm asking you to do this - blank slate.
We'll focus on what's right in front of us and then come back to the bigger picture later.

So what _is_ right in front of us?
JDK Enhancement Proposal 401 and the Valhalla early-access build that was released last week.

## JEP 401 - Identity

JEP 401 takes on one of Java's core beliefs: "everything is an object".
Or rather "everything has identity", because up to now both statements meant the same.
What do I mean by that?

Primitives aside, every _thing_ in Java is an instance of a class, and every such instance has an identity that sets it apart from every other instance in the system, even if it is of the same type and represents the same value.
The classic example is that if you create two `new Integer(5)`, then these clearly represent the same value (5) but are still not the same thing.
And Java recognizes this by having a call to `equals` return `true` whereas the comparison with two equal signs, also called identity comparison, is `false`.

Identity comes with a few nice features.
One of them is mutability - only if an instance has identity, does the concept of mutating it even make sense.
Because if all you have to identify an instance is its value, then changing the value makes it a different instance.
But that's not what we want when we mutate an object.

Say you have a `User` instance that is referenced by a local variable, a field somewhere, as well as a list that it was put in.
If you change the user's name, you naturally expect that change to be visible to code that uses either the local variable, the field, or the list to take a look at the user.
Just saying that out loud feels kinda stupid - what else could happen?
Well, if the `User` instance didn't have identity, then all users with the same values, let's assume that's just the name, so all users with the same name look the same.
You change one, then what?
Now the variable and the field reference users with different names or do somehow all users with the same old name get updated even if having the same name was a coincidence?

So identity allows for mutability and the way the runtime manages that is through unique memory locations and references to them.
That, too, is very natural to us.
There is one `User` instance somewhere and the variable, field, and list in the example just reference it, so when one of them mutates it, there is only one memory location to update and all references to it see the new value.

Other data that are connected to identity are the identity hash code (probably not too surprising), monitor lock status, and information the garbage collector needs to track objects, all of which are stored in 8 to 16 bytes that precede each instance's actual data - this is called the object header.

But all that doesn't come for free.
That object header is not something that the application logic cares about, so from its/our perspective that's overhead and makes the memory less densely populated with the data we actually care about.
And that instances are always connected by references makes the memory... hilly? Whatever the opposite of "flat" is.
So, for example, an `ArrayList<Integer>` is not actually backed by an array containing numbers, it's backed by an array of references that point all over the heap to the `Integer` instances that wrap the actual numbers.
This leads to more cache misses, more memory loads, and an overall worse performance - depending on use case, considerably so.

But identity is not just a performance hazard:

* It also means that every object is by default mutable and we need to do extra work to make it immutable.
* We can use `synchronized` on _every_ object even though we probably shouldn't.
* And being able to somehow distinguish two things that are supposed to be the same, say two `LocalDate` instances representing the same day, can lead to bugs, for example through a surprisingly failing `==` comparison.

So identity comes with a bunch of features and drawbacks.
The critical observation is that the features are often not needed.
There is no domain-specific reason why two `Integer(5)`s or two `LocalDate`s for the same day should ever be distinguished.
And that holds for a lot of the classes we create, too, particularly if you're programming in a more functional or data-oriented manner.
I'd go out on a limb and claim that most classes that only have final fields, don't actually want to have identity.
And this is where JEP 401 places its lever.

## JEP 401 - Values

The syntax change [JEP 401](https://openjdk.org/jeps/401) proposes is laughably small, blink and you'll miss it:
It would allow us to place the contextual keyword `value` in front of `class` or `record`, which means instances of those classes have no identity.
And that's it.
That's all of it.
From that semantic (not performance-driven) semantic decision to give up identity for a class' instances follows everything else - and that's quite a lot.
Too much, in fact, to discuss it all here, so I'll just touch on a few essential points.
As always, JEP 401 is excellently written, so I strongly recommend to give it a read if you're interested in this topic.

So let's go over a few details of the proposal:

1. We get more nuanced nomenclature:
   An instance of a value class is called a _value object_ and an instance of a "regular" class is now called an _identity object_.
2. That aside, value classes are mostly like identity classes: they extend `Object` and inherit its methods, can have fields and their own methods, can themselves be abstract and implement interfaces, and so forth.
   We'll of course focus on the differences but don't let that distract you:
   They're still a whole lot like regular classes, including the mental model of references.
3. One of the differences is that a value class as well as all of its fields are implicitly final, making it shallowly immutable.
   Of course if a final field references a mutable data structure like a hash set, that set does not magically become immutable, too - hence "shallowly".
4. Since value objects don't have identity, the comparison with two equal signs can't compare identity (duh) and so it will compare all field values.
   Still, this should _not_ be the default comparison mechanism - value classes can have a meaningful `equals` implementation that doesn't rely on field-wise equality and other code should default to calling that to figure whether two instances are equal.
5. Other identity-sensitive operations won't work.
   For example, synchronizing on a value object will lead to an error - at compile time if possible, otherwise at run time.
6. Lastly for now, around 30 JDK classes turn into value classes, among them the primitive wrappers, `Optional`, and a bunch of `java.time` classes.
   Unfortunately, `String` could not come along for the ride - its identity-sensitive operations are used too frequently in existing code to make that change.

Of course JEP 401 explores these topics in more depth and also goes into safe construction, migration, and finally run-time optimizations.
I'll let Brian speak to the latter but before I hand it over to him, let me point you to [jdk.java.net/valhalla](https://jdk.java.net/valhalla/) where you'll find the latest Project Valhalla early-access build, which demonstrates everything we just discussed as well some of the optimizations Brian will lay out.
I can only recommend you give it a try.
If you do so, note that you need `--enable-preview` to observe any of the changes.
Ok, time to let Brian Goetz, Java Language Architect and lead of Project Valhalla, get a word in on performance as well as on the infamous question "Valhalla, when?"

## Remainder

Neither Brian's segment nor the Q&A was scripted, so you'll have to watch the video.
Here's the full chapter list:

* [0:00](https://www.youtube.com/watch?v=Eua3nTkye2Y&t=0m00s) Intro
* [0:52](https://www.youtube.com/watch?v=Eua3nTkye2Y&t=0m52s) Reset
* [1:46](https://www.youtube.com/watch?v=Eua3nTkye2Y&t=1m46s) Identity
* [5:48](https://www.youtube.com/watch?v=Eua3nTkye2Y&t=5m48s) JEP 401
* [8:50](https://www.youtube.com/watch?v=Eua3nTkye2Y&t=8m50s) Valhalla, when?
* [9:19](https://www.youtube.com/watch?v=Eua3nTkye2Y&t=9m19s) Present Optimization
* [11:01](https://www.youtube.com/watch?v=Eua3nTkye2Y&t=11m01s) Future Optimizations
* [12:09](https://www.youtube.com/watch?v=Eua3nTkye2Y&t=12m09s) IJN Q&A
* [24:29](https://www.youtube.com/watch?v=Eua3nTkye2Y&t=24m29s) The Java DevRel Team at Oracle
* [27:10](https://www.youtube.com/watch?v=Eua3nTkye2Y&t=27m10s) Outro


---
title: "Java 17: Features and Development - Inside Java Newscast #6"
tags: [java-17, openjdk]
date: 2021-06-10
slug: inside-java-newscast-6
videoSlug: inside-java-newscast-6
description: "Java 17, the next long-term support release, enters feature freeze and the release preparations begin today (June 10th). A good time to take a closer look at the list of JEPs as well as the development process."
featuredImage: inside-java-newscast-6
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog and later you'll get too see Jose Paumard, we're both Java developer advocates at Oracle.
Today, we got two topics for you:

1. the list of JEPs that made it into JDK 17 and
2. the release process that governs the work on JDK 17 for the next three months

Ready?
Then let's dive right in!

## JDK 17 JEPs

Thanks Nicolai!
Indeed we have the list of [the happy selected JEPs](http://openjdk.java.net/projects/jdk/17/) which will make it to the [JDK 17](http://jdk.java.net/17/).
JDK 17 is scheduled for next September and there are some really cool and exciting features in it.
14 JEPs are selected, some of them have a direct impact on the code you are going to write and I would like to focus on these.

### JEP 409: Sealed Classes

My preferred feature is the addition of the sealed classes, which is [JEP 409](https://openjdk.java.net/jeps/409).
Sealed Classes are part of the Amber project and is one more step towards pattern matching.

```java
sealed interface Shape
	// only these types can directly
	// extend/implement `Shape`
	permits Circle, Triangle, Rectangle { }

non-sealed interface Circle extends Shape { }

non-sealed interface Triangle extends Shape { }

non-sealed interface Rectangle extends Shape { }
```

### JEP 406: Pattern Matching for `switch`

Speaking of pattern matching there is one more JEP, [406](https://openjdk.java.net/jeps/406), which is a preview feature called pattern matching for switch.
This is also one more step towards pattern matching.

```java
//  `switch` expression
// + pattern matching (here: type patterns)
String message = switch (object) {
	case null -> "oops";
	case String s -> "look: " + s;
	case default -> "dunno?";
};

//  `switch` expression
// + pattern matching (here: type patterns)
// + sealed classes
String description = switch (shape) {
	case Circle -> "round thing";
	case Triangle -> "3-pointy thing";
	case Rectangle -> "4-pointy thing";
	// the compiler knows that
	// there are no other shapes
	// ⇝ no default branch needed
}
```

You may be thinking well that's one more step plus one more step, sounds like two more steps?
How many one more steps do we need to have complete pattern matching?
Well that's a tough question but there will be more one more steps that's for sure!
So stay tuned for more.

### JEP 415: Context Specific Deserialization Filters

These first two JEPs will impact every Java developer.
Several JEPs are very interesting but maybe not for everyone.
For instance [JEP 415: Context-Specific Deserialization Filter](https://openjdk.java.net/jeps/415).
You may remember that JDK 9 introduced the concept of deserialization filter to enable the validation of incoming serialized data, coming from untrusted sources.
You know that serialization may be the source of many security issues, and this filtering is done at the JVM level.
This JEP gives you more possibilities in this field than what was available in Java 9.

### JEP 356: Enhanced Pseudo-Random Number Generators

[JEP 356: Enhanced Pseudorandom Number Generators](https://openjdk.java.net/jeps/356) just does that: add new random number generators algorithms to the JDK.

### JEP 306: Restore Always-Strict Floating-Point Semantics

[JEP 306: Restore Always Strict Floating Point Semantics](https://openjdk.java.net/jeps/306).
It has to do with how your floating point calculations are conducted on the Floating Point Unit of your CPU.
Sometimes you write your calculation using the `float` primitive type, but it is really executed in `double` by this FPU.
This can lead to slightly different results maybe it's not too bad for your application but maybe it is so this.
This JEP is there to ease the development of your numerically sensitive code.

### JEP 382 & JEP 391

Some other JEPs are welcome evolutions of the platform.
New MacOS rendering pipeline is [JEP 382](https://openjdk.java.net/jeps/382) and the MacOS aArch64 port is [JEP 391](https://openjdk.java.net/jeps/391).

### Nostalgia

Some others deprecate or remove old or not that much used features of the platform.
This is the nostalgic part of the newscast.
RMI activation is removed with [JEP 407](https://openjdk.java.net/jeps/407) and the Applet API is deprecated for removal with [JEP 398](https://openjdk.java.net/jeps/398).
And that means something for all people that started with Java by writing Applets.

What are you telling me "Good Riddance"?

The experimental Ahead of Time and Just in Time compilers that were added to the JDK 9 as an experimental feature are also removed with [JEP 410](https://openjdk.java.net/jeps/410) and the Security Manager is not removed but deprecated for removal - that's the [JEP 411](https://openjdk.java.net/jeps/411).

(More on that in [Inside Java Newscast #5](/inside-java-newscast-5).)

### JEP 403: Strongly Encapsulate JDK Internals

One more sensitive JEP is [JEP 403: Strongly Encapsulated JDK Internals](https://openjdk.java.net/jeps/403).
This JEP is the successor of JEP 396 and it strongly encapsulates all internal elements of the JDK except for critical internal APIs as defined and listed in JEP 260, which includes sun.misc.Unsafe.
So just to be clear sun.misc.Unsafe remains available.

### JEP 412 & JEP 414 (Project Panama)

And we have two more incubator JEPs.
The first one is the [Foreign Function & Memory API JEP 412](https://openjdk.java.net/jeps/412) delivered by the project Panama.
This JEP aims to bring a replacement of JNI the Java Native Interface with this new API in a nutshell this API is about accessing memory outside of the heap, and call functions written in another language.
You can already do that with ByteBuffer and JNI but the patterns given by this new API are safer.
So if you need that in your code you should definitely check this JEP.

And the last incubator JEP is the [JEP 414: Vector API](https://openjdk.java.net/jeps/414) nothing to do with `java.util.Vector`.
It's about bringing SMID parallel computations capabilities to the JDK which is great.
If you want to learn more on this topic there is [an episode of the Inside Java Podcast](https://www.youtube.com/watch?v=HARDCbSog0c) about it with John Rose and Paul Sandoz, there is a more [in-depth talk](https://www.youtube.com/watch?v=VYo3p4R66N8) by Sandia Viswanathan and Paul Sandoz on this topic also, and [the newscast by Nicolai Parlog](/inside-java-newscast-2), all available on this channel.

And now I need to send you back to the studio, and I can't say I'm super comfortable with it.
Nicolai, can I leave it to you?


## JDK 17 Development

Today, June 10th, the JDK 17 repo gets forked and rampdown phase 1 starts.
But... what exactly does that mean?
I didn't know myself, so I looked into it and here's the summary.
If you want to know _all_ the details, check out [JDK Enhancement Proposal number 3 on the JDK Release Process](https://openjdk.java.net/jeps/3).
As usual, you'll find a link to that in the description.

Rampdown Phase 1
* starts Jun 10th ~> 5 weeks
* fix: current P3+ code bugs
* optional: targeted P3+ code bugs
* optional: P* test/doc bugs

Rampdown Phase 2
* starts Jul 15th ~> 3 weeks
* fix: current P2+ code bugs
* optional: P* test/doc bugs
* apply _fix-request process_

Release Candidates
* starts Aug 5th ~> 2+4 weeks
* fix: current P1 code bugs
* apply _fix-request process_

General Availability
* on Sep 14th

### Issues

Let's start by talking about the issues, which include new features, all kinds of improvements as well as bugs of course.
Somewhat confusingly, though, the OpenJDK community usually refers to all of them as bugs - yes, even new features like the ones Jose just described.
Sticking with the official terminology used in JEP 3, I'll do that as well, but keep in mind that not all bugs are actually _bugs_.
Anyway, OpenJDK tracks bugs in a JIRA instance referred to as the _JBS_, [the _JDK Bug System_](https://bugs.openjdk.java.net/secure/Dashboard.jspa).

In the context of an upcoming release, 17 at the moment, bugs fall into two categories:

* _current_ bugs relate to recent work and only affect the upcoming release
* _targeted_ bugs are older - they affect already released JDK versions and are planned to be fixed in the upcoming one

Besides that, bugs have one more property that's important to our inquiry and that's the _priority_, which ranges from P1, the most important, down to P5.

### Repositories

Now let's quickly talk about the OpenJDK repositories.
They're hosted on GitHub under [the OpenJDK organization](https://github.com/openjdk/) and there are quite a few of them but the most important one is [the JDK main line](https://github.com/openjdk/jdk), simply called _jdk_.

And this is where a new release's journey begins.
Each June and December the mainline is forked into a stabilization repository called _jdk$VersionNumber_, so today that's gonna be _jdk17_ - the fork works very much like a release branch.
This is also the time when the release process officially starts.
It stabilizes the upcoming release and minimizes the risk of introducing new problems by only working on increasingly important fixes under an increasingly strict process.
Usually, these fixes will be developed in the stabilization fork and then ported to the main line.

### Rampdown Phase 1

Rampdown phase 1 starts with the fork and lasts a few weeks - for JDK 17 that's gonna be five.
All code-related bugs with a priority of P4 or lower (meaning less important) won't be fixed before the release.
Of the remaining P1-3 bugs, the focus is on the current ones (meaning those that were recently introduced).
Addressing targeted bugs (which remained from older releases) is optional.

If a JDK developer deems a bug with priority 1 or 2 to take too long or be too risky, they can use the _bug-deferral process_ to potentially push the bug to a later version.

In this phase, bugs of any priority that only affect tests or documentation may be still be fixed.

### Rampdown Phase 2

Rampdown phase 2 works a bit differently from rampdown phase 1 and tightens the screws.

First, only current bugs can be worked on.
Targeted bugs will be fixed in the future.

Second, the priority requirements are stricter:
Priority 3 is out and only bugs with priorities 1 and 2 will be worked on.
For code that goes into the released JDK, that is, test and documentation bugs of all priorities can still be fixed.

And third, the _fix-request process_ must be used to decide whether a bug will be worked on.
This process involves a group or area lead who will help make sure that fixing the bug for the upcoming release is a reasonable idea.

For JDK 17, rampdown phase 2 lasts three weeks until August 5th.

### Release Candidates

And on that fine first Thursday in August, the first JDK 17 release candidate will be built.
After that, only the most critical bugs can be addressed.
To be fixed,

* a bug must be current
* it must be priority 1
* it must have passed the aforementioned _fix-request process_
* and it must actually impact released code

The hurdle is intentionally steep to make sure the release candidate is kept stable.
But if further bugs are discovered and fixed, new candidates will of course be released.

Hopefully all remaining problems will be found and fixed within the next two weeks, so that on August 19th the final release candidate can be built.
And that's it!
Ideally, while more and more projects start building against the release candidate, nothing critical is found and after a few weeks, four in this case, the new JDK version reaches general availability and the release candidate is promoted to be the actual release.
For JDK 17, that's gonna be September 14th.

17 is of course also the next long-term support version and we planned to go into that as well, but you've suffered through enough process details for one episode, so we'll talk about that one in two weeks.
If a lengthy explanation of who fixes what in which forks isn't a reason to subscribe, I honestly don't know what is.

<!--
Development takes place in Git repo, hosted on https://github.com/openjdk/

Issue properties:

* _affected version_ is the oldest known version impacted by the bug
* _fix version_ defines in which version's time frame the bug is fixed
	https://twitter.com/odrotbohm/status/1393215997918781441
* _priority_: P1 is most important, down to P5

Issue categories:

* _current_: affected version = current version
* _targeted_: affected version < current version

Release cycle starts in June and December:

* fork mainline into stabilization repository jdk$N
	* feature set is frozen
	* no more JEPs are targeted
	* if low-risk, missing functionality and usability improvements can be added via _late-enhancement request process_, but "the bar is very high in RDP 1 and extraordinarily high in RDP 2."
* rampdown phase 1 (five weeks for 17)
	* current P3+ bugs get fixed
	* current P2+ bugs that take too long or are too riskym get deferred via _bug-deferral process_
	* targeted P3+ bugs get fixed if time permits or can be dropped by changing _fix version_
	* P4- bugs should be dropped by changing _fix version_
	* P* bugs that only affecting tests or documentation may be fixed
* rampdown phase 2 (three weeks for 17)
	* current P2+ bugs get fixed via the _fix-request process_
	* current P2+ bugs that take too long or are too risky get deferred via _bug-deferral process_
	* targeted P2+ bugs should be dropped by changing _fix version_
	* P* bugs that only affecting tests or documentation may be fixed
* initial release candidate (two weeks for 17)
	* current P1 bugs get fixed via the _fix-request process_
	* current P1 bugs that take too long or are too risky get deferred via _bug-deferral process_
	* targeted P1 bugs should be dropped by changing _fix version_
-->


## Outro

And that's it for today on the Inside Java Newscast.
If you have any questions about what Jose and I covered in this episode, ask ahead in the comments below and if you enjoy this kind of content, help us spread the word with a like or by sharing this video with your friends and colleagues.
I'll see you again in two weeks.
So long...

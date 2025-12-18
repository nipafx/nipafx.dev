---
title: "Java's 2025 in Review - Inside Java Newscast #103"
tags: [project-amber, project-babylon, project-leyden, project-loom, project-panama, project-valhalla, community, java-25]
date: 2025-12-18
slug: inside-java-newscast-103
videoSlug: inside-java-newscast-103
description: "With 2025 coming to a close, let's summarize Java's year and look at the current state of the six big OpenJDK projects as well as a few other highlights."
featuredImage: inside-java-newscast-103-a
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today - with the end of the Gregorian year fast approaching - we're looking back at Java's highlights of 2025.
Or maybe they're just my Java highlights?
This will mainly be about what the six big OpenJDK projects accomplished this year.
Your Java highlights are probably pretty different - I'm looking forward to reading your comments.
And as for what these projects will work on in 2026, I'll go into that in the next episode.

But now, Java's best of 2025.
Ready?
Then let's dive right in!

<!-- logo -->

## Projects Panama and Loom

Let's start with two projects with very different goals that have in common that they already mostly achieved them, so we can quickly check them of the list:

* [Project Panama](https://openjdk.org/projects/panama/) wanted to interconnect JVM and native code and finalized the foreign function and memory API already last year in JDK 22.
  It still has the [vector API](https://openjdk.org/jeps/529) in the fire, but this is less of a forge and more of a purgatory where vectors have to wait until Valhalla unlocks value types so they can become those.
* [Project Loom](https://wiki.openjdk.org/display/loom/Main) was all about better concurrency and by now delivered most of what it worked on.
  JDK 25 [finalized scoped values](https://openjdk.org/jeps/506) and gave the structured concurrency API a do-over that kept it in preview [all the way through JDK 26](https://openjdk.org/jeps/525).

So both projects only have a single, mature feature still brewing.


## Project Babylon

On the other end of the project arc, we have [Babylon](https://openjdk.org/projects/babylon/), which formed in late 2023 and pushed its first [prototype](https://github.com/openjdk/babylon/tree/code-reflection/test/jdk/java/lang/reflect/code) in January 2024.
Since then it has diligently worked towards a release, including updates to the prototype, but there are no JDK Enhancement Proposals, yet - not even in draft.
Babylon's goal is "to extend the reach of Java to foreign programming models such as SQL, differentiable programming, machine learning models, and GPUs", obviously the last two of those are the current focus.
Babylon wants to achieve that with _code reflection_ and the _Heterogeneous Accelerator Toolkit_ (HAT for short) - I'll explain how in the next episode.
If you cannot wait that long, check out [Gary Frost's talk from JavaOne 2025](https://www.youtube.com/watch?v=qkr3E27XYbY), which brings me to a highlight of _my_ year.


## JavaOne

JavaOne is not just any conference - it's _the_ Java conference.
Or at least it's supposed to, but, frankly, Europeans are much more eager to go to Java conferences than US Americans are right now and so European conferences dwarf what's taking place in the States.
But even a smaller JavaOnce is special.
For me because I'm involved but also for the larger community because it's the only conference where you'll meet all the Java architects.
And I'm not just talking about Brian Goetz or Stuart Marks, either.
In 2025 we also had Mark Reinhold, John Rose, Ron Pressler, Viktor Klang, Per-Ake Minborg, and so many, many more.
Of course there'll also be [sessions by community luminaries](https://reg.rf.oracle.com/flow/oracle/javaone26/catalog/page/catalog) like Venkat Subramaniam and Josh Long.
If you want to dive deep into where Java is today and where it's going tomorrow, this is the place to be.

For 2025, that chance has passed, but we got [all the talks in a playlist](https://www.youtube.com/playlist?list=PLX8CzqL3ArzVV1xRJkRbcM2tOgVwytJAi), linked in the description.
For 2026, I got good news for you!
[Ticket sales are open](https://www.oracle.com/javaone/register/) and currently discounted but if you order before December 23rd, you'll also get a free, limited-edition JavaOne backpack.
But wait, that's not all - if you go to [javaone.com](https://www.oracle.com/javaone/) now and click _register_ to buy a ticket, you get my personal permission to tell Billy how ridiculous his hair looks when you come to the Bay Area in California from March 17th to 19th.
I'll see you then.


## Project Amber

[Project Amber](https://openjdk.org/projects/amber/) differs from other OpenJDK projects in that it doesn't have a specific goal that it wants to accomplish and then shut down.
Instead, it looks at the whole language and aims at making it more expressive and thus our code less verbose.
As such it introduced a lot of features over recent years, like, a lot, but they're not completely arbitrary, either.
A bug chunk of them fall under pattern matching, with the on-ramp being a second, smaller category.

In 2025, Amber shored up the remaining work in these categories:

* for pattern matching it progressed the [preview of primitive patterns](https://openjdk.org/jeps/530) in JDKs 25 and 26
* for the on-ramp, JDK 25 finalized [compact source files, simplified `main`](https://openjdk.org/jeps/512), and [module imports](https://openjdk.org/jeps/511)
* the mostly stand-alone feature of [flexible constructor bodies](https://openjdk.org/jeps/513) also finalized in JDK 25

That means, with primitive patterns, Amber is currently only previewing a single feature - something that hasn't happened since JDK 18.
So you can really tell that, in 2025, Amber is transitioning from its phase 1 that focused on pattern matching and the on-ramp to a phase 2 and we'll see in the next episode what that will be about.


## Project Leyden

Only two and a half years after its inaugural mail to an OpenJDK mailing list, [Project Leyden](https://openjdk.org/projects/leyden/) started shipping features in 2025.
JDK 24 introduced the ahead-of-time cache, containing [loaded and linked classes](https://openjdk.org/jeps/483), and 25 added [method profiles](https://openjdk.org/jeps/515) to it and simplified the cache creation process by allowing us to fuse the observation of a training run and the assembly of the cache [into a single step](https://openjdk.org/jeps/514).
If you want to understand how to apply this at scale, at JavaOne 2026, Danny Thomas and Martin Chalupa will tell us how they're putting it into practice at Netflix.
Getting the AOT cache off the ground was definitely a highlight of 2025 and I'm curious to see what Leyden will accomplish next year.

As a bit of a preview for that, Leyden also released an early-access build in August of this year.
It contains a lot more optimizations than current JDKs and can [reduce startup time by 60 to 75%](https://www.youtube.com/watch?v=Oo96adJirPw).
There's a link in the description if you want to kick the tires.


## Java 25

With Amber and Leyden pushing a number of features into JDK 25, it has been [another great release](https://jdk.java.net/25/).
Add on top that Oracle and other vendors offer long-term support and we got another highlight of Java's year.
In fact, we in the DevRel team were so enthusiastic about Java 25 that we created the RoadTo25 video series that goes over pretty much everything that changed between 21 and 25.
Beyond that, a bunch of us traveled to Redwood Shores to live-stream the release from there with a bunch of great guests from OpenJDK as well as the wider Java community.
Those live streams are always a highlight of my year, I love those.
There are links to [RoadTo25](https://www.youtube.com/playlist?list=PLX8CzqL3ArzXJ2_0FIGleUisXuUm4AESE) as well as to the [live stream](https://www.youtube.com/watch?v=duIceCXObrA) in the description.

<contentvideo slug="road-to-25-upgrade"></contentvideo>


## Deprecations

2025 was also pretty big on removals:

* JDK 24 [permanently disabled the security manager](https://openjdk.org/jeps/486)
* JDK 25 [removed the remaining 32-bit ports](https://openjdk.org/jeps/503)
* JDK 26 [will remove the applet API](https://openjdk.org/jeps/504)

Particularly the first two will considerably reduce OpenJDK's maintenance obligations and allow it to spend more resources on moving Java forward.

There was also progress towards integrity by default:

* the memory access methods of `sun.misc.Unsafe` [issue warnings when invoked](https://openjdk.org/jeps/498)
* reflective mutation of final fields [starts requiring command-line options](https://openjdk.org/jeps/500)

I gotta say, the longer I hang around OpenJDK, the more I appreciate this kind of work.
Maybe my highlight of 2025 is disabling the security manager.
Analyzing the ecosystem's costs and benefits of this decision, communicating its removal, withstanding a bit of pushback, and patiently executing a year-long plan - that's pretty impressive.

## Project Valhalla

That leaves us with [Project Valhalla](https://openjdk.org/projects/valhalla/).
How much I wish I could tell you that this was the year where it started shipping features - that would've definitely been my highlight, but... it wasn't.
The path forward is pretty clear now, though:

* introduce value types - that's JEP 401
* allow null-restriction
* take primitives as close to non-nullable value types as possible - that's JEP 402

Will we see any of that in 2026?
I don't know but I will make a guess in the next episode.
Which is scary to say because I don't know yet which way I will guess and I doubt any new information will come to light in the next couple of weeks.
So, tune in to watch me embarrass myself, I guess.

Until then, have a great end of the Gregorian year, enjoy your time off if you take any, let me know in the comment what your Java highlight of 2025 was, and I'll chat with you down there.
Otherwise, I'll see you again in 2026.
So long...

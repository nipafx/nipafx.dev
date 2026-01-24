---
title: "Java's Plans for 2026 - Inside Java Newscast #104"
tags: [project-amber, project-babylon, project-leyden, project-loom, project-panama, project-valhalla]
date: 2026-01-08
slug: inside-java-newscast-104
videoSlug: inside-java-newscast-104
description: "In 2026, Java keeps evolving. Here's how the big OpenJDK projects Amber, Babylon, Leyden, Loom, Panama and Valhalla plan to push Java forward."
featuredImage: inside-java-newscast-104
---

> This news show has over a hundred episodes but never actually broke any news.
> Let's change that!
> I'll tell you a few things about Amber, Leyden, and Valhalla that will make your head spin.

<!-- logo -->

Happy Gregorian new year, everyone, and welcome to the Inside Java Newscast, where we cover recent (and in this case future) developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about Java's plans for 2026 or, more specifically, what the big OpenJDK projects Amber and Babylon, Leyden and Loom, Panama and Valhalla will be working on this year.
But before we get started, a few notes:

* I'll talk about what features these projects will be _working on_ this year but that by no means implies that they're gonna be _released_ this year, so let's be patient.
* If you want to speed things along, you actually can:
  Find a feature that interests you and is in some form of preview, try it out in as close to production as you can get get, and give feedback.
* If you want to follow these developments along, subscribe to this channel, make it a habit to check in on inside.java, or come to JavaOne in March and talk to the very people spear-heading these projects.
  There's a 50$ discount code in the description.
* Also in the description of course, you'll find links to all projects, mailing lists, and everything else I mention in this episode.

Ready?
Then let's dive right in.


## Project Valhalla

Let's start with the big news.
Late last year, I reached out to the people working on these projects to confirm my understanding of what their plans for the year are.
What I didn't expect is that a whistleblower came forward to give me inside scoops on [Valhalla](https://openjdk.org/projects/valhalla/) ([mailing list](https://mail.openjdk.org/mailman/listinfo/valhalla-dev)), Leyden, and Amber.
This is dangerous business, of course, so I have to keep them anonymous.

> You should go download the Valhalla early-access build and send hands-on feedback as we work to polish the implementation for an upcoming release train.
> The upcoming release train will not be 27, because that's already loading and since we're bringing an elephant on the train with us, we want to make sure we can squeeze into an empty car.

Did you...
Have you...
Do you know...
Do you know what that means?
That the reason why it's not 27 isn't that Valhalla isn't ready?
28 might be it, folks.
A preview of the first Valhalla feature, specifically JEP 401's value types.
The train is coming into view but let's keep our cool - predictions are hard, especially about the future.

Still, I can't wait for summer.
In June, JDK 27 gets forked from the main line, which then switches over to 28 with plenty of room for [Java's elephantine proposal 401](https://openjdk.org/jeps/401).

After that, the plan is to introduce [nullness markers](https://openjdk.org/jeps/8303099), which will eventually allow the JVM to identify [instances of value types](https://openjdk.org/jeps/8316779) that cannot be `null` and can thus be flattened.
Further steps deal with array improvements and the [unification of primitives and their value class wrappers](https://openjdk.org/jeps/402), but while work on all that will surely progress in 2026, I see no chance of any of it landing in the main line.
Keep an eye [Valhalla's early access builds](https://jdk.java.net/valhalla/), though - maybe they'll get updated with some of this throughout the year.


## Project Panama

It's not just you and me eagerly awaiting Valhalla, the vector API will also be thrilled to see value types because it's also been waiting for them for years.
In JDK 26, the API will see [its eleventh incubation](https://openjdk.org/jeps/529) and it will stay that way until value types ship.
Once that happens, the vector implementation will adopt them and the API will be moved from `jdk.incubator.vector` into a proper `java` package.
The Panama devs will take this opportunity to evaluate all feedback gathered during the API's incubation and polish it a bit, potentially changing a few details or maybe even moving some functionality around.

Other than that, [Panama](https://openjdk.org/projects/panama/) ([mailing list](https://mail.openjdk.org/mailman/listinfo/panama-dev)) is not that active any more.
Don't get me wrong, [jextract](https://github.com/openjdk/jextract) and the FFM API are still seeing improvements, particularly on the performance side, but since they're now established, that's less "Project Panama work" and more just regular maintenance.


## Project Babylon

[Project Babylon](https://openjdk.org/projects/babylon/) ([mailing list](https://mail.openjdk.org/mailman/listinfo/babylon-dev)) is currently working on three different pieces.
At the core is code reflection, the technology that allows third-party frameworks to reflect over the Java code in a method or in a lambda expression, analyze it, process it, change it, run it - as Java bytecode but also as a GPU kernel, an SQL statement, or on whatever platform the framework wants to.
The other two pieces Babylon is working on are proofs of concept that use code reflection to run Java machine learning models on the GPU - one by adapting ONNX, the other by creating a GPU sympathetic Java API that transforms the code to a runtime like CUDA or OpenCL.

Code reflection is coming along nicely and because experience shows that community feedback is easier to get for functionality that ships with the JDK instead of a standalone project EA build, Babylon wants to start incubating code reflection early.
So they're already preparing [the code](https://github.com/openjdk/babylon/tree/code-reflection/test/jdk/java/lang/reflect/code) for that and are also working on the related JEP.
I'm sure we'll hear something about that effort in 2026.
The two proofs of concept are really just that and there are currently no plans to turn them into proper projects.


## Project Loom

After its revamp in Java 25, the structured concurrency API will preview with only [small further changes in 26](https://openjdk.org/jeps/525) and I consider the chances good that it will finalize later this year.
This is the last piece of [Project Loom](https://wiki.openjdk.org/display/loom/Main)'s big picture ([mailing list](https://mail.openjdk.org/mailman/listinfo/loom-dev)) but that doesn't mean there's nothing left to do with regards to virtual threads.
Loom is exploring more ways to let us benefit from them but I don't think we'll hear details on that any time soon.


## Interlude

<contentvideo slug="inside-java-newscast-103"></contentvideo>

While I have you here, I need to quickly amend my last video about Java's highlights of 2025.
Because I kinda forgot a few?
Namely these three:

* Valhalla published an early-access build in October, previewing JEP 401.
  No idea how I could forget that.
* We launched learn.java, _the_ destination for beginners, students, and teachers of Java.
* The playground now comes with snippets - on dev.java it lets you select from a bunch of prebuilt samples to explore a language feature or API; and on learn.java it's embedded into the articles so students can try what they're learning right then and there.

Upgrading from text styled as code to actual code that you can execute with a click of a button right on your browser is really cool!
I'm very excited to see how my colleagues Crystal, Jose, and Denis (who built most of the playground, btw; kudos, Denis) will use this.
If you want to learn or teach our favorite programming language, check out learn.java.

Now back to the projects - we still got Leyden and Amber to cover and my source has scoops on both.


## Project Leyden

[Project Leyden](https://openjdk.org/projects/leyden/)'s ([mailing list](https://mail.openjdk.org/mailman/listinfo/leyden-dev)) next headline feature will be [ahead-of-time code compilation](https://openjdk.org/jeps/8335368).
In JDK 26, the AOT cache contains loaded and linked classes as well as method profiles.
With AOT code compilation it would also contain machine code that the JIT compiler generated based on those profiles.
That means, in a production run, the runtime can just pull optimized code out of the cache, thus considerably reducing warmup time.

Out of the box, the code cache has very limited portability, though.
High-performance code is bound to the exact hardware micro-architecture it was created on and because it contains the garbage collector's write barriers, it's also bound to the GC.

> There are three more pieces we're exploring:
>
> * Portability of the AOT code cache and the tradeoff entailed between peak performance by targeting the CPU's micro-architecture and portability when optimizing less aggressively.
> * Iterative training, where an AOT cache acts as an input to a second training run.
>   This will allow frameworks to train the cache and for users to then extend the training by using the first cache in their application training run.
> * We are also tinkering with inspectability of training data.
>   The information flow from training run to assembly phase is opaque to the end user, especially since we're retiring the ascii-based data dump that drives the assembly phase.

Leyden is also always looking for feedback - on performance as well as on ergonomics.
JDK 25 came with the option to execute the first and second step of AOT caching, observing a training run and assembling the cache, as one and 26 introduced an option to make the cache GC agnostic.
Give it a try, and let the project know what works for you and what doesn't.


## Project Amber

Ok, let's talk about [Project Amber](https://openjdk.org/projects/amber/) ([mailing list](https://mail.openjdk.org/mailman/listinfo/amber-dev)).
Before we get to the juicy bits, [a short note on string templates](https://www.youtube.com/watch?v=c6L4Ef9owuQ):
Work on them is progressing but there are a lot of ideas and it doesn't seem like their convergence is just around the corner, so we'll have to be patient for a bit longer.
Still, I hope for at least an official update some time this year.

> I cannot go into too much detail or Brian will figure out who I am, but the big picture is that Amber is knee deep in its second pattern-matching phase.
> Two explorations in particular came along really well and I hope to see JEPs for them later this year:
>
> * Constant patterns, which are half-way between old-style `switch (int i) case 5...` and primitive patterns.
>   In fact, constant and primitive patterns are so intertwined that they'll probably preview and maybe even finalize together.
> * Pattern assignments, which allow unconditional deconstruction of instances into their components.
>
> But there's more.
> Keep an eye on amber-spec-experts, some interesting ideas are coming down the pike about generalizing records and pattern matching to apply to classes and even interfaces.
> This will also address some of the current restrictions of records, offer a refactoring path to classes, and unblock [withers](https://openjdk.org/jeps/468).
> It will blow your socks off!

Phew, I can't wait.
If you're as excited as I am and don't want to miss any of these news, subscribe to the channel and let me know in the comments which feature you're looking forward to the most.
I'll see you again in two weeks, maybe with a deep dive into Brian's email if it's already out.
So long...

---
title: "JSON API, Valhalla Progress, LTS ❤️ PQC - Inside Java Newscast #114"
tags: [java-28, project-valhalla, project-amber, core-libs, community, openjdk, meta]
date: 2026-08-15
slug: inside-java-newscast-114
videoSlug: inside-java-newscast-114
description: "JEP 540 proposes to incubate a simple JSON API, the PR for JEPs 401 and 539 was merged, Oracle plans to backport PQC to Oracle JDKs with LTS and move Java to monthly security updated, and more"
featuredImage: inside-java-newscast-114
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and I got a packed episode for you.
Today we're going to go over (in order):

* the ongoing work on Valhalla
* primitive patterns
* the proposed JSON API
* post-quantum encryption in LTS versions
* monthly security updates
* and an OpenJDK mail search

If, in a few minutes, you wonder why I keep talking about JDK 28 even though 27 isn't even released yet or get confused about the dance between Oracle JDK, OpenJDK, and LTS a bit later, ask for clarification in the comments.
If there ever was a practical test on these topics, it'd be this video.
That aside, links to everything are in the description.

Ready?
Then let's dive in!


## Work on Valhalla

Let's start with a quick update on last episode's big news:
[The pull request for JDK Enhancement Proposals 401 and 539](https://github.com/openjdk/jdk/pull/31120) for value types and strict field initialization, respectively, were merged and are available in the latest JDK 28 early access build.
I immediately downloaded it, used a simple regex to turn all records in a side project into value records, and... nothing.
Everything just works, but it also didn't improve performance, although given the characteristics of that specific project, I didn't expect it to, either.
Now it's on you to give value types a go and let me know in the comments what happened.

Speaking of values, though, Dan Smith recently [sent a mail](https://mail.openjdk.org/archives/list/core-libs-dev@openjdk.org/thread/Y72NRXM7KYBX43OKYBQMVKOZDWKG4MHS/) to the core-libs mailing list where he laid out criteria for classes in the JDK API that could potentially be migrated to value types.
Note that if you enable previews in JDK 28, a bunch of classes are already treated as value types: the primitive wrappers, of course, but also optionals and much of the date/time API.
In his mail, Dan identified about 60 more candidates in _java.base_'s public API and also pointed out how there's of course more freedom to refactor internal classes to line up with value semantics.
But his analysis brought him to the conclusion that, for most classes, it's not urgent to refactor them and that it makes more sense as part of regular maintenance than of a concerted push.


## Primitive Patterns

Primitive patterns will very likely [see another preview in JDK 28](https://mail.openjdk.org/archives/list/amber-spec-experts@openjdk.org/thread/WSXW4QMJ3EBIHIULEB25HUAMR5JB767H/), without changes.
Not so much because new feedback is expected but because the upcoming feature of constant patterns has quite some overlap with primitive patterns and so Project Amber does not want to commit to one before the other is in play.
That's understandable but a bit unfortunate - let's just hope this doesn't turn into another vector API.


## JSON API

[JEP 540](https://openjdk.org/jeps/540) proposes to incubate a simple JSON parsing and printing API - emphasis on _simple_.
The goal is not to replace established JSON libraries like Jackson or GSON - instead it's to enable easy and quick exploration of JSON documents, parsing them for configuration or simple data processing, and giving the JDK itself the capability to parse and print JSON for its own use cases.
It should do all that while being small, easy to learn, easy to maintain, and forthcoming with clear error messages if something goes wrong.
I'll take you on a short tour through the API and then we discuss what it does not do.

The core of the API is the sealed interface `JsonValue`, extended by six specialized interfaces for objects, arrays, strings, numbers, booleans, and null.
But unlike earlier explorations it does not use pattern matching as its core mechanism to expose the JSON document's information - instead, `JsonValue` itself has methods `asMap()`, `asList()`, `asString()`, `asDouble()`, etc. that return the represented value in that form if it's of the right type.

So if you _know_ that a document represents a JSON object with, say, a `users` property that holds a non-empty array of users and you want to get the first user's name, you can call `Json.parse` with the JSON string and then, on the `JsonValue` it returns, `get("users").get(0).get("name")`.
Or maybe you want to collect all user names in a list, then it would be `get("users").asList()` followed by a `stream()`, `map(...)` and `toList()`.

But note that if you ask for a property that does not exist, for an array index that's out of bounds, or to return a value as a type that it isn't, you will get an exception.
It will detail the error and include the path you took through the JSON document to get there.
But that means that if you're less sure about the document's structure, you need to use methods like `asMap()` to turn a JSON object into a map that you can explore, `tryGet` instead of `get` to get an empty `Optional` if the property does not exist, or pattern matching to figure out what kind of `JsonValue` you have in hand.

Finally, to render JSON, you'd create a tree of `JsonValue` nodes and either call `toString` on its root to get a single line with minimal whitespace or `Json.toDisplayString` to get well-formatted multi-line output.

And that's, like, 80% of the API.
It's clearly focused on the essentials without bells and whistles.
No data binding, no streaming, no parsing configurations, and also no syntax extensions, so no comments nor trailing commas - this is pure RFC 8259.
As I said: simple.
And if you either know from the get-go that you need more or find that out after your program grew to that point, using a third-party JSON library is the right step and is not considered a failure of this API.

JEP 540 proposes the incubation of the JSON API, so you need to compile and run with `--add-modules jdk.incubator.json`.
The JEP was recently proposed to target JDK 28, so there's a good chance that you can play around with it in a few weeks.


## LTS ❤️ PQC

Mathematics and theoretical computer science are wild!
We can barely get a quantum computer to reliably factor 35 into 5*7 but not only did we already invent decryption algorithms for its future form that break today's encryption, no, we also invented encryption algorithms that run on today's hardware but withstand future quantum computers (probably).
That's like Caesar applying a cypher with pen and paper that Turing could not build a bombe to break.
Truly wild.

So what we need to do now, is put those quantum-resistant algorithms into practice and Java is at the forefront of this revolution.
In August 2024, the US National Institute of Standards and Technology NIST standardized ML-KEM, a key establishment mechanism used to protect information, and ML-DSA, a digital signature algorithm used to establish trust - both quantum-resistant and both supported by Java 24, released in March 2025, just 8 months later.
And now JDK 27, to be released next month, adds hybrid post-quantum key exchange for TLS 1.3.
Taken together, this enables post-quantum cryptography with minimal application changes on the latest JDK release.

But what if you're on an older JDK feature version that you don't plan to upgrade any time soon and want to defend against harvest-now-decrypt-later attacks?
If you're on Oracle JDK, I've got good news for you.
In the July 2026 update of its cryptographic roadmap, [Oracle announced](https://blogs.oracle.com/java/post-quantum-cryptography-in-long-term-support-jdk-releases) that its JDKs 25, 21, 17, 11, and even 8 are expected to reach post-quantum cryptography capabilities comparable to JDK 27 until end of 2027.
Whether other JDKs will also receive these backports is up to their maintainers.

There's a link to the announcement with more details and the expected time line in the description.


## Monthly Security Updates

The latest generation of AI models has [considerably increased the speed and scale of software vulneravility discovery and remediation](https://blogs.oracle.com/security/accelerating-vulnerability-detection-and-response-at-oracle).
The JDK is no exception to this and so [Oracle intends to shift the Java security update processes from a quarterly to a monthly cadence](https://blogs.oracle.com/java/transitioning-java-to-more-frequent-security-updates), a process that is planned to take much of 2027.
In the first order, this only applies to Oracle JDKs, but OpenJDK Updates Project Lead Rob McKenna [proposed to adopt the same monthly model](https://mail.openjdk.org/archives/list/jdk-updates-dev@openjdk.org/thread/SVHDNJDY62MX6YBEA4FSMW4U72H77F6S/) for at least the six months after each JDK feature release; that's the interval during which Oracle maintains the respective OpenJDK branch.
He furthermore invited discussions with maintainers of older OpenJDK update forks and branches to adopt the same model.
It is possible, arguably even likely that, in the end, most or all Java users will see a monthly release cadence for the JDK they use.

While this process is intended to start in earnest in 2027, there will be a non-quarterly update release for JDK 26, too, namely 26.0.1.2, in just a few days on August 18th, so watch out for updates.
As a knock-on effect, [this pushes JDK 27's first release candidate back to August 20th](https://mail.openjdk.org/archives/list/jdk-dev@openjdk.org/thread/EYKJPUAZ4BX4DXD7H4C5ETWJFNQZBFO5/), which cuts 40% off its tenure.

If you're interested in this topic, please read the related blog posts and mails because I had to cut a lot to squish the essentials into this segment.
There are four of them and there's a canonical order in which to read them - for your convenience, it's the order in which they're listed in the show notes.


## OpenJDK Mail Search

A while ago, friend of the show Elliot Barlas developed the [OpenJDK Mail Search](https://openjdk.barlasgarden.com/), a fulltext search over the OpenJDK mailing list archives.
He recently published an update and it's looking and working great.
If you want to dig into Java's past and understand why something is the way it is, the mailing lists are a treasure trove.
But they're also a labyrinth, so give Elliot's search a go - link in the description.


## This Show

I closed the last episode with the announcement that the format and cadence of the Inside Java Newscast would change.
I read all your comments and replied to many of them, but there's one point that I feel I need to clarify here.
But first, I want to thank you for the outpouring of positivity and support - it was humbling and thrilling to see how much you care about this show.
So do I and I will keep doing my best to make it worth your time.

Speaking of time, one of the things I do with what I wrestled fron the Newscast are more Inside Java Podcasts and since the last Newscast we published episodes about Java and AI with Spring's Dan Vega, a thorough introduction to JIT compilation, and how Helidon embraces virtual threads.
Next in the pipeline are how the car rental company SIXT adopts new Java versions, how type classes aim to support limited operator overloading for value types, and a three-way conversation with Oracle's John Rose and Netflix' Martin Chalupa about ahead-of-time computation in theory and practice.
We publish them as videos on YouTube and as podcasts on all major platforms but you can also check inside.java/podcast.

Ok, so about that point I want to clarify.
It was noted a bunch of times how silly it was that developers trust an LLM to teach them about coding or to let it generate large swaths of code with barely any oversight.
And I agree!
But, crucially, I didn't say it was a good idea, just that it's happening and I think that part is hard to deny.
We're not in Kansas anymore.
Except you, Billy.

I, on the other hand, am in Tokyo and can't wait to get back out to exploring it.
Kansas Boy will take over the September Newscast and I'll see you again in October.
Or on our JDK 27 release stream on September 15th or an Inside Java Podcast.
So long ...

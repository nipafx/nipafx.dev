---
title: "Java Architects Answer Your Java Questions"
tags: [community, project-amber, project-loom, project-valhalla, project-leyden]
date: 2023-10-26
slug: java-ama-devoxx-be
videoSlug: java-ama-devoxx-be-part-1
description: "Try/catch expressions? Valhalla timeline? Synchronizing virtual threads? And many more. Here's how Brian Goetz, Alan Bateman, Stuart Marks, and Kevin Rushforth answered your questions."
featuredImage: java-ama-devoxx-be-part-1
---

## Part 1

I did not expect that!
A few weeks ago I invited you to ask me anything about Java and my plan was to take a dozen or so questions to Devoxx Belgium, have them answered by my dear colleagues in Oracle's Java Platform Group, and put them into a neat little Inside Java Newscast that comes out on October 19th.

Well...
Across YouTube, Reddit, Mastodon, and the like, I got over 250 replies and even after picking your favorites and a bit of deft editing, I ended up with over one hour of interviews.
That's not a Newscast, that's not even a good video, it's way too long.

So instead, we're doing this.
Which is me, in my living room, recording a video - but it's not a Newscast!
It's the first half of the AMA, in which I and, when I ran out of steam, The Cleaner himself asked Brian Goetz, Java Language Architect and Project Lead of Amber and Valhalla, questions about exactly those two projects.
From if/else and try/catch expressions to named arguments and union types, from machine learning to a timeline on Valhalla, we covered a lot of ground and got a ton of good info that I'm sure you'll love to hear about.
So have fun with that and, if you didn't already, make sure to subscribe, so you don't miss the second half next week, when I ask Stuart Marks, Kevin Rushforth, and Alan Bateman about math, GUIs, and virtual threads respectively-
Oh, and I'll answer a few questions, too.

But now, let's see how Brian replies to your questions.

### Project Amber - Brian Goetz

The` getFoo()` and `setFoo()` convention was established by the JavaBeans specification, and is widely used outside Java beans, but well known style guides including an old one by Sun and Google's newer guide don't actually insist on it. The new Record class doesn't use it, either. Does the Java team have any thoughts on naming getters and setters? \
([Question](https://www.youtube.com/channel/UCmRtPmgnQ04CMUpSUqPfhxQ/community?lc=Ugyqu50WPbzRCWJf31R4AaABAg&lb=UgkxeVfAeKvtBd6Ge83TqfhgVIqnM-ANnuiy) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=1m35s))

Records are great for immutable things but that doesn't obviate the need for mutable things. Why not have the ability to define mutable records....may be with a new keyword "javabean" as in: public javabean Whatever(String a, String b); \
([Question](https://twitter.com/Enthuware/status/1707697589552857123?t=uCiFrnTcfj9rZdGfimD1Fg&s=19) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=4m04s))

In which version of Java are we going to have shorter version of “System.out.println()”? \
([Question](https://twitter.com/hushensavani/status/1707706095270289899?t=BvkaOWw5YFWdRmHoYVRhXA) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=7m23s))

On the "why can't we have" series I was missing if/else and try/catch as expressions. Switch alone is not sufficient. \
([Question](https://reddit.com/r/java/s/CwzQwRoUn2) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=9m28s))

Are there any plans for named arguments, even for limited applications like Record constructors? \
([Question](https://www.youtube.com/channel/UCmRtPmgnQ04CMUpSUqPfhxQ/community?lc=UgyjBFsv-3s8-MswlBZ4AaABAg&lb=UgkxeVfAeKvtBd6Ge83TqfhgVIqnM-ANnuiy) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=10m29s))

Any (potentially far-off) plans for union types? It would be super helpful for things like `Result<MyType, ErrorA | ErrorB>` kind of situations, exceptions tend to get unwieldy, and defining a sealed interface for that is a bit un-ergonomic \
([Question](https://reddit.com/r/java/s/PeUls8quTf) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=15m17s))

Are there any plans to support delegation in the language, something like `: Type by prop` in Kotlin? I think this would give a great incentive to use composition over inheritance, since you would suddenly save roughly the same amount of code. \
([Question](https://twitter.com/HiaslTiasl/status/1707989170830930259?t=e_s-Qtm-wg8WPhSyPgCZKQ&s=19) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=19m21s))

While reading the JEP it mentioned as "We are propose to finalize it without change". If there is no difference between preview and final, can next patch release of JDK 21 make the feature as final as well. \
([Question](https://twitter.com/anbusampath/status/1707351344640889287) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=21m51s))

### Project Valhalla - Brian Goetz

Valhalla when \
([Question](https://www.youtube.com/channel/UCmRtPmgnQ04CMUpSUqPfhxQ/community?lc=UgxJTfu6Zw7D-4Q6ROF4AaABAg&lb=UgkxeVfAeKvtBd6Ge83TqfhgVIqnM-ANnuiy) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=26m51s))

Are there any plans for java to try and take share from the ML/AI pie? \
([Question](https://reddit.com/r/java/s/5btxOl0XSq) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=27m49s))

How to attract more interest in Java for number crunching/scientific applications? [...] Do we know if the Java architects have any interest in targeting the scientific community? \
([Question](https://reddit.com/r/java/s/09ZPlLe8LB) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=28m54s))

Are there any discussions about adding a data table structure natively to Java? We live in a data world and the tabular format is an expected way to handle it (spreadsheets, matrices...) \
([Question](https://twitter.com/seinecle/status/1707721695966933171?t=4fcfX4q8-t3ST-22pfcy_g&s=19) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=29m59s))

Do you think with Valhalla and Panama, Java could become more relevant for game development? \
([Question](https://reddit.com/r/java/s/KnPsF3UXye) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=31m27s))

### Outro

And that was that.
I hope you learned something new - if you did, leave a like, so more Java developers get to see this video.
If you can't get enough of Brian, check out his Devoxx keynote and don't forget to subscribe, so you don't miss the second half of this AMA.
So long...


## Part 2

<contentvideo slug="java-ama-devoxx-be-part-2"></contentvideo>

Are there any plans to invest into Java on Desktop?
Is work being done to make virtual threads scale better with synchronization?
Is it possible to make a Java 2.0 with breaking changes in a new release?
And why is MathContext so clunky?

This is the second half of the AMA where I took these and more of your questions to Devoxx Belgium to interview the experts from the Java Platform Group at Oracle.
Without further ado, here are their replies.

### Java UI Frameworks - Kevin Rushforth

I am hugely interested in GUIs. Java has two - Swing(Not thread-safe) and JavaFX. Which one is better? Or we need any other safe feature-rich framework for GUIs? \
([Question](https://www.youtube.com/channel/UCmRtPmgnQ04CMUpSUqPfhxQ/community?lc=UgyZQjT6AJ_DR1e5_4R4AaABAg&lb=UgkxeVfAeKvtBd6Ge83TqfhgVIqnM-ANnuiy) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=0m29s))

Any plans to invest into Java on Desktop? \
([Question](https://www.reddit.com/r/java/comments/16v688w/comment/k2pdqk3/?utm_source=reddit&utm_medium=web2x&context=3) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=2m07s))

When will Java get some media processing capability, like ability to play back videos? At least the ones with non-patent-encumbered codecs? \
([Question](https://www.reddit.com/r/java/comments/16v688w/comment/k2pdqk3/?utm_source=reddit&utm_medium=web2x&context=3) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=2m46s))

When will AWT get WebP image format support? AVIF? \
([Question](https://www.reddit.com/r/java/comments/16v688w/comment/k2pdqk3/?utm_source=reddit&utm_medium=web2x&context=3) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=3m21s))

### Project Loom - Alan Bateman

Which are the use cases of platform threads and virtual threads?  How to choose between them? \
([Question](https://www.youtube.com/channel/UCmRtPmgnQ04CMUpSUqPfhxQ/community?lc=Ugy2zDFHIwSzw5elRvJ4AaABAg&lb=UgkxeVfAeKvtBd6Ge83TqfhgVIqnM-ANnuiy) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=4m31s))

Virtual threads at the moment suffer from the synchronized thread pinning problem. Is there currently work done to fix that in the next java releases? If yes, is there an ETA? \
([Question](https://reddit.com/r/java/s/uUrx5RDN5y) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=6m08s))

When do we get control over which set of carrier threads a virtual thread may be scheduled on? Or even use a custom scheduler. \
([Question](https://www.youtube.com/channel/UCmRtPmgnQ04CMUpSUqPfhxQ/community?lc=UgzgkdzLuvKOBH6e4K54AaABAg&lb=UgkxeVfAeKvtBd6Ge83TqfhgVIqnM-ANnuiy) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=10m20s))

Why developers of web frameworks(Jetty etc) are saying that they don’t want to use or adopt virtual threads and claim that they don’t improve performance while introducing more context switching? \
([Question](https://www.youtube.com/channel/UCmRtPmgnQ04CMUpSUqPfhxQ/community?lc=Ugxki_GPrCA6ctVmzth4AaABAg&lb=UgkxeVfAeKvtBd6Ge83TqfhgVIqnM-ANnuiy) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=13m18s))

### Lightning Round

IIRC then GraalVM including native image will be merged into OpenJDK at some time in the future. Any news on that? \
([Question](https://reddit.com/r/java/s/b1I52203u3) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=17m10s))
Azul has CRaC. I think condensers are somewhat similar (a superset and/ or generic concept that may or may not cover something similar to Azul's CRaC). Any news on that or maybe a timeline? \
([Question](https://reddit.com/r/java/s/b1I52203u3) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=17m35s))

Why does Java still not support metaprogramming? \
([Question](https://twitter.com/orcunbalcilar/status/1707796527693943208?t=PbqD9doqh9nJKB1V_MVtXQ&s=19) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=20m03s))

On backwards compatibility:

* As a learner, I always like stability in the technology... Java is continuously evolving with new features and additions. Can I expect stable Java versions ahead?
* We're seeing some APIs removed that have been deprecated for 10+ years, and yet there's a lot of Java code in industry that is old enough to use them. What factors is Oracle weighing while trying to preserve backwards compatibility and trying to move Java forward?
* Is it possible for you to make Java 2.0 and as C# make a breaking change in new release?

(Question [#1](https://www.youtube.com/channel/UCmRtPmgnQ04CMUpSUqPfhxQ/community?lc=UgyZQjT6AJ_DR1e5_4R4AaABAg&lb=UgkxeVfAeKvtBd6Ge83TqfhgVIqnM-ANnuiy), [#2](https://www.youtube.com/channel/UCmRtPmgnQ04CMUpSUqPfhxQ/community?lc=UgwGz25kMJrykqP2VEx4AaABAg&lb=UgkxeVfAeKvtBd6Ge83TqfhgVIqnM-ANnuiy), [#3](https://www.youtube.com/channel/UCmRtPmgnQ04CMUpSUqPfhxQ/community?lc=Ugx20N0eI5LGe8nsxSB4AaABAg&lb=UgkxeVfAeKvtBd6Ge83TqfhgVIqnM-ANnuiy) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=20m25s))


Can we see java again in cutting-edge technologies, AI, robotics, 3D engines, VR, HPC like the old times? Supporting Java platform in multiple fields would benefit the community more than introducing new syntax features. \
([Question](https://www.youtube.com/channel/UCmRtPmgnQ04CMUpSUqPfhxQ/community?lc=Ugy0oLHZbXJgPQ_Q7yR4AaABAg&lb=UgkxeVfAeKvtBd6Ge83TqfhgVIqnM-ANnuiy) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=22m33s))

### APIs - Stuart MArks

Why can’t I set MathContext globally for all BigDecimals? Add them everywhere is a real pain. \
([Question](https://twitter.com/parveenyadv/status/1707795512551002118?t=80XS9BGda0IfdZ9_KAze6w&s=19) & [Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=24m10s))

Why `HashSet.newHashSet` instead of `HashSet.forNumberOfElements`? \
([Answer](https://www.youtube.com/watch?v=WoQJnnMIlFY&t=28m39s))

### Outro

And that's it for the second half of the AMA.
If you didn't already, make sure to check out the first half where we interviewed Brian Goetz about Java's language development.
I hope you learned something new - if you did, leave a like, so more Java developers get to see this video.
So long...

---
title: "Upgrading From Java 21 To 25: All You Need To Know"
tags: [java-25, migration]
date: 2025-08-24
slug: road-to-25-upgrade
videoSlug: road-to-25-upgrade
description: "Updating from Java 21 to 25 is a smooth experience. Unless you're working on an unlucky project that collected all the little details that change: Whether it's annotation processing, null checks, file operations or the removal of old technologies, Peter collects them all."
featuredImage: road-to-25-upgrade
---

As is, this video's script is way too confusing to work in written form and I am way too busy (read: "lazy") to patch it up until it does, so I'm afraid, you'll have to watch the video.
Here are time-stamped links to each chapter together with all follow-up sources:

[Intro](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=0m00s)

[Default Annotation Processing](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=0m55s)
* [Quality Heads-up](https://inside.java/2024/06/18/quality-heads-up/)

[Final Record Pattern Variables](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=2m58s)
* [JDK-8317300](https://bugs.openjdk.org/browse/JDK-8317300)

[Security Property "include"](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=4m15s)
* [Quality Heads-up](https://inside.java/2024/12/10/quality-heads-up/)

[Null Checks in Inner Class Constructors](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=4m55s)
* [Quality Heads-up](https://inside.java/2025/04/04/quality-heads-up/)

[Unsafe Memory Access](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=6m40s)
* memory access warnings: [JEP 498](https://openjdk.org/jeps/498)
* memory access deprecation: [JEP 471](https://openjdk.org/jeps/471)
* `shouldBeInitialized`, `ensureClassInitialized`: [JDK-8316160](https://bugs.openjdk.org/browse/JDK-8316160)
* `park`, `unpark`, `...Fence`: [JDK-8315938](https://bugs.openjdk.org/browse/JDK-8315938)

[Native Access](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=8m52s)
* [Quality Heads-up](https://inside.java/2024/12/09/quality-heads-up/)
* [JEP 472](https://openjdk.org/jeps/472)
* [restricted methods in JDK 24](https://docs.oracle.com/en/java/javase/24/docs/api/restricted-list.html)

[Security Manager](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=10m53s)
* [Quality Heads-up](https://inside.java/2024/12/11/quality-heads-up/)
* [JEP 486](https://openjdk.org/jeps/486)
* changes to `Subject` API: [Quality Heads-up](https://inside.java/2024/07/08/quality-heads-up/)

[File System Operations on Windows](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=11m57s)
* deletion and trailing spaces: [Quality Heads-up](https://inside.java/2025/06/16/quality-heads-up/)
* `\\?\C:\` style paths: [JDK-8287843](https://bugs.openjdk.org/browse/JDK-8287843)
* trailing space in paths: [JDK-8354450](https://bugs.openjdk.org/browse/JDK-8354450)
* deleting read-only files: [JDK-8355954](https://bugs.openjdk.org/browse/JDK-8355954)

[Unicode Updates and COMPAT Removal](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=13m04s)
* CLDR by default: [JEP 252](https://openjdk.org/jeps/252)
* COMPAT removal: [Quality Heads-up](https://inside.java/2024/07/11/quality-heads-up/) & [JDK-8174269](https://bugs.openjdk.org/browse/JDK-8174269)
* CLDR updates: [Quality Heads-up](https://inside.java/2024/03/29/quality-heads-up/)
* CLDR v44: [JDK-8306116](https://bugs.openjdk.org/browse/JDK-8306116) & [Unicode CLDR 44](https://cldr.unicode.org/downloads/cldr-44)

[Intermission](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=14m41s)

[Removals](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=15m26s)
* 32bit: [JEP 503](https://openjdk.org/jeps/503)
* GTK2: [JDK-8329471](https://bugs.openjdk.org/browse/JDK-8329471) & [JEP 283](https://openjdk.org/jeps/283)
* time zones: [JDK-8340477](https://bugs.openjdk.org/browse/JDK-8340477)
* command line options:
	* `-XX:[+-]RegisterFinalizersAtInit`: [JDK-8320335](https://bugs.openjdk.org/browse/JDK-8320335) & [JDK-8320522](https://bugs.openjdk.org/browse/JDK-8320522)
	* `-XX:+UseEmptySlotsInSupers`: [JDK-8330607](https://bugs.openjdk.org/browse/JDK-8330607) & [JDK-8330699](https://bugs.openjdk.org/browse/JDK-8330699)
	* `-Xnoagent`: [JDK-8312072](https://bugs.openjdk.org/browse/JDK-8312072) & [JDK-8312150](https://bugs.openjdk.org/browse/JDK-8312150)
	* `-t`, `-tm`, `-Xfuture`, `-checksource`, `-cs`, and `-noasyncgc`: [JDK-8339918](https://bugs.openjdk.org/browse/JDK-8339918)
	* `jdeps -profile`, `-p`: [JDK-8310460](https://bugs.openjdk.org/browse/JDK-8310460)
* methods on `Thread` and `ThreadGroup`: [JDK-8320532](https://bugs.openjdk.org/browse/JDK-8320532) & [JDK-8320786](https://bugs.openjdk.org/browse/JDK-8320786)
* system property `jdk.reflect.useDirectMethodHandle`: [JDK-8305104](https://bugs.openjdk.org/browse/JDK-8305104)
* module _jdk.random_: [JDK-8330005](https://bugs.openjdk.org/browse/JDK-8330005)

[Deprecations for Removal](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=18m24s)
* various command line flags: [JDK-8227229](https://bugs.openjdk.org/browse/JDK-8227229), [JDK-8286851](https://bugs.openjdk.org/browse/JDK-8286851), [JDK-8350754](https://bugs.openjdk.org/browse/JDK-8350754)
* modules: [JDK-8311530](https://bugs.openjdk.org/browse/JDK-8311530) & [JDK-8308398](https://bugs.openjdk.org/browse/JDK-8308398)

[Separate Metaspace and GC Printing](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=19m12s)
* [Quality Heads-up](https://inside.java/2025/06/09/quality-heads-up/)

[Remote Debugging with jstat and jhsdb](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=20m41s)
* [Quality Heads-up](https://inside.java/2025/01/31/quality-heads-up/)

[Outro](https://www.youtube.com/watch?v=9azNjz7s1Ck&t=21m53s)

## Next Up

If you haven't watched it yet, also check out this video on all the API additions in Java 25:

<contentvideo slug="road-to-25-apis"></contentvideo>

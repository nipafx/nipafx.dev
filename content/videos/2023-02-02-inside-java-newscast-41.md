---
title: "Prepare Your Code Bases For Future Java - Inside Java Newscast #41"
tags: [deprecation, tools]
date: 2023-02-02
slug: inside-java-newscast-41
videoSlug: inside-java-newscast-41
description: "What do the security manager, applet API, finalization, and primitive wrapper constructors have in common? What about CMS, Nashorn, RMI activation, and biased locking? And what does jdeprscan have to do with all of this?"
featuredImage: inside-java-newscast-41
---

## Intro

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle and today we're gonna go over all Java functionality that's deprecated for removal and what you need to do to prepare your code bases.

No, no, don't leave!
Don't leave.
Look, look, I know it's not as thrilling as talking about fancy new features like we did in the last episode, but it needs to be done.
I want all your projects to be ready to move to the next version you choose, whether that's Java 17, 20 in March, or 21 in September, and for that you need to know about these things.

To make it a bit more entertaining, I'll show you all my Displates, so you can judge me for my taste, ok?
And if you make it all the way to the end, I'll tell you some personal news about this space I'm sitting in.

Deal?
Then let's dive right in!

Oh, I forgot to turn on the blue and yellow lights.
How German of me.
Better late than never, though.

## jdeprscan

Before we get into specific deprecations, we need to quickly talk about jdeprscan.
That's a command line tool that scans class files or JARs for uses of deprecated API elements.
Very helpful, you should definitely familiarize yourself with it if you haven't already - there's [a link][jdeprscan] in the description.

```shell
# let your build tool copy all dependencies into a folder
# in that folder:
find . -exec jdeprscan {} \;
# possible additions:
#  - set `--class-path` to reduce errors
#  - add `2>/dev/null` to ignore errors \
```

Now, importantly, you can run jdeprscan from the latest JDK release against code compiled for much older Java versions and still get up-to-date deprecations warnings.
So, for example, if your code base compiles against Java 11, you can and should run jdeprscan from JDK 19 to see deprecations as they're defined in 19.
Keep this in mind whenever I talk about deprecated APIs - you can easily find static uses of them in your code base and in your dependencies with jdeprscan.

As an aside, be aware that since JDK 9, [the Javadoc _Deprecated_ page][javadoc-deprecated] has a section that lists the APIs that are deprecated for removal.

If you find uses of deprecated APIs in your code, you obviously have to remove them - I will make sure to mention appropriate alternatives in each section.
If you find them in your dependencies, see whether you can file a ticket, provide additional information, offer a bounty, or open a pull request.
And make sure you're using recent versions of these dependencies, so you can easily update to a fixed one when it's released.

[jdeprscan]: https://dev.java/learn/jvm/tools/core/jdeprscan/
[javadoc-deprecated]: https://docs.oracle.com/en/java/javase/19/docs/api/deprecated-list.html


## Applet API

Nobody's using the applet API anymore, right?
So no need to spend a lot of time on this.
It was deprecated by [JEP 289][jep-289] in Java 9 with `forRemoval` set to true by [JEP 398][jep-398] in JDK 17.

Maybe the most interesting tidbit about this technology is the reason for why it wasn't already removed.
And that is its use in roughly 1500 functional tests across Swing, 2D, and AWT that happen to be written as applets without having anything to do with them.
Progress on refactoring these tests has been slow and won't be done any time soon.

[jep-289]: https://openjdk.org/jeps/289
[jep-398]: https://openjdk.org/jeps/398


## Security Manager

### The Back Story

The security manager backstory is long and complicated.
It's laid out in detail in [JEP 411][jep-411] and summarized in [Newscast #5][ijn#5], so here's the overly simplified, tweet-sized version:

The security manager played its role in Java's security architecture in the past but has lost efficacy over time as new threats replace old ones.
What remains impairs performance, is difficult and brittle to use, often surpassed by lower-level or out-of-process mechanisms, and hence rarely used.
And while it does little to improve the ecosystem's overall security, it has a noticeable maintenance cost for the OpenJDK community, particular for those responsible for security.
So it was deprecated for removal in Java 17.

[jep-411]: https://openjdk.org/jeps/411
[ijn#5]: https://www.youtube.com/watch?v=HLrptRxncGg

### State of Affairs

The OpenJDK community has been focused on removing direct dependencies of JDK code on the security manager or its APIs, for example from [jstatd][jdk-8272317] or [J][jdk-8297794][M][jdk-8282803][X][jdk-8298966].
As mentioned in [2022's last Newscast][ijn#39], they've also added `callAs` and `current` to `Subject` as replacement for `doAs` and `getSubject`.
Overall, the people working on the security manager's removal have a good understanding of how its APIs should be degraded once support is actually removed, but there's no timeline for that yet.

JEP 411's _Future Work_ section mentions a few use cases, such as securing access to native code, which are currently often implemented by ~abusing~ creatively applying the security manager.
Some progress has been made, for example Panama's foreign function API offers various safeguards and improvements over JNI - read more on that specifically in [the _Safety_ section of JEP 434][jep-434-safety].
And there has been some research into other uses cases, but it's too early to say which of them, if any, will get replacement APIs.

[jdk-8272317]: https://bugs.openjdk.org/browse/JDK-8272317
[jdk-8297794]: https://bugs.openjdk.org/browse/JDK-8297794
[jdk-8282803]: https://bugs.openjdk.org/browse/JDK-8282803
[jdk-8298966]: https://bugs.openjdk.org/browse/JDK-8298966
[ijn#39]: https://www.youtube.com/watch?v=ghGvFcg6GEQ
[jep-434-safety]: https://openjdk.org/jeps/434#Safety

### `// TODO`

To evaluate your use of the security manager:

* check whether your app calls `System::setSecurityManager`
* and look out for the system property `java.security.manager` - for example, a launch script might set it to the class name of a custom security manager

If neither is the case, you're not using the security manager and are good to go.
If you do set the security manager, though, you need to investigate what exactly you're using it for, whether that is still timely, and what alternatives exist - carefully read JEP 411 for all of that.


## Value-Based Classes

I last looked into value-based classes shortly after Java 8 came out but when I read [JEP 390][jep-390], which was integrated in JDK 16, for this episode, I noticed that there are a number of very interesting changes and that overall, there's a quite a lot to talk about - more than I squeeze in today.
So I decided to cover it in detail in a future episode and cut this section here _really_ short.

Basically:

1. Rely on deprecation warnings or use jdeprecan to discover calls to the constructors of the eight primitive wrapper classes and replace them with calls to their static factory methods.
	So, for example, `Integer::valueOf` instead of `new Integer`.
	```java
	var num = new Integer(42); // 👎🏾
	var num = Integer.valueOf(42); // 👍🏾
	```
2. Avoid synchronization on value-based classes like `Optional` or the primitive wrapper classes.
	You can find them with the corresponding compiler warnings or the diagnostic VM option `DiagnoseSyncOnValueBasedClasses`, both introduced in JDK 16.
	If you set the option to 2, you get a log message every time the VM synchronizes on a value-based class instance and if you set it to 1, you get a fatal error instead.
	```java
	// in `main` method in class `Sync`
	synchronized (Optional.empty()) { }
	```

	```shell
	$ java -XX:+UnlockDiagnosticVMOptions
		-XX:DiagnoseSyncOnValueBasedClasses=2
		Sync.java

	# compiler warning
	> Sync.java:6: warning: [synchronization]
	>     attempt to synchronize on an instance
	>     of a value-based class
	>         synchronized (Optional.empty()) { }
	>         ^
	> 1 warning
	# runtime warning
	> [0,239s][info][valuebasedclasses]
	>     Synchronizing on object 0x000000045302d1b8
	>     of klass java.util.Optional
	```

For the backstory and more details, read JEP 390 or subscribe for the episode I'll make on this.

[jep-390]: https://openjdk.org/jeps/390


## Finalization

### The Back Story

Finalization is Java's OG resource management mechanism and has been around since its first release.

```java
// "root definition" of finalizers
// in java.lang.Object
@Deprecated(since="9", forRemoval=true)
protected void finalize() throws Throwable { }

// example in com.sun.jndi.dns.DnsClient
protected void finalize() {
	close();
}
```

Unfortunately, it has a number of undesired properties:

* it's always-on
* has unpredictable latency
* behavior in the finalizer methods is unconstrained
* neither threading nor ordering can be controlled

This leads to a difficult programming model, security vulnerabilities, unreliable execution, and sub-par performance.
So no wonder it was deprecated for removal in Java 18.
And this was just the short version - for the slightly longer one, watch [Inside Java Newscast #15][ijn#15], for the full version, read [JEP 421][jep-421]

[ijn#15]: https://www.youtube.com/watch?v=eDgBnjOid-g
[jep-421]: https://openjdk.org/jeps/421

### State of Affairs

The OpenJDK community is removing `finalize()` methods one by one and if I counted correctly, it went from 98 in JDK 8 to 55 in JDK 19 - progress but definitely still a way to go.
And while I don't have insight into how the removed ones were selected, I can tell you how I tackle such tasks and it's not by solving the hardest problems first.
So my personal guess is that the actual removal is still some time in the future.

```shell
# to get these numbers, clone jdk, check out a tag, and run:
grep -r --include=*.java "void finalize()" src/ | wc -l
# results:
#     jdk8-b120: 98
#     jdk-9+181: 92
#     jdk-10+46: 94
#     jdk-11+28: 90
#     jdk-12-ga: 78
#     jdk-13-ga: 76
#     jdk-14-ga: 74
#     jdk-15-ga: 73
#     jdk-16-ga: 70
#     jdk-17-ga: 67
#     jdk-18-ga: 64
#     jdk-19-ga: 55
#     jdk-20+26: 55
# this is a slight overcount - there are a few
# `void finalize()` methods in comments
```

### `// TODO`

At this point, you should be removing `finalize()` methods from your project.
You can find them with jdeprscan, of course, but if you don't have access to all code running in your application, you can also run it with Java Flight Recorder enabled and look out for the `FinalizerStatistics` event.

```shell
# launch app with flight recorder enabled
java -XX:StartFlightRecording:filename=recording.jfr ...
# analyze recording and look for finalization events
jfr print --events FinalizerStatistics recording.jfr
```

The primary replacement for finalizers are `try`-with-resources blocks, otherwise you may have to use the cleaner API - check the aforementioned Inside Java Newscast or JEP for details.

If finalizers remain but you're wondering how your project would be impacted if they're ignored, run it with the command line option `--finalization=disabled`.
Now, no finalizers are being executed - not yours, not your dependencies', not even the JDK's.

```shell
# run app without finalization
# (i.e. the GC won't call `finalize()`)
java --finalization=disabled ...
```

Compared to a run without that option, a close look at memory profiles for heap and native memory as well as statistics from `BufferPoolMXBean` and `UnixOperatingSystemMXBean::getOpenFileDescriptorCount` should reveal whether there are any issues mounting up.
If they all look good, you have some assurance that your application will not be impacted by the eventual removal of finalization.


## RIP

There are a few technologies that projects on Java 11 or older might still be using but are already removed:

* the concurrent mark sweep garbage collector [was removed][jep-363] in 14 - in most cases G1 is an equivalent or better replacement
* the JavaScript engine Nashorn [was removed][jep-372] in 15 but continues to exist as a stand-alone project - there's a link to [their GitHub][nashorn] in the description
* RMI activation [was removed][jep-407] in 17 - nobody seems to be using it any more and as far as I'm aware there's no alternative technology
* biased locking [was deprecated for removal][jep-374] and deactivated in 16 and [removed][jdk-8256425] in 18 - you can still use it on 16 and 17 with the VM option `UseBiasedLocking` but unless your code executes _a lot_ of uncontested synchronized operations, which is almost exclusive to pre Java 1.2 code, you won't see a performance benefit from turning it on

And that's it for deprecated and removed technologies - you made it!
See, it wasn't that bad.
Did you like the Displates - which one was your favorite?

[jep-363]: https://openjdk.org/jeps/363
[jep-372]: https://openjdk.org/jeps/372
[jep-407]: https://openjdk.org/jeps/407
[nashorn]: https://github.com/openjdk/nashorn
[jdk-8256425]: https://bugs.openjdk.org/browse/JDK-8256425
[jep-374]: https://openjdk.org/jeps/374


## Outro

So about those news.
I've been working in this room for over 6 years now and... that was ok, it did its job well, but it's also pretty small and boring - both on camera and just to be in 10 hours a day.
So I'm really looking forward to my new office/studio that I will move into over the next weeks.
Expect me to show you around three episodes from now - the next episode will be done by my colleague Ana-Maria Mihalceanu and the one after that I'll take you on vacation again.

And that's it for today on the Inside Java Newscast.
Do all the YouTube things and say "Hi" from me to Ana in two weeks.
So long...

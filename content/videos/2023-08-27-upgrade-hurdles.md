---
title: "Upgrading From Java 17 To 21: All You Need To Know"
tags: [java-21, migration]
date: 2023-08-27
slug: road-to-21-upgrade
videoSlug: road-to-21-upgrade
description: "Java 21 is chock-full of great features but that's for naught of you can't actually upgrade, so I've collected all potential upgrade hurdles and we'll go over every issue that you may encounter on the road from Java 17 to 21"
featuredImage: road-to-21-upgrade
---

Java 21 is chock-full of great features and if you're coming all the way from 17, there's a plethora of additions to use and get used to.
From pattern matching to sequenced collections and countless API additions, from faster GC and overall performance improvements to better security, from virtual threads to better JFR and much, much more - you'll see improvements in all areas.
And that's all great and in the coming weeks we'll tell you all about that in the "Road to 21" video series that you're currently watching the first episode of.

But it's all for naught if you can't actually update.
And while there isn't one big hurdle, there are plenty of small ones that may cause hiccups when you're moving your project to Java 21.
So to make sure that you can hit the ground running, I've collected them all and we'll go over every issue that you may encounter on the road from Java 17 to 21, although I'm sure most of you will only see a tiny fraction.

We'll cover changes in existing APIs that may require you to update your code, ongoing deprecations, and who better to do that than Dr. Deprecator himself, changes in networking and encoding, runtime and tools.
If you want to follow up on any of this, there are plenty of links in the description.
But we'll also go beyond the nitty-gritty details and see the bigger picture of how to best prepare and execute your Java and 3rd party updates.

Ready?
Then let's get on the road!
The metaphorical one.
I'm not gonna get in a car or anything.
I'll be right over there at my desk.
Roll the intro!

> There are two sets of bug fixes that may change your code's behavior
>
> We've made those changes to make room for Loom's virtual threads
>
> We also have two changes on the class-loading front

## APIs

Let's start with some API changes.

### Sequenced Collections

> Several elements have been added to the collections framework and the biggest of them is of course the two new interfaces `SequencedCollection` and `SequencedSet`.

We'll get to that, Jose, but we also need to let people know that the introduction of these new interfaces [may lead to conflicts with external implementations of the collection interfaces](https://inside.java/2023/05/12/quality-heads-up/).
So if you or your dependencies contain any of those, be aware that you may encounter method naming conflicts or issues with covariant overrides and type inference.

```java
public class StringList
	extends AbstractList<String>
	implements List<String> {

	/* [...] */

	public Optional<String> getFirst() {
		return size() == 0
				? Optional.empty()
				: Optional.of(get(0));
	}
}

// ✅ up to Java 20: compiles successfully

// ❌ since Java 21:
// error: getFirst() in StringList cannot
//   implement getFirst() in List
//     public Optional<String> getFirst() {
//                                 ^
//   return type Optional<String> is not
//   compatible with String
```

You may have to refactor some code or update a dependency or both to fix that.


### XSL Transformations

If you're converting XSLT stylesheets to Java objects with the JDK XSLT transformer, [you may encounter this exception](https://www.oracle.com/java/technologies/javase/20-relnote-issues.html#JDK-8290347) if the template is too large:

```
com.sun.org.apache.xalan.internal.xsltc.compiler.util.InternalError:
Internal XSLTC error: a method in the translet exceeds the Java Virtual Machine
	limitation on the length of a method of 64 kilobytes. This is usually
	caused by templates in a stylesheet that are very large. Try restructuring
	your stylesheet to use smaller templates.
```

You either need to split it into smaller templates or use a third-party transformer.

### Bug Fixes

There are two sets of bug fixes that may change your code's behavior and that you should look out for.

First, `Double.toString()` and `Float.toString()` [now correctly determine](https://inside.java/2022/09/23/quality-heads-up/) the smallest number of digits that still uniquely distinguish the float or double from its adjacent float or double.
So, for example, calling `Double.toString(1e23)` will now print "1.0E23" instead of 9.a-lot-of-ninesE22.

```java
// 🤔 up to Java 18:
jshell> Double.toString(1e23)
$1 ==> "9.999999999999999E22"

// ✅ since Java 19:
jshell> Double.toString(1e23)
$1 ==> "1.0E23"
```

The other change concerns `IdentityHashMap`.
Its methods `remove(key, value)` and `replace(key, value, newValue)` erroneously compared `value` arguments to the values in the map with `equals` even though it's the _identity_ hash map.
So [that's been fixed](https://www.oracle.com/java/technologies/javase/20-relnote-issues.html#JDK-8178355), which might mean that code now removes and replaces fewer elements than it used to.

```java
record User(String name) { }

public static void main(String args[]) {
	var users =
		new IdentityHashMap<String, User>();
	String key = "abc";

	// add a (key, user) combination
	users.put(key, new User("Jane Doe"));
	// try to remove an EQUAL but
	// not IDENTICAL combination
	var removed = users
		.remove(key, new User("Jane Doe"));

	// according to the `IdentityHashMap`
	// contract there should've been no
	// removal

	// ❌ up to Java 19: assertion fails
	// ✅ since Java 20: assertion passes
	assert !removed;
}
```

## Ongoing Deprecations

Dr. Deprecator here with some [deprecation news](https://www.youtube.com/watch?v=3HnH6G_zcP0) between JDK 17 and JDK 21.

### `Thread` And `ThreadGroup`

First, let's start off with the `Thread` API:
The `Thread.stop`, `Thread.suspend`, and `Thread.resume` APIs [have now been changed](https://inside.java/2022/11/09/quality-heads-up/), so that they unconditionally throw `UnsupportedOperationException`.
They don't actually operate on the target thread.
We've made those changes to make room for Loom's virtual threads.
If your application uses any of those `Thread` APIs, you're gonna have to change it.
We also made some changes to [the bulk operations on `ThreadGroup`](https://www.oracle.com/java/technologies/javase/19-relnote-issues.html#JDK-8284161).

### Security Manager

Another area to keep your eye on is [the security manager](https://www.youtube.com/watch?v=HLrptRxncGg).
[It was deprecated for removal in JDK 17.](https://openjdk.org/jeps/411)
[One change you'll need to make](https://inside.java/2021/12/06/quality-heads-up/) in JDK 21 is to make sure to set the `java.security.manager` property to `allow`, in order for your application to call the `setSecurityManager` API.

Another change we're contemplating is, even in the future, after we removed the security manager, are we still going to have the `getSecurityManager` API return `null`.
Most things that use security features only do the check permissions test if `getSecurityManager` returns non-`null`.

```java
if (System.getSecurityManager() != null) {
	// check permissions
}
```

So if you're still calling `getSecurityManager` and you test it properly for `null`, your code will continue to work in the future.

### Finalization

Another area to look out for is [finalization](https://www.youtube.com/watch?v=eDgBnjOid-g).
That's still [deprecated for removal](https://openjdk.org/jeps/421) but it still exists in JDK 21.
If you want to find out if your application uses finalization, you can disable finalization from the command line.
Provide the `--finalization=disabled` option on the command line and run your application and see if it is affected by having finalization disabled.
If your application is relying on finalization, you should take a look at your code and see if you can convert it to use `try`-with-resources or cleaners instead of finalization.

### Other Deprecations And Removals

Some additional APIs have been marked as deprecated.
They include `Subject.doAs`, the m-let mechanism, the `SynthLookAndFeel.load` API that takes a `URL`, and also several `URL` constructors.

A couple of things have been removed since JDK 17.
One of them is the `java.lang.Compiler` API.
Closely related to that API is a system property called `java.compiler`.
You used to be able to set that on the command line to effect the JIT compiler, but that's been removed as well.

### Dynamic Agents

Another change in JDK 21 is that [dynamic loading of agents will now issue a warning](https://openjdk.org/jeps/451).
Certain libraries such as Mockito in particular will load agents dynamically and thus they will start issuing a warning.
In the future dynamic loading of agents may be disabled by default.

That's it for deprecation news.
Back to you, Nicolai.


## How To Learn More

Thank you, Dr. Deprecator!
I see you've been hard at work, making everybody's life more complicated.
But I understand it's necessary:
We need to unravel some bad or just outdated decisions, so Java can keep moving forward.
And there are plenty of ways to ease deprecations and other migration challenges.
Here are a few ways how you can make your life easier:

### Build More

First and foremost, please build on more Java versions than just the one you're baselining on.
I recommend to build on:

* your baseline Java version, for example Java 11
* every version after that that gets long-term support, in this example 17 and very soon 21
* the latest version, at the moment that's still 20, again soon that's 21
* and on the early-access builds of the next version, so now that's 21, but in fact JDK 22 EA builds are already available, so you could do that already as well

You don't need to build every commit on all these versions if that takes too long or too many resources - a nightly build would suffice.
And if only parts of your build work, maybe only half the subprojects, then run only those.
Or deactivate troublesome tests on specific Java versions.
The goal here is to become aware as early as possible whether a technology you use or a change you make causes problems on newer Java versions and for that you need to build as much of your code base as possible.

### More News

If you want to accompany the practical approach with some theory, you have quite a few options:

* You can subscribe to this channel!
  We regularly cover these developments, for example all ongoing deprecations in Inside Java Newscast #41.
* You can regularly visit inside.java, or, if you're above 40 years old, subscribe to the RSS feed.
  Inside.java aggregates all important developments in OpenJDK and changes like these pop up there.
* When a new Java version is released, you can go over the release notes.
  I know that sounds old-school and boring but, look, there are sections like _Removed Features and Options_, _Deprecated Features and Options_, and _Known Issues_!
* Similarly, Javadoc has a list of deprecated APIs and since JDK 19, you can filter by which version something got deprecated.
  Cutting edge!

If you want to become more active and feed your experience back into the community, my colleague David Delabassee has something for you.
But before we get to that, let's look at some changes in networking and encoding.


## Networking

In the spirit of every improvement breaks someone's workflow, we got some in networking that I would descibe as very positive but may require some code changes.

On Windows, network interface names in Java [now equal those assigned by the operating system](https://inside.java/2023/05/08/quality-heads-up/).
You probably need to update calls to `NetworkInterface::getByName`.

```java
var net = NetworkInterface
	.getByName("eth0");
System.out.println(net);
System.out.println("---");
NetworkInterface
	.networkInterfaces()
	.map(NetworkInterface::getName)
	.forEach(System.out::println);

// Example output up to Java 20 / 🪟:
//
// name:eth0 (WAN Miniport (IPv6))
// ----
// lo
// net0
// eth0

// Example output since Java 21 / 🪟:
//
// null
// ----
// ethernet_0
// ethernet_32768
// loopback_0
```

When you're using the `URL` class, first, you probably want to reconsider that and switch to `URI` instead.
But anyway, if you _are_ using it, be aware that [parsing and validation of the URL string moved](https://inside.java/2022/11/22/heads-up/) from calls like `URL::openConnection` and `URLConnection::connect` to the constructor, so you may get exceptions there when you didn't before.
You can set the system property `jdk.net.url.delayParsing` to configure the old behavior if need be.

Similarly, built-in JNDI providers [are now more strict](https://www.oracle.com/java/technologies/javase/19-relnote-issues.html#JDK-8278972) with the URLs they accept.
If that's an issue, you can use these system properties to configure their behavior:

* for "ldap:" URLs: `com.sun.jndi.ldapURLParsing`
* for "dns:" URLs: `com.sun.jndi.dnsURLParsing`
* for "rmi:" URLs: `com.sun.jndi.rmiURLParsing`

The last network-related change I have for you concerns the HTTP client that was added in Java 11.
The idle connection timeout [was lowered](https://www.oracle.com/java/technologies/javase/20-relnote-issues.html#JDK-8297030) from an extremely lenient 20 minutes to 30 seconds and [can now be configured](https://www.oracle.com/java/technologies/javase/20-relnote-issues.html#JDK-8288717) with the system properties `jdk.httpclient.keepalivetimeout` and `jdk.httpclient.keepalivetimeout.h2` (for HTTP/2).


## Encoding

### UTF-8 By Default

For the next topic, we can sit back and watch past Nicolai do the heavy lifting.

> 11110000 10011111 10010101 10001010
>
> What's that?
> Well, if you interpret it as a bit pattern that encodes a string in UTF-8, it's the peace dove "🕊️".
> Whereas if you think it's Windows-1252 encoded, it's whatever "ðŸ•Š" could be.
> As you can see (and probably already know), encoding matters, particularly for a language that's big on "write once, run anywhere".
>
> That's why Java APIs that deal with reading and writing files usually have overloads that let you specify a file's encoding.
> But you don't _have to_ specify one, in which case Java usually uses the so-called default charset.
> This default used to be chosen based upon the operating system, the user's locale, and other factors.
> In JDK 18, [this default will always be UTF-8](https://inside.java/2021/12/10/quality-heads-up/), so Java programs are more predictable and portable when relying on the default.
>
> For most projects, this change will go unnoticed.
> Those that embrace portability by passing charset arguments as well as those setting the system property `file.encoding` to UTF-8 will see no impact at all.
> Those who do neither but target MacOS or Linux are most likely already using UTF-8 because it's usually the default on those operating systems.
> This mostly leaves programs that target Windows and implicitly rely on its non-Unicode-encoding at risk.
>
> The best way to fix any issues is to either switch to UTF-8-encoded files or always pass a character set to the relevant APIs.
> When that isn't possible or desirable, take a look at JEP 400 for how to use the new `file.encoding` value `COMPAT`, the new system property `native.encoding`, and the compiler's `-encoding` flag to tackle problems.
> If you're not switching to JDK 18 any time soon, the best way to prepare is to set `file.encoding` to `UTF-8` now and shake out any issues over the coming weeks and months.
>
> Besides [JEP 400](https://openjdk.java.net/jeps/400), there's also [a great article by Naoto Sato](https://inside.java/2021/10/04/the-default-charset-jep400/) on this topic - linked below of course.

### CLDR Version 42

The JDK also regularly updates the Unicode version it's using and that can occasionally cause hiccups.
Particularly [the update](https://inside.java/2023/03/28/quality-heads-up/) to [Unicode CLDR version 42](https://cldr.unicode.org/index/downloads/cldr-42) may not go unnoticed:

* in formatted times, dates, and units, it replaced regular spaces with non-breaking and narrow non-breaking spaces

```java
var midFormat = DateTimeFormatter.ofLocalizedTime(FormatStyle.MEDIUM);
// up to Java 19: ` 6:14:18 PM`
// since Java 20: `6:14:18 PM` (narrow space before "PM")
System.out.println( LocalTime.now().format(midFormat) );
```

* some date/time formats no longer say " at " between between date and time or time range

```java
var longFormat = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.LONG);
// up to Java 19: ` August 27, 2023 at 6:14:18 PM CEST`
// since Java 20: `August 27, 2023, 6:14:18 PM CEST` (no "at" after "2023")
System.out.println( ZonedDateTime.now().format(longFormat) );
```

* it fixes the first day of week info for China
* expanded support for Japanese numbers
* and introduced a few more small changes

These changes mostly impact the presentation layer but if you have code, production or test code, that parses strings, things may start failing.
And it can be a little tricky to analyze because your terminal or IDE might make it impossible to distinguish between a space and a non-breaking space.
So if you see weird failing tests around date/times where _expected_ and _actual_ look the same, think back to this and drop them into an editor that highlights non-standard characters.

If the required fixes cannot be implemented, you can set the JVM argument `java.locale.providers=COMPAT` to use legacy locale data but note that this limits some locale-related functionality and treat it as a temporary workaround, not a proper solution.
Particularly because the `COMPAT` option will be removed in the future.


## Quality Outreach

> Zoom ringtone

Hey David!

Hi Nicolai.

We're talking about hurdles when upgrading to new Java versions and you said you have something for us?

Yes, I'd like to quickly introduce [the OpenJDK Quality Outreach program](https://wiki.openjdk.org/display/quality/Quality+Outreach).
So it's a program where we encourage open source projects to do their tests on early-access builds of OpenJDK.
The idea is pretty simple:
If there is an issue in those early-access builds, we'd like to know it sooner rather than later as it gives us a chance to address that issue before that particular version is generally available.
And, in the end, that's a win-win situation:
It's a win for the open source project as that project will run, starting day one, on the newer Java version, but on the other hand it's also a win for the OpenJDK community at large as those reports help to improve the overall quality of OpenJDK builds.

So who can participate in this?

So, any open source project can participate in the program.
And it's pretty easy:
A contributor or a maintainer of the project just needs to ping us and we'll enroll the project in the program.

Say I exclusively work on closed-source software, what can I get out of Quality Outreach?

So, if you work on a closed-source project, in fact you are already getting benefits out of the Quality Outreach program.
As I mentioned earlier, this program improves the overall quality of OpenJDK builds, so everybody benefits from this program.
Now, as part of the program we also issue regular Quality Outreach Heads-ups.
In those heads-ups we cherry-pick improvements, changes, or fixes, small or big, to draw attention to those - it can be a behavior change due to a fix that addresses a compatibility issue and so on and so on.
So we communicate those changes and often we provide some best practices, we document how to keep the old behavior should this be required, and so on and so on.
It's, again, the type of information that you ideally want to know sooner rather than later.
And those heads-ups are useful regardless of your project.
Open source or closed source, it doesn't matter because in the end we are talking about the Java platform, right?

And where can I find these outreaches?

So, those heads-ups are sent to all projects enrolled in the Quality Outreach program, but in addition they are also published on inside.java and we have a dedicated page [inside.java/headsup](https://inside.java/headsup/).

See, I told you that inside.java is very helpful!
Thank you David for letting us know about Quality Outreach.
Bye!

Bye!

Time for us to tackle the last two topics: The JDK runtime and tools and then 3rd party projects.


## Runtime

On the runtime front you should be aware of a few VM options that are going away.

### Obsolete Options

Biased locking [was disabled by default](https://www.oracle.com/java/technologies/javase/18-relnote-issues.html#JDK-8256425) and deprecated in JDK 15 and now related VM options like `UseBiasedLocking` are obsolete:

* `UseBiasedLocking`
* `BiasedLockingStartupDelay`
* `BiasedLockingBulkRebiasThreshold`
* `BiasedLockingBulkRevokeThreshold`
* `BiasedLockingDecayTime`
* `UseOptoBiasInlining`

G1's [remembered sets](https://www.oracle.com/java/technologies/javase/18-relnote-issues.html#JDK-8017163) and [concurrent refinement threads](https://www.oracle.com/java/technologies/javase/20-relnote-issues.html#JDK-8137022) were refactored or replaced entirely, which impacts options `G1RSetRegionEntries` and `G1RSetSparseRegionEntries` as well as `G1UseAdaptiveConcRefinement` and... all these:

* `G1ConcRefinementGreenZone`
* `G1ConcRefinementYellowZone`
* `G1ConcRefinementRedZone`
* `G1ConcRefinementThresholdStep`
* `G1ConcRefinementServiceIntervalMillis`

For background info on this and a summary of all the cool garbage collection improvements, check out the RoadTo21 episode  on GC & performance next week.

> G1 region size can now be set up to 512 MB, previously it was 32.
> This can be helpful for reducing memory fragmentation on applications that work with a lot of large objects.
> G1 now uses a single mark bitmap instead of two which can save about 1.5% of heap space.

But back to these options.
For now, using them will result in an obsolete option warning but once they're fully removed, you'll get an unknown option error instead.
Either way, removing options that don't do anything is highly recommended to ease understanding and maintainability.

### Class Loading

We also have two changes on the class-loading front:

If you're running bytecode that was compiled on Java 1.4 or earlier, you can have classes with a name that end in a forward slash.
That isn't legal, though, and [JDK 21 will enforce the JVM specification](https://inside.java/2022/02/10/quality-heads-up/) and throw a `ClassFormatError` upon encountering them.

The other change is a bit weird and I don't understand it well enough to give you a short explanation, so instead I'll describe under what circumstances you may want to check out [the link in the description](https://inside.java/2022/11/14/quality-heads-up/) (remember, there are follow-up links for everything I mention here):

* if you're having a custom class loader
* that does not register as parallel cabaple
* or if it's pre-dating JDK 7

Got that?
Good.
If that sounds familiar, check the link.

### Metal 🤘

The last item on the runtime list is for desktop application developers:
On macOS Java [now uses](https://inside.java/2022/04/27/quality-heads-up/) [the Metal rendering pipeline](https://www.youtube.com/watch?v=gPuI_pbCYOI) instead of the Apple OpenGL API.
If that's a problem for you, you can revert to OpenGL by setting the system property `sun.java2d.opengl` to `true`.
But given that all Apple devices running at least macOS 10.14, which was released five years ago, support Metal, maybe see that property as a temporary workaround.


## Tools

Now let's come to a few small changes to various JDK tools that may require you to update your build tool configurations or scripts:

If you compile with `lint:serial`, note that you [will now get a warning](https://bugs.openjdk.org/browse/JDK-8274336) if a serializable type has a non-serializable and non-transient instance field.

The `jar` tool [no longer generates an index](https://bugs.openjdk.org/browse/JDK-8302819).
Its option `--generate-index` is hence ignored and leads to a warning, and the runtime ignores an index if it's present.

`jlink`'s option `--compress` [now accepts values `zip-0` to `zip-9`](https://bugs.openjdk.org/browse/JDK-8293499) instead of the more abstract `0`, `1`, `2`.
This is actually caused by an addition to `jmod`:

> The main purpose of `jmod` is to create a module file having the `jmod` extension that encapsulates a set of compiled Java classes, resources, and other related files.
> You can distribute these module files to be consumed by other modules or applications.
> In order to specify a compression level while creating the `jmod` archive, you can use the `--compress` command line option.

You can learn more about that and all the good stuff that changed in Java tools in Ana's RoadTo21 video on the topic once it's out.

Finally, if you're using `jpackage --app-image`, you can expect [more diligent checking of some requirements](https://github.com/openjdk/jdk19/pull/9), like the presence of the `.jpackage.xml` file, and thus potentially new errors if your build config was faulty.

My guess is that most of these changes to JDK runtime and tools don't concern you, though, or are very easy to fix with removing or reconfiguring an option here or there.
The next topic may require a bit more work, though.


## 3rd party tools

Because it's not only your code that can be impacted by changes like this, it also happens to the tools and dependencies you rely on.
One regular change in particular causes issues for some of them and that's the increase in bytecode level.
When you compile with target 21, for example, the compiler embeds the bytecode level that corresponds to that Java version, 65 in this case, in the generated bytecode.
And bytecode manipulation libraries like ASM and bytecode analysis tools wisely avoid working on bytecode from a level they weren't written for.

There's some work being done on improving this situation but for now a JDK update often entails updates of all tools and dependencies that manipulate bytecode, which may be a few more than you're initially aware of.
Fold in all the other changes we talked about and the unfortunate reality is that you may have to update most of your tools and dependencies.
Then again, it's probably a good practice to do that anyway, so I really hope the step from JDK 17 to 21 is not the only occasion on which you update other stuff.

Updating dependencies neatly leads us to the last topic I want to discuss with you today and that's how to go about a JDK update.
Where to start and where to go from there?


## How to

In my opinion, the best approach is the gradual one.
Follow my advice from earlier and build on each JDK version as it's being developed and then go over the release notes once it's released and you'll catch most of these issues very, very early and adapt to them step by step.
At least to those that can be adapted to in a way that keeps working on your baseline Java version.
You can already refactor methods that conflict with sequenced collections, split your large XSLT stylesheets, reduce the use of deprecated mechanisms, set the default encoding to UTF-8, and generally update dependencies as they become compatible with newer Java versions.
But of course you can't change the values you pass to `jlink --compress` to ones that don't yet work on JDK 17, for example, or use the actual network device names on Windows - those changes should go on a list, probably with some pointers to which of your classes they'll impact, that you pull out when it's time to do the update.

And when that time rolls around, step zero is always: update your dependencies and tools.
Again, you should be doing that regularly anyway for a host of reasons, but specifically in this situation.
Then, don't jump from 17 to 21.
Or rather, try that but as soon as you see issues, go back to 18, then 19, and so forth.
I'll leave a link to [the JDK archive](https://jdk.java.net/archive/) in the description, so you can easily find those versions.
Just don't run them in production!
This allows you to pinpoint which Java version causes an issue you observe and helps immensely with research, starting with the release notes and followed by a search with that version as one of the terms.

And... that's it.
Unfortunately, there is no one weird trick that makes all updates super simple.
The only simple move, would be not to play. 😉
But then, you don't get to all the good stuff that comes with new Java versions and now that we got the hard work out of the way, we can play.
Here are a few snippets from the videos we made for you and that will come out between now and the JDK 21 release.
You don't want to miss this...

## Highlights

> You will learn how the JDK 21 will make your work easier.
> We will cover the `String` class, collections framework...

> Enter `jwebserver`, a minimal HTTP static file server.

> Generational ZGC is arriving with JDK 21.

> ... date-and-time API, the HTTP client API ...

> Patterns, switch, and sealed types

> This is exactly the role of a virtual thread and instead of blocking the platform thread, it unmountes itself from this platform thread.

> The JDK Flight Recorder captures events related to cryptographic operations and in JDK 20 two more events were added.

> Just like lambda expressions turned the strategy pattern into a language feature, does pattern matching turn the separation of types and operations into a simple application of a few language features.

> ... concurrent programming, the `Math` API, and `BigInteger`.

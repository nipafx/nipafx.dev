---
title: "What Happens to Finalization in JDK 18? - Inside Java Newscast #15"
tags: [java-18, deprecation, migration, reflection]
date: 2021-11-11
slug: inside-java-newscast-15
videoSlug: inside-java-newscast-15
description: "Finalization was part of Java from day one to help developers manage resources but it turns out that it's really not good at that. Here's why and what's gonna happen next. Also, reflection and method handles."
featuredImage: inside-java-newscast-15
---

## Prelude

You know what I like best about observing Java evolve?
Well, that Java gets better and better obviously, but right after that?
That every time something new comes or something old goes, I don't just learn about that thing, but also about Java's history or its internals, about why it is the way it is and why that's not as good as it could be.
It gives me a deeper understanding of Java as a whole that goes way beyond that one thing.

Why am I telling you this?
Is it to give you a reason to stick with me through a topic that could otherwise be considered somewhat boring?
No... I would never play such cheap tricks on you.

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle and today we're gonna talk about finalization and then later a tiny bit about reflection.

Ready?
Then let's dive right in!


## Finalization

Ok, so finalization... what is it, what are its problems, and what's going to happen now, meaning probably in Java 18?

Finalization has been with Java from day one.
It is intended to let us avoid resource leaks like amassing and never releasing file handles until the file system won't hand out any more or not releasing off-heap memory until it runs out.
It's not very good at that, but more on that later.
For now, lets see how it works.

So how do you know when you can release a resource?
How can you be sure that nobody's using it any more?
One easy answer is:
When nobody references the instance that holds the resource.
And, oh how handy, the garbage collector knows when that's the case!
So let's take these two mostly unrelated responsibilities and mix'em up really good, nothing bad ever came from that.

_script says "sarcastic blink"_

All in all, here's how it works:
A class that handles a resource, say web sockets, will implement the protected method `finalize` - called a finalizer - and therein close all resources.
If an instance of that class become unreachable, the GC will figure that out and schedule to call the `finalize` method at some point before it reclaims the object's memory.
Sounds good?
Well...

### The Flaws of Finalization

Did you notice the weasel words?
The GC will call the finalizer _at some point_ in the future.
Here's a fun thought experiment:
Say your app launched and went through the initial churn and now the old generation only grows very slowly, which means the GC only processes it very rarely.
And lets assume your resource-handling objects are usually tenured into the old generation before becoming unreachable.
So all your unused-but-not-yet-closed resources hang out in the old generation, ready to be closed during finalization, but the GC isn't in any rush to do that because its concern is heap memory, which you still have plenty of.
You could be running out of file handles or web sockets even though you don't use them any more, just because they're not yet released.

Another scenario:
Your app needs resources in sudden spikes and during those phases you acquire resources faster than the GC gets around to collecting them.
Again, you may run out just because releasing resources is arbitrarily delayed.

Other weasely behavior comes from words not said:
Which threads handle finalization and in which order are objects finalized?
Both is unspecified and can't be controlled.
That means when writing a finalizer, you're automatically in a multi-threaded situation where you can't rely on much around you.
If your class is also serializable, the interaction between construction, deserialization, and finalization turns this headache into a nightmare.
And even if you get all of it right, subclasses can easily make this house of cards collapse if not coded with equal care.

And that doesn't even take malice into account.
Finalizers have no restrictions on them, so if they manage to add a reference to the object that's being finalized to somewhere reachable, the object can't be collected after all - it's resurrected!
So a fiendish subclass and byte stream can collaborate to present your deserialization with an instance in an illegal state and when you reject it, bring it back from the brink of collection, and stuff the broken-but-resurrected instances somewhere in your system to wreak havoc.
I think this what the experts call a _security vulnerability_.

Last but not least, finalization is a performance drag - not huge, but measurable.
Garbage collectors obviously need to handle them, which can lead to increased pause times and data structure overhead - for example, [the ZGC team estimates][1] a 1.5% memory footprint reduction for their collector.
This is particularly annoying if only a few of a class' instances need finalization because it's always on for all of them - there's no way to register or deregister an instances for finalization - if it has the method, it gets treated accordingly.

With all of that said, what's next?
I think it's time to shave this old beard off.

[1]: https://twitter.com/perliden/status/1455468089626222592

### The Plan for Finalization

* Step 1: Deprecate it.
* Step 2: Deprecate it for removal.
* Step 3: Offer a command line flag to turn finalization off.
* Step 4: Disable finalization by default with an option to re-enable it.
* Step 5: Remove the finalization mechanism.
* Step 6: Remove the terminally deprecated methods.

Step 1 happened in Java 9.
Steps 2 and 3 are proposed by JEP 421, more on that in a second, and will probably happen in Java 18 or 19.
Steps 4 to 6 are still on the drawing board, including whether these will even be the exact steps, so predictions are unreliable, but I guess that they will each happen with a year or more in between.
That means the journey from finalization's initial deprecation in 2017 to its eventual removal in a few years will probably take about a decade - more than enough time for the ecosystem to wean off its alluring promises and replace it with better alternatives.

### JDK Enhancement Proposal 421

[JDK Enhancement Proposal 421][jep-421] plans to mark finalization for removal.
Specifically, the annotation `@Deprecated(forRemoval=true)` will be added to `Object`'s `finalize` method, all `finalize` implementations in public non-final classes, and to `Runtime::runFinalization` and `System::runFinalization`.
There will also be a command line flag that disables finalization entirely, so you can test your application's correctness.

For that, a set of benchmarks is really handy, or a test suite that you can observe with a profiler.
Once this JEP lands, you'd run that suite with and without the flag and closely compare memory consumption, file handles, network connections, and indicators for other resources your project acquires.
If nothing changes, you're all set.
If it does, the tricky part begins:
You need to hunt down which ignored finalizers in your code or your dependencies were responsible for those resources and replace them or point it out to the maintainers.

[jep-421]: https://openjdk.java.net/jeps/421

### Replacing Finalizers

So what do you replace finalizers with?
First and foremost, [try-with-resources blocks][try] - as most of you have probably been screaming at the screen for the last three minutes.
Classes handling resources should be `AutoCloseable` and be used with try-with-resources blocks to release resources as soon as they're no longer used.
This is not only safer, more reliable, and more efficient, it also makes resource management explicit in the code instead of hiding it in some behind-the-scenes GC process.

```java
var line = "";
var processed = false;
var error = false;

try (var reader =
	new BufferedReader(
		new FileReader(path))) {
	line = reader.readLine();
} catch (IOException ex) {
	error = true;
} finally {
	processed = true;
}

// compiler guarantees that
// `reader.close()` has been called
```

Not all lifecycles work with try-with-resources blocks, though.
Where they don't and where off-heap memory in particular is handled, Project Panama's [foreign memory API][2] can solve the problem.
Incubating since Java 14, I'm gonna go out on a limb and predict that it will land before finalizers are removed.
It has a much more deliberate approach to time-scoping and thread-scoping resources than `ByteBuffer` and its companions.
I recommend to check out [Inside Java Podcast number 9][3], where David Delabassee, Maurizio Cimadamore, and Jorn Vernee talk about this very topic.

```java
try (var scope = ResourceScope.newConfinedScope()) {
	var segment1 = MemorySegment.map(
		Path.of("someFile"), 0, 100000, MapMode.READ_WRITE, scope);
    var segment2 = MemorySegment.allocateNative(100, scope);
    // ...
}

// at this point, both segments are released
```

In other cases where try-with-resources doesn't work, [the cleaner API][4], introduced in Java 9, is the last resort.
It's also a GC-based mechanism and shares finalization's weakness that resources are released at some arbitrary point in time, but it's much more limited than finalization and avoids most other problems:

* it can't resurrect objects
* objects are registered on demand instead of all instances of a class
* cleaner threads can be controlled by the dev
* subclasses can't interfere with their superclass' clean-up mechanism

Another weakness is that it's also not easy to use, although for different reasons than finalization.
We're gonna describe that API on more detail in the future on dev.java.

[try]: https://dev.java/learn/exceptions/catching-handling/#try-block
[2]: https://openjdk.java.net/jeps/419
[3]: https://inside.java/2020/12/11/podcast-009/
[4]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/ref/Cleaner.html

### Thinking Long-Term

I want to briefly get back to the six-step plan for finalization - the one that will take about a decade from start to finish.
The astute among you will recognize the similarity to [strong encapsulation][enc], which while technically concluded after about a decade in 2021, still has a few holdouts in the module _jdk.unsupported_, or the [removal of the applet API][applet], which was deprecated in 2017, for removal in 2021, and [the security manager][sec], which was deprecated for removal in 2021.
The JDK is slowly, very slowly, phasing out a few outdated mechanisms.
They're usually alluring but harmful to projects that use them, but the often equally and sometimes even more important downside is systemic:
They make the ecosystem as a whole less reliable and maintainable.

In dependencies, each access to internal APIs, each resource whose release depends on finalizers, each ill-handled security policy are a burden on the projects that use them.
Replacing these cases with stable and better-suited alternatives removes code that's often tough to maintain on the library side while also reducing the hassle of fixing problems that they occasionally produce on the use side.

Beyond that, these outdated mechanisms make the JDK itself harder to maintain and evolve because they often lie cross to other features and require constant consideration, work, and rework whenever something else gets improved.
Just removing finalization will remove code from garbage collectors and make them a tad more performant, will slightly simplify the Java Language Specification, and will remove a bunch of non-trivial code from the JDK.
Eliminating this price tag from all future work on Java is essential to keep it moving forward.

Queue complaints about serialization!

[enc]: https://openjdk.java.net/jeps/403
[applet]: https://openjdk.java.net/jeps/398
[sec]: https://openjdk.java.net/jeps/411


## Reflection

A quick word on [JEP 416][5], titled _Reimplement Core Reflection with Method Handles_.
It's in theme with what I just discussed: reducing the drag on future development.

At the moment, there are three JDK-internal mechanisms for reflective operations:

* VM native methods
* dynamically generated bytecode stubs and Unsafe
* method handles

Every new language feature, for example records or the upcoming primitive objects, requires updates to all three.

JEP 416 eliminates the second of the three by refactoring that path to use method handles instead.
This is integrated in the recent JDK 18 early access build and you can help the OpenJDK community verify that there are no performance regressions by testing your favorite project on it!
So please give it a spin and report any results back to [the appropriate mailing list][6] - links to that as well as [the OpenJDK pull request][7] and a bunch of other things I mentioned in the description.

[5]: https://openjdk.java.net/jeps/416
[6]: https://mail.openjdk.java.net/mailman/listinfo/core-libs-dev
[7]: https://github.com/openjdk/jdk/pull/5027


## Outro

And that's it for today on the Inside Java Newscast.
I hope I didn't promise too much when I said that explorations like these teach us more than just a single topic and really deepen our understanding of Java.
If you have any questions about what I covered in this episode, ask ahead in the comments below and if you enjoy this kind of content, help us spread the word with a like or by sharing this video with your friends and colleagues.
The next episode will be hosted by Jose or Billy, I'll see you again in four weeks.
So long...

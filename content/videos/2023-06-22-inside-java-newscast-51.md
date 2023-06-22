---
title: "Java 21 - The Other Side - Inside Java Newscast #51"
tags: [java-21]
date: 2023-06-22
slug: inside-java-newscast-51
videoSlug: inside-java-newscast-51
description: "OMG, how is there even more in JDK 21?! Scoped values preview, key encapsulation mechanism API, a new JFR command, and various API improvements. Generational Shenandoah is out, though, and it doesn't look good for the 32-bit Windows port either."
featuredImage: inside-java-newscast-51
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and I gotta say I'm a bit frustrated.
Making timely content for the start of rampdown phase 1 is haunting.
Over the two weeks it took me to script, record, and edit the last video, a few more features got added - from JFR to a new API to a handful of smaller additions to existing ones - one feature got removed, and I might've missed one or two details.
Oh, and new deprecations!
So we're gonna go over all that today, think of this episode as "What's happening" part 2 - the other side.
Ready?
Then let's dive right in!


## Scoped Values

The `ThreadLocal` API is used to store thread-specific information, usually in `static final` fields, which can then be queried from anywhere that variable is visible.
That's useful, for example, when a container, like a web server, needs to make information accessible to other parts of its code that it doesn't call directly but it doesn't want to pass that information on explicitly, either for convenience or integrity reasons.

```java
class Server {

	// `Principal` needs to be visible to other code...
	final static ThreadLocal<Principal> PRINCIPAL = new ThreadLocal<>();

	void serve(Request request, Response response) {
		var level = request.isAuthorized() ? ADMIN : GUEST;
		var principal = new Principal(level);
		PRINCIPAL.set(principal);
		// ... but not the application
		Application.handle(request, response);
	}

}
```

But `ThreadLocal` has a few shortcomings:

1. Anyone with access to the `ThreadLocal` field can not only read its value but also set a new one.
2. Values stored in `ThreadLocal` can be inherited from one thread to another.
  In order to prevent the other threads from reading an updated value (which the API should explicitly prevent - it's thread _local_ after all), the inheriting thread must create copies.
  These drive up memory use, especially when there are many threads - you know, the whole "millions of virtual threads" thing.
3. Once set, values must be explicitly removed (using the `ThreadLocal::remove` method) or they will leak beyond their intended use and continue to occupy memory.

To solve these problems, Java 20 incubated and Java 21 [previews the scoped values API][jep-446], which works by _binding_ a value to the `ScopedValue` instance and passing the code that is allowed to read that value as a lambda - that's the _scope_.

```java
class Server {

	final static ScopedValue<Principal> PRINCIPAL = new ScopedValue<>();

	void serve(Request request, Response response) {
		var level = request.isAdmin() ? ADMIN : GUEST;
		var principal = new Principal(level);
		ScopedValue
			// binds `principal` to `PRINCIPAL`, but...
			.where(PRINCIPAL, principal)
			// ... only in the scope that is defined by this lambda
			.run(() -> Application.handle(request, response));
	}

}
```

It addresses the `ThreadLocal` issues:

1. Within the scope, the bound value is immutable.
2. Accordingly, no copies need to be created when inheriting, which significantly improves scalability.
3. As the name implies, a scoped value is only visible within the defined scope - after that the value is automatically removed and so cannot accidentally leak.

To see scoped values in practice, watch [JEP Café #16][cafe-16].
In it, Jose talks about the version of the API as it was in JDK 20 but all that changes in 21, besides moving to `java.lang`, is that the scope, the lambda, can now be a `Callable`, `Runnable`, and `Supplier`.

[jep-446]: https://openjdk.org/jeps/446
[cafe-16]: https://www.youtube.com/watch?v=fjvGzBFmyhM


## No Generational Shenandoah

So, two weeks ago was June 8th, the beginning of rampdown phase 1, when all JEPs that target a JDK release are locked in.
Two hours before the Newscast goes live, news reaches me that 18 hours earlier Roman Kennke, owner of the generational Shenandoah JEP, proposed to drop it from JDK 21.
I hope you forgive me that I decided against recording a correction and then editing, rendering, uploading, and configuring the video in favor of catching my plane home.
Although, now that I say it out loud, I should've made the correction and charge Oracle for another week of holidays.

Well, that ship has sailed.
Unlike the generational Shenandoah one.
[On the issue][jdk-8260865], Roman wrote:

> The Shenandoah team has decided to skip JDK21 and take the time to deliver the best Generational Shenandoah that we can.

6-month release cadence for the win!
JDK 22 is basically around the corner and I hope we see generational Shenandoah, then.

[jdk-8260865]: https://bugs.openjdk.org/browse/JDK-8260865?focusedCommentId=14587756&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-14587756


## Key Encapsulation Mechanism API

Do you know the Diffie–Hellman key exchange algorithm?
If you don't, you should definitely look into it - on the face of it, it sounds impossible.
It lets two parties compute an encryption key, a number, while an observer that sees every exchanged message cannot feasibly redo the computation, so that key is a secret that only the two parties know.
As you can imagine that's very helpful when you need to exchange encrypted information between parties that have no prior knowledge of each other.
Diffie–Hellman is hence widely used, for example to provide forward secrecy in TLS.

Diffie–Hellman can be understood as an instance of a key encapsulation mechanism.
Such mechanisms are a building block of Hybrid Public Key Encryption and will be an important tool for defending against quantum attacks.
Starting with JDK 21, [Java has an API][jep-452] to represent key encapsulation mechanisms in a natural way.

Now you're wondering what that looks like.
Shouldn't I go into explaining that?
But that stuff is just too complicated for me...
But I don't have the time in this episode...
... and so I asked Ana to record a Newscast on this topic.
Probably in August - better subscribe so you don't miss it.

[jep-452]: https://openjdk.org/jeps/452


## Platform Integrity and Dynamic Agents

Integrity of the Java platform is a very interesting topic.
It's not flashy like new language features or APIs or tools, but it is very deep and essential for our use of Java.
We enjoy many invariants, from the initial value of variables to type safety, from array range checks to no "use after free".
And integrity guarantees that these invariants are actually invariant - that no code can undermine them!
This helps with correctness, maintainability, security, and performance.
But Java offers a few ways for code to undermine these guarantees, intentionally or inadvertently.

### Ron's Take on Integrity

But anyway, we have this deep reflection in Java and it means that we cannot trust anything.
You try to establish an invariant but you're back to C:
The only way you can know if it holds or not is if you analyze the entire code base and all of your dependencies.
And it is violated, even accidentally.
Even though everyone is well-meaning, no one here is malicious, your invariants do get broken.

Now, the big shift toward allowing you to establish integrity invariants in Java was the addition of modules in JDK 9.
The idea was that a module is an encapsulated unit that is _strongly_ encapsulated, so it prevents `setAccessible` unless you explicitly allow it.
So with modules you say, "ok, now can I trust, now I can establish integrity invariants in Java, now my encapsulation works".
Only there are ways to circumvent it.

You can have an ordinary library, again, a dependency of a dependency of a dependency and it _does_ happen.
We did a corpus search... we need to stop it because it happens.
It loads an agent dynamically, which means that the application owner does not know it does that, and that agent, what you can do is:
The `setAuthorized` method that does the authorization check?
It changes it to always return true.

Any library!
Any library on your class path can change the meaning of any other line of code in your program without you knowing it due to dynamically loaded agents.
Not statically loaded agents - statically loaded agents are fine because the application owner says:
"I'm allowing this agent to work.
I know - I take the risk."

Two others are `Unsafe`, which will gradually go away, and JNI.
So if you use JNI, JNI is not subject to any of the access checks, so what we will need to do is to say...
On the command line you will say "I'm allowing these modules to use JNI."

### JDK 21's Change for Dynamic Agent Attachment

That was from a conversation with Ron Pressler about this topic that we had during the 28 hours live stream.
It was really interesting and we went quite deep - we'll probably upload that in the coming weeks.

So what you heard there is that modules can guarantee platform integrity but are undermined by three mechanisms: `Unsafe`, agents, and native code (JNI and FFM).
Over the coming years, `Unsafe` will go away and the other two will have to be allowed explicitly by the application owner via command line flags.
For agents, that is already the case for those launched statically, in tandem with the application, but dynamic attachment at run time can still happen without you knowing.
In a first step to fix that, and that brings us back to this episode's topic, [JDK 21 will issue a warning][jep-451] when an agent is attached at run time.
In the future, this will very likely not be possible without setting a command line flag.

[jep-451]: https://openjdk.org/jeps/451


## New JFR Command

The JDK Flight Recorder is an amazing piece of tech and it's getting better with every JDK release.
21 added the [`view` command][erik-view] that displays aggregated event data on the terminal.
This way, you can view information about an application without the need to dump a recording file, or open up JDK Mission Control.
This topic, I pawned off to Billy, expect a Newscast on that in July.

[erik-view]: https://egahlin.github.io/2023/05/30/views.html


## API improvements

JDK 21 comes with a number of small additions to existing APIs.
Let's quickly go over them, so you're aware where the JDK can do your work for you:

* `Character` got a few static checks that let you identify emojis, first and foremost [`isEmoji`](https://download.java.net/java/early_access/jdk21/docs/api/java.base/java/lang/Character.html#isEmoji(int)).

```java
var codePoint = Character.codePointAt("😃", 0);
var isEmoji = Character.isEmoji(codePoint);
// prints "😃 is an emoji: true"
System.out.println("😃 is an emoji: " + isEmoji);
```

* `Math` got static [`clamp` methods](https://download.java.net/java/early_access/jdk21/docs/api/java.base/java/lang/StrictMath.html#clamp(long,long,long)) that take a `value`, a `min`, and a `max` and return a value that is forced into the `[min, max]` interval.
  It has four overloads for the four numerical primitives.

```java
double number = 83.32;
double clamped = Math.clamp(number, 0.0, 42.0);
// prints "42.0"
System.out.println(clamped);
```

* `StringBuilder` and `StringBuffer` got [`repeat` methods](https://download.java.net/java/early_access/jdk21/docs/api/java.base/java/lang/StringBuilder.html#repeat(java.lang.CharSequence,int)), which allow you to add a character sequence or a code point multiple times to the string that is being built.

```java
var builder = new StringBuilder();
builder.append("Hello");
builder.append(", ");
builder.repeat("World", 3);
builder.append("!");
// prints "Hello, WorldWorldWorld!"
System.out.println(builder);
```

* `String`'s `indexOf` methods got [overloads](https://download.java.net/java/early_access/jdk21/docs/api/java.base/java/lang/String.html#indexOf(java.lang.String,int,int)) that take a `maxIndex` ...

```java
var hello = "Hello, World";
var earlyCommaIndex = hello.indexOf(",", 0, 3);
// prints "-1"
System.out.println(earlyCommaIndex);
```

* ... and its [new method `splitWithDelimiters`](https://download.java.net/java/early_access/jdk21/docs/api/java.base/java/lang/String.html#splitWithDelimiters(java.lang.String,int)) behaves like `split` but includes the delimiters in the returned array.
  The same `splitWithDelimiters` was added to `Pattern`, by the way.

```java
var hello = "Hello; World";
var semiColonSplit = hello.splitWithDelimiters(";", 0);
//prints [Hello, ;,  World]
System.out.println(Arrays.toString(semiColonSplit));
```

* Need to shuffle a `List` in place with a `RandomGenerator`?
  Then that's your reason to update to JDK 21!
  Once you did, you can pass the list and a `RandomGenerator` to [`Collections::shuffle`](https://download.java.net/java/early_access/jdk21/docs/api/java.base/java/util/Collections.html#shuffle(java.util.List,java.util.random.RandomGenerator)) and it shuffles the list.

```java
var words = new ArrayList<>(List.of("Hello", "new", "Collections", "shuffle", "method"));
var randomizer = RandomGenerator.getDefault();
// using this API makes way more sense, when you're not using the default generator
Collections.shuffle(words, randomizer);
// prints the words above but with 99.17% chance in a different order
System.out.println(words);
```

* An `HttpClient` can now be instructed to [`close`](https://download.java.net/java/early_access/jdk21/docs/api/java.net.http/java/net/http/HttpClient.html#close%28%29), to `shutdown`, or to `awaitTermination` but those are best-effort implementations that can have adverse interactions with open request or response body streams.

```java
var httpClient = HttpClient.newHttpClient();
// use the client
httpClient.close();

// or call `shutdown` and `awaitTermination`
// yourself for more control:
var httpClient = HttpClient.newHttpClient();
// use the client
httpClient.shutdown();
httpClient.awaitTermination(Duration.ofMinutes(1));

// it also implements `AutoCloseable`
try (var httpClient = HttpClient.newHttpClient()) {
	// use the client
}
```

* [`Locale.availableLocales()`](https://download.java.net/java/early_access/jdk21/docs/api/java.base/java/util/Locale.html#availableLocales%28%29) returns a stream of all available locales.

```java
var locales = Locale
	.availableLocales()
	.map(Locale::toString)
	.filter(locale -> !locale.isBlank())
	.sorted()
	.collect(Collectors.joining(", "));
// prints af, af_NA, af_ZA, af_ZA_#Latn, agq, ...
System.out.println(locales);
```

* And because you've all asked for case-folded IETF BCP 47 language tags, don't act like you didn't, `Locale` got the method [`caseFoldLanguageTag`](https://download.java.net/java/early_access/jdk21/docs/api/java.base/java/util/Locale.html#caseFoldLanguageTag(java.lang.String)).

```java
var lang = Locale.caseFoldLanguageTag("fi-fi");
// prints "fi-FI" (note the RFC5646-correct case)
System.out.println(lang);
```

As usual, there are links to all of this in the description.

<admonition type="caveat">

Those links lead to the Javadoc preview builds, but once JDK 21 is released, they will break.
In that case, you can find everything in the final destination, which should be [here](https://docs.oracle.com/en/java/javase/21/docs/api/index.html).
You can also [get in touch](contact) and I will fix the links.

</admonition>



## 32-bit Windows port

Windows 10 is the last 32-bit Windows and it reaches end-of-life in October 2025 and the Java port for 32-bit Windows isn't heavily maintained anymore.
For example, its implementation of virtual threads isn't virtual at all - they fall back to platform threads.
So I guess it was to be expected, that the port gets [deprecated for removal][jep-449], which JDK 21 does.

[jep-449]: https://openjdk.org/jeps/449


## Outro

And that's it for today on the Inside Java Newscast.
Thank you for watching, I hope you liked it, if so, please let YouTube know and share this video with your friends and colleagues.
I'll see you again in two weeks, but with some bad news, I'm afraid...
So long...

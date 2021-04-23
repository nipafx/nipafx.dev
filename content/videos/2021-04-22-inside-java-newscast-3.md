---
title: "Quicker Java and JDK 16 compatibility - Inside Java Newscast #3"
tags: [java-16, vector, java-17]
date: 2021-04-22
slug: inside-java-newscast-3
videoSlug: inside-java-newscast-3
description: "A walk through language features, APIs, and JDK capabilities that make Java quicker to use with less ceremony and more immediate results. Also, a rundown of some of the projects with all tests green on JDK 16."
featuredImage: inside-java-newscast-3
---

## Intro

Welcome everyone,

to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today I got two topics for you:

1. how Java becomes quicker to use
2. JDK 16 compatibility of various projects

Ready?
Then let's dive right in!

## Java Becomes Quicker

One of my favorite ways to learn about Java are the _Ask the Architect_"_ sessions that happen at larger conferences.
In these panel sessions, Mark Reinhold, Chief Architect, Brian Goetz, Chief Language Architect, or any of about a dozen other smart people working on the JDK at Oracle sit down to answer audience questions about everything Java.
(By the way, I started to collect them in a playlist that I will [link in the description][ata].)

In the most recent Ask the Architects session at Oracle Developer Live, Ron Pressler, probably best known for being the lead of [Project Loom], said something interesting - [take a listen][ron].

> I said before "JAva is a serious platform for serious software", but it also needs to be easier to use for less serious software.

And he's right, Java should be and in fact _is_ becoming easier to use!
Or, let's say, quicker to use with less ceremony and more immediate results, for example for small scripts or education, maybe even just with a pimped text editor instead of a full-blown IDE.
But with the many changes happening in recent years that may not be obvious, so I thought today I'll lay that out a bit.

[ata]: https://www.youtube.com/playlist?list=PL_-IO8LOLuNrVRv3eEVGk8LhH8PiEirnp
[ron]: https://www.youtube.com/watch?v=CVE4bWvuD3o&t=920s

### Quicker Language

On the language front, three changes come to mind that make Java quicker to use.
An obvious one is [local-variable type inference with `var`](java-10-var-type-inference) that came in Java 10.
Not having to duplicate type information left and right, literally, makes for a less cumbersome development experience.
And while in larger projects the focus for using `var` lies on making code more readable by reducing redundancy, when typing out a quick experiment, it does save key strokes as well.

```java
// with explicit types
Path directory = Path.of(args[0]).normalize();
List<Path> entries = Files
	.list(directory)
	.sorted()
	.toList();
String entryList = entries.stream()
	.map(Path::toString)
	.collect(joining("\n - ", " - ", ""));
long dirCount = entries.stream()
	.filter(Files::isDirectory)
	.count();
long fileCount = entries.stream()
	.filter(Files::isRegularFile)
	.count();
String message =
	"Content of \"%s\":\n%s\n%d directories\n%d files"
	.formatted(directory, entryList, dirCount, fileCount);
System.out.println(message);
```

```java
// with var
var directory = Path.of(args[0]).normalize();
var entries = Files
	.list(directory)
	.sorted()
	.toList();
var entryList = entries.stream()
	.map(Path::toString)
	.collect(joining("\n - ", " - ", ""));
var dirCount = entries.stream()
	.filter(Files::isDirectory)
	.count();
var fileCount = entries.stream()
	.filter(Files::isRegularFile)
	.count();
var message =
	"%s content:\n%s\n%d directories\n%d files"
	.formatted(directory, entryList, dirCount, fileCount);
System.out.println(message);
```

If a script needs to create text snippets, for example to write to files or send a request to a server, [text blocks](https://docs.oracle.com/en/java/javase/15/text-blocks/index.html), which were finalized in Java 15, come in real handy.
Being able to just type out a few lines of text or XML or JSON without worrying about manual line breaks is really nice.
As a bonus, since the quotation mark is no longer a special character (because you need three of them to delimit a text block), you don't need to escape it.

```java
String jsonPhrase = "{\n"
	+ "\tgreeting: \"Hello\",\n"
	+ "\taudience: \"World\",\n"
	+ "\tpunctuation: \"!\"\n"
	+ "}\n";
```
```java
String jsonPhrase = """
	{
		greeting: "Hello",
		audience: "World",
		punctuation: "!"
	}
	""";
```

But the biggest one is probably [records](https://www.youtube.com/watch?v=tLHUqXeiC4w), finalized in Java 16.
The smaller the project, the larger the surface area (relatively speaking) and so the more code has to deal with plain data from the outside world.
And even within a project, regardless of its size, there's always a need to capture and transport some intermittent resultw.
Records are amazing for this - declaring a simple type with a few components only takes a single line.

```java
class Address {

	private final String street;
	private final String zipCode;
	private final String city;

	public Address(String street, String zipCode, String city) {
		this.street = street;
		this.zipCode = zipCode;
		this.city = city;
	}

	public String street() {
		return street;
	}

	public String zipCode() {
		return zipCode;
	}

	public String city() {
		return city;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == this)
			return true;
		if (obj == null || obj.getClass() != this.getClass())
			return false;
		var that = (Address) obj;
		return Objects.equals(this.street, that.street)
			&& Objects.equals(this.zipCode, that.zipCode)
			&& Objects.equals(this.city, that.city);
	}

	@Override
	public int hashCode() {
		return Objects.hash(street, zipCode, city);
	}

	@Override
	public String toString() {
		return "Address[" +
			"street=" + street + ", " +
			"zipCode=" + zipCode + ", " +
			"city=" + city + ']';
	}

}
```

```java
record Address(String street, String zipCode, String city) { }
```

Not only does this make the code shorter and less error-prone, it also invites you to create types where you may have shied away from it in the past because of the ceremony.
I mean, we've all occasionally abused `Map.Entry` as a pair of values?
That's not just me right?

### Quicker APIs

Two APIs come to mind that made Java quicker.
The obvious one are (is?) [collection factories](https://docs.oracle.com/en/java/javase/16/core/creating-immutable-lists-sets-and-maps.html#GUID-DD066F67-9C9B-444E-A3CB-820503735951).
`List.of`, `Set.of`, `Map.of` - they make all code nicer to read and write, but particularly experiments and examples where you so often just need _a list of something_ to show something else.

```java
List<String> missing = List
	.of("John Doe", "Jenny Doe");

Set<String> alsoMissing = Set
	.of("Keys", "Phone", "AirTag");

Map<Integer, String> numbers = Map
	.of(1, "one", 2, "two");
```

Then there's the [HTTP client](java-http-2-api-tutorial) that shipped with JDK 11.
In smaller projects you probably want to avoid dependencies and having a competent HTTP client with a smart API can go a long way towards that.

```java
HttpClient client = HttpClient.newBuilder()
	.connectTimeout(Duration.ofSeconds(3))
	.followRedirects(ALWAYS)
	.build();
HttpRequest request = HttpRequest.newBuilder()
	.GET()
	.uri(URI.create("https://en.wikipedia.org/wiki/List_of_compositions_by_Franz_Schubert"))
	.build();

HttpResponse<String> response = client
	// there's also sendAsync and you can get a reactive stream publisher for the response body
	.send(request, HttpResponse.BodyHandlers.ofString());

if (response.statusCode() == 200) {
	String legend = response
		.body()
		.lines()
		.dropWhile(line -> !line.contains("id=\"Legend\""))
		.dropWhile(line -> !line.startsWith("<table "))
		.takeWhile(line -> !line.endsWith("</table>"))
		.collect(joining("\n"));
	System.out.println(legend);
} else {
	System.out.println("Response status code: " + response.statusCode());
}
```

Then there's the many improvements to existing APIs, from interaction with operating system processes to handling white space in strings and comparing arrays, a lot of small and not-so-small additions were made that make existing APIs safer and better, once again reducing the need to take on dependencies.

### Quicker JVM

The JVM plays its role as well and two of the most important additions fall into this category:
jshell, shipped with JDK 9, and single-source file execution, available since Java 11.
Both allow you to just get started.
Want to experiment with a new language feature, explore an API, or just show something to a colleague?
Open [jshell](https://docs.oracle.com/en/java/javase/16/jshell/introduction-jshell.html#GUID-630F27C8-1195-4989-9F6B-2C51D46F52C8) and off you go!
Or grab a text editor, type some Java into a file and throw it at the JVM without compiling it first.

The latter is what makes [scripts in Java](scripting-java-shebang) - dare I say _Java scripts_? - possible.
The common adage says to use the right tool for the job, but that glosses over the fact that your familiarity with the tool plays a role as well.
So if you don't feel comfortable with bash or bat files, Python or Ruby, why not give Java a shot for your next script?
On Unix systems, you can even use a shebang.

Now, you might be worried about the script's launch time.
Then give Graal's native images a shot.
While the [current release 21.1](https://www.graalvm.org/release-notes/21_1/) only supports Java 11, there are experimental builds that work with 16, and the team aims for its October release to officially support Java 17.
Having your Java scripts launch in a few milliseconds is pretty cool.

Another nice addition to make Java quicker to use for experiments is the proposed HTTP server.
[JEP 408] wants to include a simple HTTP server that you can launch with a command like `java -m jdk.httpserver`, plus a few optional flags like IP, port, and directory.
It will then host the directory's files on the specified address.
This won't be a server meant to be used in production - just for serving up some files locally to try a few things out.

[JEP 408]: https://openjdk.java.net/jeps/408

### Quicker Ecosystem

There's three third-party tools that I want to mention here as well.

First, [SDKMAN], a Unix tool to install and manage JDKs as well as JVM-based tools.
It makes it really easy to download and set up the latest and greatest JDK, so you can start using it immediately.

Then there's [jbang], which is basically a development kit for Java scripts.
It makes it easy to merge multiple source files into a script, include dependencies, add scripts to user paths, and even to create a native image with Graal.

Last but not least, there's [Bach], a lightweight Java build tool for modular Java projects.
It has the JDK tools at its heart - `javac`, `jlink`, and so forth - and if your project lines up with their expectations, you need zero configuration.

[SDKMAN]: https://sdkman.io/
[jbang]: https://www.jbang.dev/
[Bach]: https://github.com/sormuras/bach

### Coincidence?

A closing note on this topic:
This evolution towards a simpler, quicker, more productive Java isn't random.
On the contrary, it's one of the goals of the Java Platform Group here at Oracle and the developers are mulling over how to do more in this spirit.
If you're as curious as I am what that could be, take a moment to subscribe to this channel, so you won't miss future updates.


## Java 16 Is Gaining Ground

The other thing I want to talk about today is Java 16 compatibility.
Most Java libraries, frameworks, and tools work out of the box on JDK 16 and those that don't are catching up.

### Gradle

Gradle for example.
The recently released version 7 [works like a charm][G] on JDK 16.
Now, you might be wondering why Gradle needs to release a new version for that?
The answer is, as usual, "it's complicated", but at its core lie Gradle's support for incremental compilation and Groovy 2 - both didn't jive well with JDK 16's stronger encapsulation.
The Gradle team found an alternative approach for the former and updated the latter to version 3, so you're good to go.

[G]: https://github.com/gradle/gradle/issues/13481

### GlassFish

Then there's the Jakarta EE platform GlassFish.
Its team worked on making GlassFish compatible with newer JDK versions and while the official certification will be done against JDK 11, they didn't stop there.
They also build against JDK 16 and since last week, [it's all green][GF].

[GF]: https://arjan-tijms.omnifaces.org/2021/04/glassfish-now-runs-on-jdk-16.html

### Misc

That's not all of course.
The recent [SceneBuilder 16][SB] is packaged with JDK 16.
Eclipse Collections, Hibernate, JUnit, JaCoCo, they all and many more work fine as well.
As for every JDK version, there's Twitter hash tag that you can check out - this one is [#AllTestsGreenOnJDK16][tw16].

_That guy!
Talks about Twitter hastags but forgets [the OpenJDK Quality Outreach Group](https://wiki.openjdk.java.net/display/quality/Quality+Outreach).
Unbelievable!_

_The group promotes testing of many open source projects with various OpenJDK builds.
That acknowledges those community members who are actively testing, providing feedback, and who list any issues they have found during their testing.
This is a great way to improve the quality of the various releases and has a beneficial side effect:
You can easily see on which JDK versions the participating projects work._

[SB]: https://gluonhq.com/scene-builder-16-release/
[tw16]: https://twitter.com/hashtag/AllTestsGreenOnJDK16?src=hashtag_click&f=live


## Outro

And that's it for today on the Inside Java Newscast.
If you have any questions about what I covered in this episode, ask ahead in the comments below and if you enjoy this kind of content help us spread the word with a like or by sharing this video with your friends and colleagues.
I'll see you again in two weeks.
So long...

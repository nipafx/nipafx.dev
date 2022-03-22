---
title: "Compiled And Tested Code In Javadoc - Inside Java Newscast #20"
tags: [java-18, documentation]
date: 2022-02-10
slug: inside-java-newscast-20
videoSlug: inside-java-newscast-20
description: "Short code snippets in Javadoc are a great way to document an API, but they're brittle. JDK 18 / JEP 413 solves that problem by allowing us to reference snippets from external files that are compiled and tested."
featuredImage: inside-java-newscast-20
---


## Unpacking

Wow, one hundred thousand subscribers.
That's you folks!
Thank you very much, thank you for watching, for commenting, for sharing, and, of course, for subscribing!

And not just from me.
All of us working on and with Java at Oracle are very thankful for your continued interest and dedication to Java and we're working hard to keep earning it.

Now, where to put this thing...


## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle and... you gotta be strong today.
Remember a while ago when I prefaced [the episode on deprecating finalization](inside-java-newscast-15) with ...

> Is it to give you a reason to stick with me through a topic that could otherwise be considered somewhat boring?

Well, six of you didn't think it was boring and I'm banking this entire episode on that demographic 'cause we're discussing... Javadoc.
Because JDK 18 ships a feature that will be incredibly helpful for keeping documentation up to date:
The Javadoc tool now allows you to make sure that code snippets in your docs compile and behave as expected.
And you don't even have to build for Java 18!

Are you ready for that?
Then let's dive right in!


## Code in Javadoc

First of all, who is this for?
Just JDK devs and library maintainers?
I'd disagree.
While most of us aren't writing code for the whole world full-time, most of us _do_ write code for lots of colleagues at least some of the time.
I think every class deserves at least a short paragraph of explanation of its central abstraction.
Then, the more users it gathers and the less trivial it is, the more important becomes a better explanation and what better way to teach a more involved API than with a piece of code right there in the Javadoc?

So that's what this is about:
Embedding non-trivial code snippets in your docs while being sure that they can't get outdated without you noticing.
Let's see how to do that!

### Embedding External Files

Say you're writing an API that you think can benefit from a good example in the the Javadoc.
Naturally, you're hesitant to just put the code in the `<pre>` tag because it's a hassle and chances are, it will be outdated before you've even committed your changes.
So here's what you do instead:

1. you create a demo class in a tested source tree
2. in that demo class, you write a test for your functionality
	```java
	import org.junit.jupiter.api.Test;

	class SnippetDocsDemo {

		@Test
		void constructorDemo() {
			// @start region="constructor"
			// How to call the constructor:
			SnippetDocs docs = new SnippetDocs();
			// @end

			// assert correct behavior...
		}

	}
	```
3. you reference that test in your Javadoc with the new `@snippet` tag
	```java
	/**
	* This class has a constructor
	* and here's how you call it:
	*
	* {@snippet
	*     class="SnippetDocsDemo"
	*     region="constructor"
	* }
	*/
	public class SnippetDocs { ... }
	```

Let's go into a bit of detail on each step, starting at the end.

The `@snippet` tag accepts a few attributes that are expressed in simple `key=value` pairs.
The most important thing to configure is where to find your demo class, which you can do with `class=$NAME_OF_THE_CLASS`.
Now, in order for the `javadoc` tool to know where to look for these demo classes, you have to use the `--snippet-path` option with the path to the source tree you put the demo classes into.

```bash
javadoc # options...
	--snippet-path ./src/demo/java
```

With these two ingredients, the `class` attribute in the `@snippet` tag and the path as `javadoc` command line option, you're getting your first results:
The complete demo class is embedded in the Javadoc.
Ehm... that's a good first step, but clearly not ideal as it contains a lot of boilerplate.

So lets use the second essential `@snippet` attribute: `region`.
Simply add `region="$REGION_NAME"` to the tag, then head over to your demo file and add two inline comments:

* on the line before the first you want to show in the docs, add `@start region="$REGION_NAME"`
* after the last line you want to show, simple write `@end`

There you go, now just the juicy part shows up!

<contentimage slug="javadoc-simple-snippet"></contentimage>

That covers the third step, now lets take a look at the second.
Technically, you don't need to write tests of course - just regular code suffices, but I think it's important to assert that the code actually does what the documentation claims.
At this point, you might be wondering why not just embed test code as snippets, then?
Fair enough, that would work as well, but remember that _testing code_ and _demonstrating code_ are not the same goal and they might interfere with one another.
Case in point, where do you copy/paste your code from - documentation and StackOverflow or the projects' test suites.
We do all copy/paste our code, right?
It's not just me.
Is it?

Anyway, regarding step 1, creating the demo class in a tested source tree, I won't go into how to set that up here because it depends on your build tool.
But I did write [a blog post](javadoc-snippets-maven) that I'll link in the description that explains how to set up a `src/demo/java` folder in Maven so it gets compiled and tested.

### Possibilities

The `@snippet` tag has a lot more to offer than what I described so far - you should check out [JDK Enhancement Proposal 413][jep-413] for all the details.
Here are just some highlights:

Your code can have highlights!
(Pun fully intended.)
You can highlight substrings and regular expression matches, in a single line or the entire region, as bold, italic, or highlighted, which is customizable via CSS.

You can replace text, for example to to cut something short with an ellipses.
You can link text like method calls or type names, again matching by substrings or regex, to their API docs.
You can include other files than just Java sources.
You can add HTML IDs, so URLs can link directly to a snippet.

If you prefer readers of your source files to be able to see the snippets inline, you can forego the entire external file shebang and just type out the code in the `@snippet` tag - without escaping HTML entities but with all the bells and whistles I just mentioned.
But that brings you back to fragile examples, so there's one more option:
Have the code inline _and_ reference an external file and if the two variants are not identical letter by letter, the `javadoc` tool throws an error your way.

Ok, that weren't just highlights, that's pretty much the whole list, but there are details to all of that, so definitely check out JEP 413.

[jep-413]: https://openjdk.java.net/jeps/413

### For Projects < 18

At the beginning, I also mentioned that you don't need to build for JDK 18 to use any of this.
Just to make sure we're all on the same page, you can generally build on a newer Java version than the source code and target platform require.
The critical component here is the compiler and the one shipped with JDK 18 can build from and for any version since 7.
Ideally, all you need to do to make this work is set the compiler's `--release` option to the desired version.

So, for example, you can build your Java 8 or 11 project with JDK 17 or 18 and get all the build pipeline benefits from newer tool versions, like recent deprecation warnings.
So if you're on Java 8, but have an eye on the Javadoc search bar, build your documentation with a JDK version 9 or newer and you'll get it.
Likewise, if you want to use these snippets, build your project on JDK 18 with the compiler's release flag set to the minimal Java version you're running on.

If you also want to run your build on older JDKs (so for example 11, 17, and 18), that's a bit more tricky because the javadoc tool from JDK 17 and prior knows neither the `@snippet` tag nor the `--snippet-path` command line option.
The blog post I mentioned also explains how to work around this problem with Maven, so check that out if this is your requirement.


## Outro

And that's it for today on the Inside Java Newscast.
Almost forgot to say happy new year for those of you who use the lunar calendar.
If you have any questions about what I covered in this episode, ask ahead in the comments below and if you enjoy this kind of content, help us spread the word with a like or by sharing this video with your friends and colleagues.
The next episode will be hosted by my colleague Billy Korando, so I'll see you again in four weeks.
So long...

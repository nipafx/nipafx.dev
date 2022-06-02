---
title: "Configuring Maven For Compiled And Tested Code In Javadoc"
tags: [java-18, documentation, tools]
date: 2022-02-10
slug: javadoc-snippets-maven
description: "For JDK 18's / JEP 413's embedded snippets to be compiled and tested by your Maven build, they need to be added to a source set, Surefire needs to pick them up, and Javadoc needs to know their location - here's how to do that."
featuredImage: javadoc-snippets-maven
---

Those of you who've watched (or read) [Inside Java Newscast #20][ijn#20] know what this is about, so you can skip ahead to [Compiling And Testing Snippets With Maven](#compiling-and-testing-snippets-with-maven).
Everybody else, here's a crash course on [JEP 413].

JDK 18 introduces a new Javadoc tag `@snippet`, which can reference source files and embedd parts of them in the generated API documentation as examples.
That not only makes it much easier to write such examples, it also allows us to have them compiled and even tested if the build is configured accordingly, so they never go out of date unnoticed.

Here's an example for a class that uses the `@snippet` tag:

```java
/**
 * This class has a constructor and here's how you call it:
 * {@snippet file="SnippetDocsDemo.java" region="constructor"}
 */
public class SnippetDocs {

}
```

And the snippet file it references:

```java
import org.junit.jupiter.api.Test;

class SnippetDocsDemo {

	@Test
	void constructorDemo() {
		// @start region="constructor"
		// How to call the parameterless constructor:
		SnippetDocs docs = new SnippetDocs();
		// @end

		// assert something meaningful
	}

}
```

This is the result of generating the Javadoc for `SnippetDocs`:

<contentimage slug="javadoc-simple-snippet"></contentimage>


[ijn#20]: inside-java-newscast-20
[JEP 413]: https://openjdk.java.net/jeps/413


## Compiling And Testing Snippets With Maven

To organize, compile, and test snippet/example/demo classes like `SnippetDocsDemo`, we need to:

* create a separate source tree for them - we're gonna use `src/demo/java`
* ensure they are compiled
* ensure they are executed as part of the test suite
* configure Javadoc to find them

We'll do all that with Maven (and JUnit 5, but that has little impact).

### Compiling Snippets

To compile the snippet files, we need to add them to a source set.
Since we don't want to mix them into the production code, that better be the test sources.

The [Codehaus Build Helper plugin][build-helper] can do that for us:

```xml
<plugin>
	<groupId>org.codehaus.mojo</groupId>
	<artifactId>build-helper-maven-plugin</artifactId>
	<version><!-- current version --></version>
	<executions>
		<execution>
			<id>add-demos</id>
			<phase>generate-test-sources</phase>
			<goals>
				<goal>add-test-source</goal>
			</goals>
			<configuration>
				<sources>
					<source>src/demo/java</source>
				</sources>
			</configuration>
		</execution>
	</executions>
</plugin>
```

Now `mvn compile` compiles the demos.

Another advantage of adding the folder to the test source tree is that this gives the classes access to all test dependencies, which makes it straightforward to assert correct behavior.

[build-helper]: https://www.mojohaus.org/build-helper-maven-plugin/usage.html

### Running Snippets as Tests

The first step to running demos is to add them to the test source set... which we already did with the Build Helper plugin.
Unless you want to name these files `*Test(s).java`, we have to configure Surefire to pick them up, though.
I like naming them `*Demo.java` (hence the source folder name), but whatever it is, a consistent naming pattern makes it easier to include them in Surefire's test runs.

We'll use the `xml§<includes>` tag for that but keep in mind that it overrides the default inclusions, so make sure to add all patterns you need for your existing test classes.
For example:

```xml
<plugin>
	<artifactId>maven-surefire-plugin</artifactId>
	<version><!-- current version --></version>
	<configuration>
		<includes>
			<include>**/*Demo.java</include>
			<include>**/*Test.java</include>
			<include>**/*Tests.java</include>
		</includes>
	</configuration>
</plugin>
```

Now `mvn test` executes the demos.

### Configure Javadoc With Snippet Path

All that's left to do is configure Javadoc to find the demo files.
In fact, without doing that, every `@snippet` tag that references a demo class would lead to an error because Javadoc wouldn't be able to locate the file (and it tells you very loudly).

The command line option for that is `none§--snippet-path` and it needs to point to the direcotry containing the referenced files:

```xml
<plugin>
	<artifactId>maven-javadoc-plugin</artifactId>
	<version><!-- current version --></version>
	<configuration>
		<additionalOptions>--snippet-path ${project.basedir}/src/demo/java</additionalOptions>
	</configuration>
</plugin>
```

If you have several directories, you can specify all of them using the usual file-path separator (`none§:` on Linux/MacOS, `none§;` on Linux).

### Snippet Path Folder Structure

Note that Javadoc interprets each specified directory as a flat folder and won't search subdirectories on its own, which makes organizing a lot of demo/snippet files a little messy.
If you want to avoid a flat folder, you can let Javadoc know in which specific subdirectory to look for a class, though.

For that you need to prepend the path to the class name as if it were a package name, when referencing it:

```java
/**
 * This class has a constructor and here's how you call it:
 * {@snippet class="dev.nipafx.SnippetDocsDemo" region="constructor"}
 */
public class SnippetDocs { ... }

// `SnippetDocsDemo` is now expected in `$SNIPPET_PATH/dev/nipafx`,
// so for the config above in `src/demo/java/dev/nipafx`
```

Untouched by that is that packages don't have to correspond to folders.
So demo files can have a `package` clause that puts them into the same package as the classes they're referenced by without having to be in a corresponding folder:

```java
package dev.nipafx;

class SnippetDocsDemo { ... }

// This file doesn't have to be in
// `$SNIPPET_PATH/dev/nipafx`.
// In fact it wouldn't be found there,
// if referenced as `SnippetDocsDemo`
```

Put together that means you can recreate your main source tree's package/folder structure in the demo source tree and then reference every demo file by what looks like its fully qualified name.

```java
// in `src/main/java/dev/nipafx`
package dev.nipafx;
/**
 * This class has a constructor and here's how you call it:
 * {@snippet class="dev.nipafx.SnippetDocsDemo" region="constructor"}
 */
public class SnippetDocs { ... }
```

```java
// in `src/demo/java/dev/nipafx`
package dev.nipafx;
class SnippetDocsDemo { ... }
```

No longer messy, but a bit inconvenient.
Lets hope IDEs catch up on this feature soon, so they provide some refactoring help.


## Ignoring Snippets on JDK < 18

As mentioned in [the Newscast][ijn#20], building your project on JDK 18 while targeting an older version (all the way back to 7) is pretty easy in theory:
Just set `xml§<maven.compiler.release>` to the version you're targeting and you're good to go.
In practice, this may be a bit tougher because a lot of moving part have to play ball, but we'll assume it worked for you.
But what if you also want to run your build on older versions?

The problem is, if you run your build on JDK 17, Javadoc will barf because it understands neither the `@snippet` tag nor the `--snippet-path` option.
Fortunately, you can work around that by using [Maven profiles] that self-activate on specific JDK versions and then configure Javadoc accordingly:

```xml
<profiles>
	<profile>
		<id>java-17-</id>
		<activation>
			<jdk>(,17]</jdk>
		</activation>
		<build>
			<plugins>
				<plugin>
					<artifactId>maven-javadoc-plugin</artifactId>
					<configuration>
						<!-- on JDK 17-, remove the `@snippet` tag -->
						<tags>
							<tag>
								<name>snippet</name>
								<placement>x</placement>
							</tag>
						</tags>
					</configuration>
				</plugin>
			</plugins>
		</build>
	</profile>
	<profile>
		<id>java-18+</id>
		<activation>
			<jdk>[18,)</jdk>
		</activation>
		<build>
			<plugins>
				<plugin>
					<artifactId>maven-javadoc-plugin</artifactId>
					<configuration>
						<subpackages>org.codefx.demo.java18.jvm.javadoc</subpackages>
						<!-- only configure snippet-path on JDK 18+ -->
						<additionalOptions>--snippet-path ${project.basedir}/src/demo/java</additionalOptions>
					</configuration>
				</plugin>
			</plugins>
		</build>
	</profile>
</profiles>
```

[Maven profiles]: https://maven.apache.org/guides/introduction/introduction-to-profiles.html


## Reflection

To reference compiled and tested demos/snippets in your Maven-based project, you can take the following steps:

* create a folder `src/demo/java`
* use the Codehaus Build Helper plugin to add it to your test sorce set
* configure Surefire to execute classes whose names end in `Demo`
* configure the Javadoc plugin with a snippet path to `src/demo/java`

If need be, here's how to make the build work on older JDKs as well:

* in a Maven profile that self-activates on JDK 17-, configure the Javadoc plugin to ignore the `@snippet` tag
* move the snippet path configuration into a Maven profile that self-activates on JDK 18+

That's it, easy peasy. 😉

---
title: "String Templates, JavaFX 19, Deserialization, and more at JavaOne - Inside Java Newscast #32"
tags: [javafx, java-19, serialization]
date: 2022-08-23
slug: inside-java-newscast-32
videoSlug: inside-java-newscast-32
description: "String templates make it easy and safe to embed variables and expressions in strings; JavaFX 19 comes with many improvements, chief among them derived observables; and the deserialization filter can keep apps safe from certain attacks. More on all of this at JavaOne!"
featuredImage: inside-java-newscast-32
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today I have another JavaOne-inspired mix of topics for you, namely string templates, the deserialization filter, and JavaFX 19.

Like last episode, where I talked about [sequenced collections and pure functions][ijn#31], all links are in the description, even some that don't exist yet.
Other than that, be sure to check out [oracle.com/javaone][j1] and I'll hopefully see you in Las Vegas, October 17th to 20th.

Ready?

Nope, not yet.
Nicolai in the editing room here and ..
No I'm not gonna turn the camera on ...
Because I'm not wearing pants ...
I'm working _from home_ - who wears pants for that?
Anyway, if you get a ticket for JavaOne, use code INSIDEJAVA (all caps, no spaces) for a hefty 400 $ discount.
Now we're ready.

Then let's dive right in!

[ijn#31]: https://www.youtube.com/watch?v=xBBuShS0ERs
[j1]: https://www.oracle.com/javaone/


## String Templates

Let's start with something very cool that Java will hopefully get next year and that we briefly talked about in [the recent OpenJDK Q&A][ijn#30]: string templates.
When you have variables and want to put them into a string, Java offers various ways to do that, for example concatenation with a `+` or calling `String::format` or `Message::format`.

```java
String property = "last_name";
String name = "Doe";

// needed:
//     SELECT * FROM Person p
//     WHERE p.last_name='Doe'

// concatenation
String query = "SELECT * FROM Person p WHERE p."
		+ property + " = '" + value + "'";

// formatting
String query = "SELECT * FROM Person p WHERE p.%s = '%s'"
		.formatted(property, value);
```

They're all a bit cumbersome, though, but that's not even their main drawback.
In most cases, we're not creating text for people to read but structured text for other systems, like HTML, JSON, SQL, etc. - and blindly concatenating strings and variables can not only easily create invalid strings, in cases like SQL it can even lead to vulnerabilities.
String templates aim to rectify both of these problems.

They make inserting variables and expressions into strings much easier by introducing a syntax to do just that.
When creating a one-line string or a text block, simply use `\{` as opening and just `}` as closing delimiter for the expression you want to embed.
Using the otherwise illegal sequence `\{` ensures that no existing string is suddenly interpreted as an interpolation and serves as an easy differentiator between strings and string templates.

```java
//                                 VARIABLES    ↓↓↓    AND    ↓↓↓
var query = "SELECT * FROM Person p WHERE p.\{property} = '\{value}'";
```

Because here's the thing:
Such a stringy-looking construct won't actually be an instance of `String` but of `TemplatedString`.

```java
// ↓↓↓ NOT A STRING!
TemplatedString query = "SELECT *  [...]  p.\{property} = '\{value}'";
```

To turn a templated string into a regular string, you need a policy and that policy will be domain-specific:
Dealing with JSON?
Use a JSON policy.
Dealing with SQL?
Use an SQL policy.
And so on.

```java
// ↓↓↓ STRING  ↓↓↓ POLICY
String query = SQL."SELECT * FROM  [...]  p.\{property} = '\{value}'";
```

The policy will be able to validate the string and make sure it's formed as expected.
And even better, it doesn't have to return a string.
When you're already parsing JSON or SQL to validate it - why not turn it into a JSON node or SQL statement?
Right, no reason not to!
So policies allow that as well!

```java
// alternative policy that creates java.sql.Statement
Statement query = SQL."SELECT * FROM [...] p.\{property} = '\{value}'";
```

I'm pretty exited about that feature!
And at JavaOne, Gavin Bierman and Jim Laskey from the Java Platform Group will tell us all about it in their talk [String Template Pondering][1409].

[ijn#30]: https://www.youtube.com/watch?v=ZaGnGs9TeNc
[1409]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1409


## Deserialization Filter

There are quite a few sessions on security, but the one I want to recommend the most is the [Java Security Q&A][2632] with JPG security experts Sean Mullan and Brad Wetmore.
If you have any questions regarding security in Java, be sure to ask them there!

But there are a lot of other promising talks as well.
For example Brian Vermeers [Deserialization Exploits in Java: Why Should I Care?][1403] - I'll leave it to him to explain why you should, but assuming you do, I can show you a little bit what you can do against them - Brian will fill in the details.

[Java 9 introduced][jep-290] a deserialization filter, a mechanism that you can use to limit what bytestreams will be deserialized.
You can create allow-lists and deny-lists for class names and class name patterns, you can limit the object graph's depth and the number of internal references as well as array size and input stream length.
If an input stream violates these requirements, it will be rejected and often quickly.

* `maxdepth=value`: maximum depth of graph
* `maxrefs=value`: maximum number of internal references
* `maxarray=value`: maximum array size allowed
* `maxbytes=value`: maximum number of bytes in the input stream

You can statically configure the filter for all deserializations with the system property `jdk.serialFilter` or the security property of the same name in the JDK file `conf/security/java.security`.
Alternatively, you can dynamically create `ObjectInputFilter` instances at run time and set them on the respective `ObjectInputStream` instances.
[Since Java 17][jep-415], you can also configure a JVM-wide filter _factory_ to reach those places where you don't control the `ObjectInputStream` and that are tough to configure with the global option - with it, you can create filters specifically for the context in which they will be applied.
If your app uses serialization, I recommend to closely read [the secure coding guidelines][java-sec] and also attend [Brian's talk][1403] - there are links to both below.

```java
// -Djdk.serialFilter=maxdepth=5

ObjectInputFilter filter = ObjectInputFilter.Config.createFilter("maxdepth=5");
ObjectInputStream inputStream = new ObjectInputStream(new ByteArrayInputStream(serializedList));
inputStream.setObjectInputFilter(filter);
```

Other practical talks on the topic of security are [Security Vulnerabilities for Java Developers][3707] by Okkta's Brian Demers and [Secure Coding Guidelines for Java SE][1433] by JPG's Chris Ries.
To get a glimpse behind the scenes, check out Weijun Wang's and Sean Mullan's session [Evolving the Security of the Java Platform][1434].

[jep-290]: https://openjdk.org/jeps/290
[jep-415]: https://openjdk.org/jeps/415
[java-sec]: https://www.oracle.com/java/technologies/javase/seccodeguide.html

[1403]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1403
[1433]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1433
[1434]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1434
[2632]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=2632
[3707]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=3707


## Performance

There will be tons of talks on Java performance, from ZGC ([twice][1412] [actually][2621]) to [G1][1414], from [the Vector API][1427] to [a general performance benchmarking introduction][2591], from [JDK Flight Recorder][1432] to [Micrometer][3692].
And almost all of them by the folks working on and improving these very technologies day in day out!
So if you have questions about these technologies, this is the place to ask them.

[1412]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1412
[2621]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=2621
[1414]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1414
[1427]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1427
[2591]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=2591
[1432]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1432
[3692]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=3692


## Derived Bindings in JavaFX 19

As an ardent Linux user, I'm living in the perpetual year of Linux on the desktop and so I'm glad that Java's not standing still there either.
JPG's desktop veteran Kevin Rushforth will explain in [JavaFX 19 and Beyond][2615] how the desktop technology improved in recent releases.
There's a number of new features and improvements:

* JavaFX Media now has support for H.265 - that's a codec important for 4k videos
* JavaFX Webview now supports transparent backgrounds
* and there are now convenience methods that make JavaFX more approachable

But the one I want to focus on here is the new support for creating derived bindings directly from `ObservableValue`.
Say you're creating an editor for an `Employee` instance and it has a salary slider.
At that point you probably have an observable for the current employee you're editing and another for the salary slider but you want to bind them in a way that when the employee changes, the salary slider is bound to the new employee's salary.
This is where derived bindings come in.
`ObservableValue` gets methods `map` and `flatMap` that allow you to create new observables for specific properties of a value.

```java
// goal: setting a new `Employee` updates `slider` to their salary
ObservableValue<Employee> employee = new SimpleObjectProperty<>();
ObservableValue<Number> salary = employee.map(Employee::salary);

var slider = new Slider(0, 10_000, 0);
slider.valueProperty().bind(salary);
```

<admonition type="note">

That may sound as if moving the slider would update the salary.
After all, why else use a slider?!
But that's not the case:
`ObservableValue::map` and `flatMap` return `ObservableValue`, but bidirectional binding requires a more specific subtype (`Property`), so that's not possible.
Too bad.

</admonition>


Beyond this talk, Kevin will give a more general one called [Building and Deploying Java Client Desktop Applications with JDK 17 and Beyond][1413] together with JPG's Phil Race and there'll be another one [on JavaFX][1397] by Paul and Gail Anderson.
To better understand how to ship such apps, check out Alexey Semenyuk's talk [jpackage: Packaging Tool for Java Applications][1420].
And if you're a MacOs enthusiast, don't miss [Project Lanai - New graphics pipeline for macOS][2619].

[2615]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=2615
[1413]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1413
[1397]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1397
[1420]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1420
[2619]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=2619


## Cloud

I'm the first to admit that I don't know much about cloud stuff, but if I wanted to change that - I don't think I wanna, though - JavaOne would be the place to do that.
Graeme Rocher from the Graal team will give a talk [Zero to Hero][2611], where he live-codes microservices from IDE to cloud with GraalVM and Micronaut.
That would probably be a good introduction.
As would [Modern Java App Development in the Cloud][3698] by Rustam Mehmandarov and Mads Opheim from Computas, where they talk about MicroProfile, Quarkus, and serverless.
For the more advanced, there's [Delightful integration tests with Testcontainers][3700] by AtomicJar's Oleg Šelajev and [Secrets of Performance Tuning Java on Kubernetes][3691] by Bruno Borges from Microsoft.

And since I love podium discussions, I also want to recommend the [Java in Containers][1428] birds-of-a-feather session with JPG's Larry Cable and Ioi Lam, where they will discuss challenges with tools like Docker, Podman, or Kubernetes as well as practices that can help you solve them.

[2611]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=2611
[3698]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=3698
[3700]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=3700
[3691]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=3691
[1428]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1428


## Outro

And that's it for today on the Inside Java Newscast.
Don't forget to check out [oracle.com/javaone][j1] and I hope I get to see you in Las Vegas in October!
Other than that, do all the YouTube things and I'll see you again in two weeks.
So long...

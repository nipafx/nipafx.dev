---
title: "Sequenced Collections, Purity, and more at JavaOne - Inside Java Newscast #31"
tags: [collections, lambda]
date: 2022-08-11
slug: inside-java-newscast-31
videoSlug: inside-java-newscast-31
description: "Sequenced collections introduce an abstraction for collections with a known encounter order like all lists and some sets and maps. It will be easy to add, get, or remove the first and last elements and to iterate or stream in reverse order. We're also discussing immutable collections and pure functions. More on all of this at JavaOne!"
featuredImage: inside-java-newscast-31
---

## Intro

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today we're gonna look at sequenced collections and the meaning of immutability and purity.
And in an unprecedented move, I can already share next episode's topics, too:
That will be string templates, the deserialization filter, and JavaFX 19.

Why so random?
All of these topics will be presented in a lot of depth at JavaOne and in this episode and the next I wanna give you a sneak peek of what's gonna go down in Las Vegas from October 17th to 20th.
It's a unique opportunity to meet the members of JPG, that's the Java Platform Group at Oracle, and chat with them personally - whether it's Brian Goetz, Stuart Marks, Ron Pressler, they and many, many others will be there.
To learn more, go to [oracle.com/javaone][j1] and keep in mind that there's a 200 $ discount if you register before August 14th.

Speaking of URLs, though, I will link to all the sessions that I mention in the description.
But!
They're not all online yet, so some of the URLs are just my guesswork.
I hope you forgive me that this peek is so sneaky, I even tricked Oracle.
No doubt, all info will be published soon, but until then, everything I say is subject to change.

With all of that out of the way, are you ready?
Then let's dive right in!

[j1]: https://www.oracle.com/javaone/


## Collections

Some people say, Java moves slowly.
I say, we got the collections framework in 1998 and 💥 25 years later, `List` gets methods `getFirst()` and `getLast()` - who's slow now?
Jokes aside, this was long overdue but better late than never.

### Sequenced

To go into a bit more detail:
What is going to be introduced, hopefully next year, will be the concept of _sequenced collections_.
This is basically an upgrade form _collections with encounter order_, which includes all lists as well as some sets, like `SortedSet` implementations, and some maps, like `LinkedHashMap`.
Importantly, this concept will be captured by three new interfaces: `SequencedCollection`, `SequencedSet`, and `SequencedMap`.
And these interfaces will describe methods like `get`/`add`/`remove` `first` and `last`.

```java
var j1 = List.of("java", "one");
var java = j1.getFirst();
var one = j1.getLast();
```

They will also make it much easier to iterate in reverse order by offering a method `reversed` that returns an instance of the same sequenced interface type that is a view on the current collection but in different direction.
That way, you can easily and cheaply use all iteration mechanisms, be it a for-each loop, a stream, a conversion to an array, etc.

```java
// method on `SequencedCollection`
public SequencedCollection<E> reversed();

// easy for loop
for (var e : collection.reversed())
	process(e);

// easy stream
collection
	.reversed().stream()
	.map(Element::getThing)
	.forEach(this::process);

// easy immutable copy in reverse order
var copy = List.copyOf(collection.reversed());
```

For more on this, check out Stuart Marks' talk [Sequenced Collections][1422] or go to [his Q&A on collections][2634]

### Immutable vs Unmodifiable

But we're not done with collections yet!
Maurice Naftalin will give two talks on the topic.
[Return to Planet Collections][3829] is based on the upcoming second edition of his classic book "Java Generics and Collections".
What I look forward to the most is the "design retrospective distilling 25 years' experience of the framework", for example on the, ehm, copious amount of `UnsupportedOperationException`s that the APIs allow.

But he also has a talk on immutable/unmodifiable collections.
So why two terms?
It appears that the common understanding for immutability means "immutable all the way down", meaning not only can a list or map not change, the elements it contains can't either.
Java objects can be immutable, but only if their class:

* cannot be extended
* has only final and private fields
* has exclusive access to mutable components
* and offers no mutators for them

"Immutable" generic collections can do almost all of that but won't generally have exclusive access to mutable components, say the `User` instances you add to them, and can't limit elements to only immutable ones.

```java
var user = new User("Alice");
var users = List.of(user);

// `users` contains user "Alice"

user.setName("Eve");

// now `users` contains user "Eve"
// but isn't it "immutable"? 🤔
```

Hence a new term is needed - unmodifiable:
You can't add, remove, replace, reorder, etc. elements of _unmodifiable_ collections, but the elements themselves could be mutated if they allow it.
For more on that, check out Maurice's talk [Is Change Inevitable?][3837].

[1422]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1422
[2634]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=2634
[3829]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=3829
[3837]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=3837


## Functional / Data-Oriented Programming

On the theme of immutability, here's one of Venkat Subramaniam's Java functional programming idioms.
In [his talk on this topic][1396] he'll explain what it means for a function to be pure and why that's important.

<!--
# Java Functional Programming Idioms

More idiomatic practices from Venkat:

* think declarative before functional
* apply the function pipeline pattern
* vertically align dots
* use method references where possible
* treat lambdas as glue code
* prefer better parameter names over types
* get used to cascading lambdas
* avoid shared mutability, keep lambdas pure

(JavaOne is two months out, so this is of course subject to change.)
-->

A _pure_ function is one that has no side effects, meaning it doesn't change any state, and is idempotent, meaning it always returns the same result for the same input.
To achieve that, the function can't change anything, that much is obvious, but it also can't depend on anything that may possibly change.

When writing a lambda, Java doesn't help you a whole lot with these two requirements.
It gives you a compile error when variables in a lambda body aren't effectively final, which means you cannot reassign those variables inside or outside the lambda, but it doesn't prevent you from taking an effectively final variable and mutate its state, like adding something to a modifiable list for example.
Code that does this cannot reap all the functional programming benefits like carefree lazy evaluation and parallel computation.

```java
// using an array to work around that
// pesky "effectively final" rule
int[] factor = { 2 };
var stream = Stream
	.of(1, 2, 3)
	.map(number -> number * factor[0]);
factor[0] = 0;

// "0 0 0" or "2 4 6"?
stream.forEach(System.out::println);
```

It also makes it tougher to quickly predict what the code does.
Check out this example - what does the code print?
Make a prediction, try it out in JShell, and let me know in the comments whether you got it right.
But the lesson is not, "learn how this code behaves", it's "don't write this code"!

For more functional programming idioms, attend Venkat's talk.
And to get more perspectives on functional and data-oriented programming in general, also check out [The Sincerest Form of Flattery][1426] by my colleague Jose Paumard and by Maurice Naftalin and [Data-Oriented Programming with Records, Sealed Classes, Text Blocks, and More][1410] by JPG's Brian Goetz and Gavin Bierman.
For a sneak peek on data-oriented programming, watch [Inside Java Newscast #29][ijn#29] - right after this one.

[1396]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1396
[1426]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1426
[1410]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1410
[ijn#29]: https://www.youtube.com/watch?v=5qYJYGvVLg8


## Project Loom - Virtual Threads & Structured Concurrency

Project Loom took the stage by storm this year.
With its two major components, virtual threads and structured concurrency, previewing in Java 19, everybody wants to learn more about it and JavaOne delivers.
From [a talk by Mr. Virtual Thread himself][1424], Ron Pressler, to [a performance review][1423] by Java Performance Engineer in JPG Sergey Kuksenko, from experience reports on [a Loom-based web server][2597] by Helidon's Tomas Langer and [a Loom-based implementation of the consensus protocol Raft][3825] by Andrii Rodionov to a [hands-on lab][3733] by Jose, there will be enough to quench your thirst for Loom knowledge and then some.
If, by any chance, some questions are left unanswered, there will also be opportunities to talk to all these experts one on one and ask them yourself.

But just between you and me.
If you can't make it to to JavaOne, check out Jose's recent JEP Cafe episodes, where he goes all in on virtual threads and structured concurrency - there's a ton of theoretical and practical knowledge in those.
Won't give you everything the sessions will be about and I can't give you Ron's telephone number for a remote one-on-one, either, but it will get you a long way.

<!--
[Project Loom: Modern Scalable Concurrency for the Java Platform][1424]
[Project Loom: Performance Review][1423]
[Java + Project Loom = Synchronous Performance][2597]
[Implementing Raft protocol with project Loom][3825]
[Project Loom Hands-on Lab][3733]
[Reactive Streams or Virtual Threads: Writing Asynchronous Java DB Access][2581]
-->

[3733]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=3733
[2630]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=2630
[3825]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=3825
[1423]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1423
[1424]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1424
[2597]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=2597
[2581]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=2581


## Misc

But there's so much more than I can possibly cover.
As I already mentioned, I'll tell you about string templates, the deserialization filter, and JavaFX 19 in the next episode.
Those talks aside, here are a bunch of sessions by subject matter experts that look really interesting.

* [Make Your Java Apps See and Learn][1391]
* [Generate Some Code for Great Good][1395]
* [Twelve Tips for Writing More Readable Java Code][1398]
* [Improving Your Build Without Touching Your Buildfile][1399]
* [The Wonderful World of Bio-Inspired Computing][3828]


Speaking of experts, an essential part of conferences is that you not only get to listen to their presentations but also have a chance to chat to them and ask your questions directly.
This is particularly noteworthy because at JavaOne you don't have to make due with Billy, Jose, or me, but can talk to members of the Java Platform Group who actually design and create this stuff themselves - because no matter how hard we try, we can never even get close to how much these folks know.
So if you have the opportunity to come to Las Vegas in October, you don't want to miss it!

[1391]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1391
[1395]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1395
[1398]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1398
[1399]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=1399
[3828]: https://reg.rf.oracle.com/flow/oracle/cloudworld/session-catalog/page/catalog?search=3828

## Outro

And that's it for today on the Inside Java Newscast.
Don't forget to check out [oracle.com/javaone][j1] and I hope I get to see you in Las Vegas in October.
Other than that, I'll see you again with in two weeks.
So long...

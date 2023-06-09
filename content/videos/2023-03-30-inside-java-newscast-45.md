---
title: "New (Sequenced) Collections In Java 21 - Inside Java Newscast #45"
tags: [collections, java-21]
date: 2023-03-30
slug: inside-java-newscast-45
videoSlug: inside-java-newscast-45
description: "All lists, some sets, and some maps have an encounter order, but the collections framework has no type to capture this property and define operations like getting or removing first and last elements or iterating in reverse order. Sequenced collections will fix that in Java 21."
featuredImage: inside-java-newscast-45
---

## Intro

Welcome everyone, to my new studio - to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today we're gonna see how Java 21 will make it super easy to get the last `List` element or the first `LinkedHashSet` entry, to loop and stream over a reversed list or set, and generally how to better exploit what the Java collection framework calls _encounter order_.
Yes, we'll talk about JEP 431: Sequenced Collections.

But before we get into that:
If you have any questions about this, I'll do a live Q&A with the JEP owner and Java collection guru Stuart Marks tomorrow, Friday 31st, at 1900 UTC on [twitch.tv/nipafx](https://twitch.tv/nipafx).
And if you missed that, head over to [inside.java/podcast](https://inside.java/podcast) and subscribe on your favorite platform - there will soon be an episode with the same Stuart on the same topic.

Ready?
Then let's dive right in!


## Sequenced Types and Methods

Java gets three new interfaces:

1. `SequencedCollection`, which extends `Collection` and is further extended by `List` and `Deque`.
   Or `Deck`?
   Let's go with `Deque`.
   It offers methods `addFirst`/`addLast`, `getFirst`/`getLast`, and `removeFirst`/`removeLast`, which do what you'd expect.
   It also has a method `reversed` that returns a `SequencedCollection` that is a view on the underlying collection but in reverse order.
2. `SequencedSet`, which extends `SequencedCollection` and `Set` and is further extended by `SortedSet` and implemented by `LinkedHashSet`.
   It offers no additional methods but defines a covariant override of `reversed` that returns a `SequencedSet`.
3. `SequencedMap`, which extends `Map` and is further extended by `SortedMap` and implemented by `LinkedHasMap`.
   It offers methods `putFirst`/`putLast`, `firstEntry`/`lastEntry`, and `pollFirstEntry`/`pollLastEntry`.
   It also has a method `reversed` that works analogue to the one on `SequenceCollection`.
   Furthermore, it offers sequenced views of its key set, values, and entry set.

And that's it for today on the Inside Java Newsc... wait, why are you all still here?
You usually leave right when the outro begins (and miss all the cool stuff therein, I want to add).
You want more on sequenced collections?
There _are_ lots of more interesting details in the JEP, so I'm all for it!
We can start by establishing the problems this actually solves, see a few examples, and discuss a few odds and ends.

Let me just... there we go.

## The Problem

The Java collection framework has the concept of _encounter order_, which means that there's a well-defined order to the elements in the collection and iteration will always visit them in that very order.
This is obviously true for everything that's sorted, but order, or _sequence_ as I'll start to call it for mysterious reasons, is weaker than that.
Even unsorted elements in a list, for example, are sequenced because each element has a well-defined position in that list.
So all lists are sequenced.

A classic example of a non-sequenced collection, one _without_ encounter order, is a set.
At least generally, because there _are_ `Set` implementations, that do have a sequence: not only the `SortedSet` implementations, but also the class `LinkedHashSet`.

And here we can already see one half of the issue with encounter order.
While well defined, that's only in prose - there's no type that guarantees this property across all these different collections.
The other half is that sequence-related operations are very inconsistent.

Need the first element of a list?
`list.get(0)` is there for you.
Already somewhat imprecise but wait till you try to get the last element.
Few things in Java have been as bad for my teeth as typing out `list.get(list.size() - 1)`.
Ugh!

Things are even worse for `LinkedHashSet`, though.
Getting the first element requires us to either ask the iterator for the next element or `findFirst()` on a stream and getting the last element isn't even possible without iteration.

```java
// getting first/last element on...

// ... `List`:
var first = list.get(0); 😐
var last = list.get(list.size()-1); // 😬

// ... `LinkedHashSet`:
var first = set.iterator().next();
first = set.stream().findFirst();
var last = 🤷
```

Side note:
I also sometimes want to get just any element from a `Set`, which forces me to go through the same `iterator()` or `stream()` methods.
Would be nice to have a `getAny()` or something like that on `Set`.
Maybe I'll ask Stuart about that.

Finally, iterating in reverse order is pretty annoying as well and streaming that way, my preferred way to process collections, is hardly supported at all.
So while collections have the _concept_ of encounter order, of a sequence, they don't have a type to capture that and so no place to uniformly define operations like getting the first and last elements or reversing the sequence.
Until JDK 21 that is.

```java
// iterating in reverse order over ...

// ... `List`:
for (var it = list.listIterator(list.size());
		it.hasPrevious();) {
	var e = it.previous();
    // use `e`
}

// ... `Deque`:
for (var it = deque.descendingIterator();
		it.hasNext();) {
    var e = it.next();
    // use `e`
}

// ... `NavigableSet`:
for (var e : navSet.descendingSet()) {
	// use `e`
}

// streaming in reverse order over ...
// ... `List`: 🤷
// ... `Deque`: 🤷
// ... `NavigableSet`:
navSet.descendingSet().stream()
```

## A Deeper Look At The Solution

After mysteriously calling encounter order "sequence", let me now reveal to you the surprising reason:
The new collection interfaces are called "sequenced" - as in "the elements have been arranged in a sequence".
A sequenced collection has first and last elements, and the elements between them have successors and predecessors.
It further supports common operations at either end and it supports processing the elements from first to last and from last to first.

I already listed the interfaces and their methods, so let's see how to use them in practice.
Which is super straight-forward.
First and last elements of all lists, sorted sets, `LinkedHashSet`s and whatever else implements `SequencedCollection` or `SequencedSet` are available with `getFirst` and `getLast`.

```java
// getting first and last elements from a list
// (sequenced by order of addition)
var letters = List.of("c", "b", "a");
"c".equals(letters.getFirst());
"a".equals(letters.getLast());

// same but from a sorted set
// (sequenced by natural ordering)
var letterSet = new TreeSet<>(letters);
"a".equals(letters.getFirst());
"c".equals(letters.getLast());
```

You can also add or remove at both ends of the collection, but those methods may throw an `UnsupportedOperationException`.
The obvious case where that happens is when the underlying collection is unmodifiable.
The more subtle case is trying to add a first or last element to a sorted collection when it doesn't belong in that place.
Clearly, being sorted overrides the desire to add at specific positions and so an exception is thrown here as well.

```java
var letters = new ArrayList<>(List.of("c", "b", "a"));
letters.addFirst("x");
// ~> ["x", "c", "b", "a" ]

var letterList = List.of("c", "b", "a");
letterList.addFirst("x");
// ~> UnsupportedOperationException
// (`letterList` is unmodifiable)

var letterSet = new TreeSet<>(letters);
letterSet.addFirst("x");
// ~> UnsupportedOperationException
// ("x" does not belong in first position)
```

I gotta say, the `SequencedMap` API strikes me as a bit odd.
It has adopted the `NavigableMap` nomenclature, so instead of `getFirstEntry` it's `firstEntry` and instead of `removeLastEntry` it's `pollLastEntry`.
Not a big fan, but having names more in line with `SequencedCollection` would mean `NavigableMap` gets four new methods that do the same as four other methods it already has.

Further warts are added by not being able to restrict the return type of `keySet()` from `Set` to `SequencedSet`.
Because the new interfaces are retrofitted into the existing hierarchy (by implementing all the new methods with default methods, btw - Java 8 for the win!) every implementation of a `SortedMap` is now also an implementation of `SequencedMap`.
That includes lots of sorted maps outside of the JDK and if `keySet()` would now demand to return a `SequencedSet`, they would neither compile nor run.
That's a no go.
So instead of changing the return type for `keySet()`, a new default method `sequencedKeySet()` is being added.
Not great, but what are you gonna do?

One deceptively simple method on the new interfaces is `reversed`.
It returns a potentially writable view, which means it's very cheap and it always reflects the same state as the underlying collection, so changing one will change the other.

```java
var letters = new ArrayList<>(List.of("a", "b", "c"));
var reversedLetters = letters.reversed();

letters.addLast("d");
reversedLetters.forEach(System.out::print);
// ~> dcba

reversedLetters.addFirst("e");
letters.forEach(System.out::print);
// ~> abcde
```

It also immediately unlocks all iteration methods!
Whether you want to use a for-each loop or the `forEach` method, an explicit iterator or a stream, they are all uniformly supported out of the box.
And a reversed array becomes as easy as `collection.reverse().toArray()`.
Very neat!

```java
for (E el : list.reversed())
	// ...

deque.reversed().forEach(/* ... */);

set.reversed().stream().//...

var reversedArray =
	list.reversed().toArray();
```

Overall, this is a great addition!
Not headline grabbing but exactly the thoughtful evolution that Java needs.

## Outro

And that's it for today on the Inside Java Newscast - this time for real.
Do all the YouTube things, share this video with your friends and enemies, and don't forget to stop by [twitch.tv/nipafx](https://twitch.tv/nipafx) on Friday 1900 UTC for a conversation with Stuart Marks or to look out for the [Inside Java Podcast](https://inside.java/podcast) episode with him.
I'll see you again in two weeks.
So long...

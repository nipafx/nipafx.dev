---
title: "Save 10-20% Memory With Compact Headers - Inside Java Newscast #48"
tags: [performance]
date: 2023-05-11
slug: inside-java-newscast-48
videoSlug: inside-java-newscast-48
description: "JDK Enhancement Proposal 450 proposes to merge a compressed class word into the mark word to reduce object header size on 64-but systems from 96-128 bits to 64 bits, thus saving 10-20% of heap space"
featuredImage: inside-java-newscast-48
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today we're gonna see how Java may soon return 10% to 20% of your memory back to you.
And in the process learn a lot about object headers and bit about garbage collection, concurrency, the type system, and hash codes, of all things.

Imagine your heap space:
A big chunk of memory, usually in the gigabytes, that your instances live in.
The strings and collections, the data-transfer objects and web services, the customers and orders, all of that.
On many workloads, the average object size is 256 to 512 bits, or 32 to 64 bytes, or 4 to 8 words, but not all of that is _your_ data.
Usually 2 of each of those words are the so-called "object header" - that's between 20% and 40% of your heap!

What's an object header?
Can't we make it smaller?
Imagine how much memory that would save us.

And that's exactly what Project Lilliput, JDK Enhancement Proposal 450, and this Inside Java Newscast are all about.
Ready?
Then let's dive right in!


## Object Headers

For any of this to make sense, we first need to establish what an object header is, how it's structured, and how the runtime and garbage collectors work with it.
If you already know all this, you can safely skip ahead to the _Compact Object Headers_ chapter.
For the rest, settle in for a Lego-infused look under the runtime's hood.

On a 64-bit HotSpot JVM, the archetypical object header is 128 bits long and consists of two words: the _mark word_ and the _class word_.
The mark word contains three pieces of information:

* 31 bits for the object's stable identity hash code once it has been computed
* 4 bits that the garbage collector uses to mark an object's age
* and 2 tag bits

The remaining 27 bits are unused but they can't be recovered because I've only told the simple half of the truth about mark words.
In the other half they take on another form.
For that, let's talk about locking and garbage collection.

### Locking

When you write a `synchronized` block, the runtime ensures that only one thread grabs the associated object's monitor while contending threads wait.

```java
private final Object lock = new Object();

public void execute() {
	// threads need to obtain the monitor
	// of `lock` to enter the block
	synchronized(lock) {
		// only one thread at a time will
		// ever be in this block
		executeNonConcurrently();
	}
}


private void executeNonConcurrently() {
	// ...
}
```

Did you ever wonder how that works?
I did, but never enough to look it up but thanks to the excellently written JEP 450, I don't need to any more.
When a thread obtains a monitor, it needs to mark its ownership and the light-weight mechanism for that is _stack locking_:

* the original mark word is moved to the thread's stack (this is called _displacement_),
* in the original location, the mark word's 62 non-tag bits are replaced with a pointer to that stack location
* and the 2 tag bits are used to mark what's going on

While stack locking is light-weight, it suffers from race conditions.
So when there's contention over the lock or when another thread needs to read the mark word, for example to get the identity hash code, the stack lock is inflated to the more heavy-weight _monitor lock_:

* an `ObjectMonitor` structure is created
* and the mark word is displaced there

So in both of these locking schemes, the mark word in the object header is now a tagged pointer that code that wants to access the object's identity hash code or GC age, needs to follow.
And this displacement of the mark word becomes an issue with more compact headers as we'll see when we get to them.

### Garbage Collection

But locking is not the only mechanism that replaces the mark word - garbage collectors do that, too.
A big part of a garbage collector's work is figuring out which objects in the heap are still referenced (and hence needed; they're called _alive_) and which can be safely overwritten.
We can ignore that part for another minute or so, but will get back to it when we come to the class word.

What we care about now is the part where the GC moves live objects around.
It does so in two ways:

1. During a young collection, it copies an object to its new memory location and then replaces the mark word in the old version with a tagged pointer to the new location, so other GC code that still accesses the old copy knows where to find the new one.
   But in case this evacuation fails, a non-intuitive mechanism is used to mark the object until the problem is solved:
   Its mark word is replaced with its _current_ address, thus making the object self-forwarded.
2. When memory is really tight, during a full collection, the GC compacts the heap by sliding all objects next to each other towards lower memory addresses.
   It computes the destination addresses for all live objects and in a sneaky optimization, most GCs keep track of the many new addresses by simply writing each to the original object's mark word.
   The GC then updates all references and finally copies all objects to their new locations.

At this point, you should be wondering what the heck is going on.
How can the mark word be replaced with a tagged pointer to itself or to a future location.
This loses the original mark word, right?

Yes, but it turns out that for most objects in that situation, the mark word doesn't actually contain interesting information.
Most objects are neither locked nor has their identity hash code been computed.
And age bits are only relevant during young collection:
Objects that fail evacuation or survive full collection are always made old.
So such mark words can simply be recreated in the new location after copying.
The few interesting ones, for example of a locked object, are stored in a side table and recovered from there after copying.

So again, we have two cases where the mark word gets overwritten with a tagged pointer and we're getting closer to when we'll see why that is a problem.
But first, deep breath!
Ready for the class word?

(No, no, no, don't skip ahead.
This is important and it'll be shorter.)

### Class Word

The mark word is followed by the class word, which in its archetypical form is a 64-bit pointer to a data structure called _klass_ (with a "k") that contains all kinds of meta-information about an object's type:

* its field layout
* its superclasses and interfaces
* a pointer to the `Class` instance (with a "C" this time - the Java class)
* and more

The class word is used quite frequently, for example for runtime type checks and reflection.
The garbage collector is particularly interested in the field layout.
It uses that to compute an object's size, which it needs to know when linearly scanning the heap or when sliding objects.
And because the class word is never overwritten the parts of the runtime that need type information can be unaware of the mechanisms that we discussed earlier because they only change the mark word.
I said that in the archetypical header form, mark word and class word are 64 bits each, but in most situations the JVM will set the option `UseCompressedClassPointers`, which halves the size of the class word to 32 bits.
Which finally brings us to Project Lilliput and JDK Enhancement Proposal 450.


## Compact Object Headers

JEP 450 proposes compact object headers as an experimental feature for the HotSpot JVM on x64 and ARM64.
It will be turned off by default and can be turned on with the option `UseCompactObjectHeaders`.
If activated, object header size will be reduced to 64 bits, which is achieved by removing the class word and stuffing the always-compressed class pointer into the mark word.
To that end, the identity hash code needed to loose a few bits, so now we have:

* 32 bits for the compressed class pointer
* 25 bits for the identity hash code
* 4 GC bits
* a new self-forwarded bit
* and the 2 tag bits

Now, do you see why we talked about all the times the mark word is replaced with a tagged pointer?
Since the mark word now includes the class pointer, the subsystems that need type information must follow that tagged pointer to recover the displaced mark word.
That not only requires a lot of code changes within HotSpot, it also has correctness and performance implications for locking, garbage collection, and more.
Let's go over these.

### Locking

Remember that to guarantee correctness the light-weight stack lock is inflated to a heavy-weight monitor lock when there's concurrent access to the displaced mark word.
That was fine when it could only be triggered by the relatively rare need to read or write the hash code but now that the class pointer is also displaced (and it's used very frequently), that would trigger the inflation of most locks, which would result in unacceptable performance overhead.
That's why Project Lilliput is working on an alternative light-weight locking protocol that stores locking data in a separate thread-local area rather than by displacing the mark word, thus keeping the class pointer in the object header.
There's a link to the issue tracking the work on this protocol in the description.

### Garbage Collection

When walking over the heap, the GC needs to know an object's length, which it gets from the klass information, which it gets by accessing the class pointer.
That's all good when the pointer is right there in the header, but when it's displaced, this incurs an additional dereference.
While the cost of that can be significant, in practice it is rare to walk over locked or already-forwarded objects.

Ok, but what about the cases where the GC, in the process of moving objects around, overwrites the mark word with the object's current or future address?
Because while an uncomputed hash code can be recreated later, the object's class pointer surely can't, and so all mark words are now interesting.
That would mean storing them all in the side table but that would consume a significant amount of native heap memory.

* Instead, in case of evacuation failure during young collection, where the mark word would be overwritten with the address to itself, JEP 450 proposes to set a dedicated self-forwarding header bit.
* For sliding compaction during a full collection, Lilliput proposes to compress the forwarding pointer into the hash code field and in the rare cases where that is not possible, use a side table like ZGC does.

### Hashing

Speaking of compression and hash codes...
Having only 25 bits for the identity hash code doesn't impact their correctness, remember that all hash codes being 0 is technically allowed.
But it may affect the performance of large hash tables that rely on higher identity hash code entropy.
This will have to observed in practice.


## The Compact Future

Project Lilliput is really exciting and it's great to see that JEP 450 is now out.
But as you've seen throughout this Newscast, this change touches many HotSpot subsystems and such massive changes warrant massive testing.
Lilliput is on it, though, and is battering their implementation with tests, benchmark suites, dedicated tools, and real-world workloads.
Speaking of real-world workloads, early adopters who have run those on preview builds confirm that live data is typically reduced by 10%–20%.

And when can you start testing?
I don't know whether JEP 450 will make it into 21 but I doubt it.
But I hope for in integration later this year, so maybe JDK 22 EA builds in fall or winter?

As for Lilliput's future after that, there are ideas for how to shrink the number of class pointer bits to 22 and to have side tables for hash codes and the object-to-monitor mapping, thus reducing the object header size to 32 bits.
Quote:

> That is our ultimate goal, but initial explorations show that it will require much more work.


## Outro

And that's it for today on the Inside Java Newscast.
That was a long one, thank you for sticking with it.
And since you made it all the way to the end, what about a like or a subscribe?
Then I'll see you again in two weeks.
So long...

---
title: "Stream Performance - Your Ideas"
tags: [java-8, performance, stream]
date: 2015-09-18
slug: java-stream-performance-your-ideas
description: "Another post about stream performance - this one implements your ideas about how else to approach the topic."
intro: "After my last post you had some ideas about how else to benchmark stream performance. I implemented them and here are the results."
searchKeywords: "stream performance"
featuredImage: stream-performance-your-ideas
---

Last week I presented some benchmark results regarding [the performance of streams in Java 8](java-stream-performance).
You guys and gals were interested enough to leave some ideas what else could be profiled.

So that's what I did and here are the results.

### Overview

The [last post's prologue](http://blog.codefx.org/java/stream-performance/#Prologue) applies here as well.
Read it to find out why all numbers lie, how I came up with them, and how you can reproduce them.

I added a new class [`CommentOperationsBenchmark`](https://github.com/CodeFX-org/lab-java8streamperformancebenchmark/blob/master/src/main/java/org/codefx/lab/streamperformance/CommentOperationsBenchmark.java) to [the code on GitHub](https://github.com/CodeFX-org/lab-java8streamperformancebenchmark) that includes precisely the benchmarks discussed in this post.
I also updated [the Google spreadsheet](https://docs.google.com/spreadsheets/d/1K-y44zFrBWpZXkdaBI80-g_MqJiuphmuZAP6gg6zz_4/edit#gid=1205798000) to include the new numbers.

[toc exclude=Overview]

## Impact Of Comparisons

> Nice.
Been saying for a long time writing java to being Ansi C like is faster (arrays not lists).
>
> The next step down the rabbit hole is...
>
> try { for(int i = 0;;) do stuff; } catch (Exception ex) { blah blah; }
>
> Don't check for the loop at all and just catch the exception, nice for HD pixel processing.
>
> [Chaoslab](https://www.reddit.com/r/java/comments/3k2s7j/java_8_stream_performance_compared_to_for_loops/cuv03it)

WAT?
People are doing that?

```java
public int array_max_forWithException() {
	int m = Integer.MIN_VALUE;
	try {
		for (int i = 0; ; i++)
			if (intArray[i] > m)
				m = intArray[i];
	} catch (ArrayIndexOutOfBoundsException ex) {
		return m;
	}
}
```

Maybe they should stop because it looks like it doesn't improve performance:

					             runtime in ms normalized to 1'000'000 elements
  ------------------------------ ------------------------------------------------ --------- ----------- ----------- ------------ ------------
					             50'000
  `array_max_for`                0.261
  `array_max_forWithException`   0.265

Looks like the mechanism used to break the loop has no measurable impact.
This makes sense as [loop unrolling](https://en.wikipedia.org/wiki/Loop_unrolling) can avoid most of the comparisons and the cost of throwing an exception is in the area of [a handful of microseconds](http://java-performance.info/throwing-an-exception-in-java-is-very-slow/) and thus orders of magnitude smaller than what happens here.

And this assumes that the compiler does have even more tricks up its sleeve.
Maybe it understands loops on a much more profound level and JIT compiles both methods to the same instructions.

On a side note: See how `array_max_forWithException` does not have a `return` statement after the loop?

Turns out that [the Java compiler recognizes simple infinite loops](http://stackoverflow.com/q/1958563/2525313 "Does Java recognize infinite loops?
- StackOverflow").
Wow!
So it knows that every code path with a finite computation returns and doesn't care about the infinite ones.

Boiled down, this compiles:

```java
public int infiniteLoop() {
	for(;;);
}
```

You never cease to learn...

## Impact Of Assignments

> \[F\]or the "max" tests I expect there's some drag from updating the local variable on every iteration.
I'm curious whether finding the minimum value runs in a comparable amount of time.
>
> [b0b0b0b](https://www.reddit.com/r/java/comments/3k2s7j/java_8_stream_performance_compared_to_for_loops/cuuvlsb)

This refers to the fact that all tests were run on arrays or lists whose elements equaled the index within the structure, i.e.
`[0, 1, 2, ..., n-1]`.
So finding the maximum indeed requires `n` assignments.

What about finding the minimum instead, which only takes one assignment?

					runtime in ms normalized to 1'000'000 elements
  ----------------- ------------------------------------------------ --------- ----------- ----------- ------------ ------------
					50'000
  `array_max_for`   0.261
  `array_min_for`   0.264

Nope, no difference.
My guess is that due to [pipelining](https://en.wikipedia.org/wiki/Instruction_pipeline), the assignment is effectively free.

<contentimage slug="stream-performance-your-ideas"></contentimage>

## Impact Of Boxing

There were two comments regarding boxing.

> It would also be nice to see the Integer\[\] implementation, to confirm the suspicion about boxing.
>
> [ickysticky](https://www.reddit.com/r/java/comments/3k2s7j/java_8_stream_performance_compared_to_for_loops/cuucdj4)

Ok, let's do that.
The following numbers show a for loop and a for-each loop over an `int[]`, an `Integer[]`, and a `List<Integer>`:

					         runtime in ms normalized to 1'000'000 elements
  -------------------------- ------------------------------------------------ --------- ----------- ----------- ------------ ------------
					         50'000
  `array_max_for`            0.261
  `array_max_forEach`        0.269
  `boxedArray_max_for`       0.804
  `boxedArray_max_forEach`   0.805
  `list_max_for`             0.921
  `list_max_forEach`         1.042

We can see clearly that the dominating indicator for the runtime is whether the data structure contains primitives or Objects.
But wrapping the Integer array into a list causes an additional slowdown.

Yann Le Tallec also commented on boxing:

> intList.stream().max(Math::max); incurs more unboxing than is necessary.
>
> intList.stream().mapToInt(x -&gt; x).max(); is about twice as fast and close to the array version.
>
> [Yann Le Tallec](http://blog.codefx.org/java/stream-performance/#comment-2244249020)

This claim is in line with what we deduced in the last post: Unboxing a stream as soon as possible may improve performance.

Just to check again:

					               runtime in ms normalized to 1'000'000 elements (error in %)
  -------------------------------- ------------------------------------------------------------- ---------------- ---------------- ------------- ------------- -------------
					               50'000
  `boxedArray_max _stream`         4.231 (43%)
  `boxedArray_max _stream_unbox`   3.367 (&lt;1%)
  `list_max _stream`               7.230 (7%)
  `list_max _stream_unbox`         3.370 (&lt;1%)

This seems to verify the claim.
But the results look very suspicious because the errors are huge.
Running these benchmarks over and over with different settings revealed a pattern:

-   Two performance levels exist, one at \~3.8 ns/op and one at \~7.5 ns/op.
-   Unboxed streams exclusively perform at the better one.
-   Individual iterations of boxed streams usually run on any of these two levels but rarely clock in at another time.
-   Most often the behavior only changes from fork to fork (i.e.
from one set of iterations to the next).

This all smells suspiciously of problems with my test setup.
I would be very interesting to hear from someone with any idea what is going on.

Update
:   *Yann indeed [had an idea](http://blog.codefx.org/java/stream-performance-your-ideas/?preview=true&preview_id=1983&preview_nonce=1218f9a91d&post_format=standard#comment-2260028885) and pointed to [this interesting question and great answer](http://stackoverflow.com/q/25847397/2525313) on StackOverflow.
Now my best guess is that boxed streams *can* perform on the level of unboxed ones but might fall pray to accidental deoptimizations.*

## Impact Of Hardware

Redditor [robi2106](https://www.reddit.com/user/robi2106) ran the suite for 500'000 elements on his "i5-4310 @2Ghz w 8GB DDR2".
I added the results to [the spreadsheet](https://docs.google.com/spreadsheets/d/1K-y44zFrBWpZXkdaBI80-g_MqJiuphmuZAP6gg6zz_4/edit#gid=2145492886).

It's hard to draw conclusions from the data.
Robi noted "I didn't stop using my system for these 2.5hrs either", which might explain the massive error bounds.
They are on median 23 and on average 168 times larger than mine.
(On the other hand, I continued to use my system as well but with pretty low load.)

If you squint hard enough, you could deduce that the i5-4310 is slightly faster on simple computations but lags behind on more complex ones.
Parallel performance is generally as you would expect considering that the i7-4800 has twice as many cores.

## Impact of Language

> It would be interesting how this compares to Scala (with @specialized).
>
> [cryptos6](https://www.reddit.com/r/java/comments/3k2s7j/java_8_stream_performance_compared_to_for_loops/cuuf1yn)

I still didn't try Scala and don't feel like working my way into it for a single benchmark.
Maybe someone more experienced or less squeamish can give it a try?

[java_8]

## Reflection

When interpreting these numbers, remember that the iterations executed an extremely cheap operation.
Last time we found out that already simple arithmetic operations cause enough CPU load to [almost completely offset the difference in iteration mechanisms](http://blog.codefx.org/java/stream-performance/#Comparing-Operations).
So, as usual, don't optimize prematurely!

All in all I'd say: No new discoveries.
But I enjoyed playing around with your ideas and if you have more, leave a comment.
Or even better, try it out yourself and post the results.

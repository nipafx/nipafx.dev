---
title: "Where to use Optional - Inside Java Newscast #19"
tags: [optional]
date: 2022-01-27
slug: inside-java-newscast-19
videoSlug: inside-java-newscast-19
description: "Is it ok to use `Optional` as parameter type? Overloading is an alternative, but how well does it stack up? Thoughts on this question (and other `Optional`-related ones) can usually be put into one of three (and a half) categories."
featuredImage: inside-java-newscast-19
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle and, all jokes aside, I _love_ talking about `Optional`, so lets take a look at [that recent Reddit thread][reddit] about "Opinions on using `Optional` as parameter".

Most of you probably know how `Optional` works, so I'll skip all of that - if you don't, there's a link to [a good tutorial][optional-tutorial] in the description.
And in the interest of succinctness, I'll also skip most of the part where I argue with people who are wrong on the Internet - I've put much of that in a companion blog post that I'll tell you a bit more about in a few minutes.
Here, I want to dive a bit deeper into the most common reply - overloading methods - and then categorize the different opinions on where to use `Optional` to give you a coordinate system for these conversations.

Are you ready for that?
Then let's dive right in!

[reddit]: https://www.reddit.com/r/java/comments/sat1j4/opinions_on_using_optional_as_parameter/
[optional-tutorial]: https://dev.java/learn/using-optionals/

## Overloading Instead Of `Optional`

As mentioned, a common reply was to avoid `Optional`-typed parameters by overloading the method.
That's a very good point and regardless of whether you find `Optional` as parameter type acceptable or not, it should be the first thing you try.
If it works, great!
In all likelihood, that's the best solution.
But there are cases where it doesn't work or at least not well.

<!--
Overload:
https://www.reddit.com/r/java/comments/sat1j4/comment/htz8wi8/
https://www.reddit.com/r/java/comments/sat1j4/comment/htz6hi2/
https://www.reddit.com/r/java/comments/sat1j4/comment/htx49be/
https://www.reddit.com/r/java/comments/sat1j4/comment/htwdkch/
https://www.reddit.com/r/java/comments/sat1j4/comment/hty3v9s/
https://www.reddit.com/r/java/comments/sat1j4/comment/htwlrcb/
https://www.reddit.com/r/java/comments/sat1j4/comment/htvjz51/
-->


### The Combinatorial Explosion

One problem with overloads are situations with more than one optional parameter and the combinatorial explosion that entails.
With just two optional parameters, you quadruple the number of overloads, so if the method already has three variants, you now have 12.
I think we can agree, that's not exactly a great situation to be in.

<!--
Explosion:
https://www.reddit.com/r/java/comments/sat1j4/comment/htwmg2u/
-->

Overloading can even be plain impossible if the optional parameters have the same type because each combination of "two out of three `String`s" looks the same to the compiler.
That said, this situation should've raised red flags in the first place and can often be avoided by using domain-specific types, like `Name` and `Street` instead of `String`.
There are situations where the optional arguments really are of the same type, though, and then overloading just doesn't work.

### Choosing an Implementation

But what irks me more than the shape and number of overloads is their implementation.
In my experience, an overloaded method often has a "canonical" implementation that accepts all arguments and then does the right thing - most overloads just forward to it.
How does _that_ method handle optional parameters?
By allowing `null` for them?
So there's a method that expresses optionality with nullability after all - then why go through the effort of defining all the overloads in the first place?

To avoid having this `null`-laden method in your API, which I think was the goal in the first place, you can of course hide it and then have callers pick the variant that matches their constellation of arguments.
That's no problem if your users have some non-`null` arguments at hand.
But it really isn't fun if they have a bunch of potentially absent variables, be they `null` or empty `Optional`s, because then they need a potentially lengthy `if`-`else` chain to figure out which overload is the right one.
This doesn't happen often, but if it does, it's really bad - so much worse than a bunch of `Optional.ofNullable`.
And very annoying if they already have `Optional`s on their hand, because they'll probably be wondering why they can't just pass those on - I know I do.

### Builders and Parameter Objects

A recurring recommendation to avoid the combinatorial explosion of overloads is to use the builder pattern for constructors and to create a parameter object for methods.
The builder pattern is definitely a solid recommendation.

But the parameter object is more hit and miss in my experience.
If there's a good abstraction that captures the optional parameters, by all means, go ahead and code it up.
But if there isn't, the parameter object is just an arbitrary type that needs to be wrapped and unwrapped around its values with a meager API.
It invites mistakes like passing `null` instead of an instance, maybe has neither `equals` nor `hashCode`, probably isn't serializable, and surely isn't supported by frameworks - so congratulations, you just reinvented `Optional` but worse.

So after trying overloading, builders, parameter objects, you might still not have found a satisfying solution.
What then?

<!--
Parameter object:
https://www.reddit.com/r/java/comments/sat1j4/comment/htwdkch/
https://www.reddit.com/r/java/comments/sat1j4/comment/htxy8dj/
https://www.reddit.com/r/java/comments/sat1j4/comment/htw6n2p/
-->


## Discussing `Optional`

It amazes me how much we discuss such a seemingly simple thing as `Optional`.
I mean, it contains just 125 real lines of code and this Reddit thread alone has over 170 comments.
You could say this is just bikeshedding, just a bunch of people talking about the simple thing in the back yard to avoid facing the daunting complexity of the nuclear reactor they should be working on.
And, yeah, that's surely part of it, but I think that's not all this is.

`Optional`'s simplicity as a class gives us a shared point of reference from where to explore wider topics.
We're talking about how it relates to other concepts, to overloading for example.
Or to serialization, to various frameworks, and to other languages.
We use it as a jumping-off point to discuss verbosity and the value of being explicit.
About expressing intent and the concept of absence, the dark void that lives in our soul, threatening to pull us into its eternally cold, uncaring depths.

I think those are topics worthy of discussion and I put my thoughts on some of them in a separate blog post that is linked in the description.


## `Optional` Camps

The Reddit post contains an off-the-cuff method `getStartingBalance`:
It accepts an `Optional<UUID>` that identifies a user and returns a starting a `double`.
For more variety, I want to add a method `getCurrentBalance` that accepts a `UUID`, not optional, but returns an `Optional<Double>` (no `OptionalDouble` because its API sucks).

```java
double getStartingBalance(Optional<UUID> user) { ... }
Optional<Double> getCurrentBalance(UUID user) { ... }
```

The question attached to that example was what people's opinions are on using `Optional` as a parameter type.
If we also throw in the question about `Optional` returns, we get to see all different camps on where to use `Optional`, three and a half by my count, to disagree.

### #1: Never use `Optional`!

Some consider `Optional`'s API verbose (all that wrapping and unwrapping), inviting mistakes (you can pass `null` as an `Optional` or immediately call `get` without checking), and not beneficial over explicit `null`-handling (`if isPresent` isn't better than `if null`).
It's not serializable and various frameworks don't support it.
It also makes stack traces harder to debug, hampers performance with additional dereferencing, and the many new instances increase memory consumption.

In summary, it's a train wreck and you should never use it unless forced to.
If that happens, unwrap quickly and move on.

Developers in this camp wouldn't write either method and would do their best to minimize contact with them.
I think this positions is dwindling, though, undermined by the reality that more and more APIs routinely use `Optional`.

### #2: Use `Optional` as a Return Value (in Limited Cases)

Indeed, `Optional` is not serializable, long-lived instances increase memory consumption, and (un)boxing it when passed as a method argument is verbose.
That's not its use case, though!
`Optional` was designed as a return value and, if used conscientiously, its disadvantages all but disappear:

* serializability doesn't matter
* instances are short-lived so they rarely make it to the heap
* its functional API makes operating on missing values very comfortable

So never use it for instance variables or method parameters, and only return it where `null` is particularly error-prone.

That rules out the `Optional` parameter type in `getStartingBalance`, but may allow `getCurrentBalance` to return `Optional<Double> `.
Although you could argue that the uppercase-D wrapper already shows that there may be no return value because otherwise it could just be the lowercase-D primitive.

### #2½: Use `Optional` as a Return Value (Always)

This is the half camp.
Its argument is very similar to the former with the addition that returning `null` is always error-prone, so always return `Optional` instead of `null`.
That ok's `getCurrentBalance` but still rules out `getStartingBalance`.

### #3: Use `Optional` Everywhere!

While the API isn't perfect, it's pretty good and `Optional` beats explicit `null`-handling with ease.
Framework support is at least acceptable nowadays and where it's lacking it can usually be plugged in manually.
The latter is also true for serializability with the Serialization Proxy Pattern.
The performance argument applies only when performance requirements were violated and profiling showed `Optional`-using code to be the culprit.

So there's no strong argument against using `Optional`, but a good one for it:
If used everywhere where optionality can't be avoided, `null` is no longer a legal state.
That makes code easier to understand and debug because every `null` is obviously a bug.
And the consistent use also eliminates a lot of wrapping and unwrapping that some worry about.

In Camp #3, `getCurrentBalance` returning an `Optional` is definitely ok and under some circumstances so is `getStartingBalance` receiving one - maybe because callers already have an optional user at hand.

<!--
https://www.reddit.com/r/java/comments/sat1j4/comment/htwabik/
https://www.reddit.com/r/java/comments/sat1j4/comment/htw58as/
-->

### Where to Pitch Your Tent?

So the question is, in which camp do you pitch your tent?
The developers of `Optional`, for example [Brian Goetz][brian] and [Stuart Marks][stuart], have a clear recommendation:
Go to camp #2, where `Optional` is only used for return values when absence is error-prone.

As far as best practices go, this is the way - if there's no other approach your team can agree on, do it like this.
Because in the end, like with many coding guidelines, every team has to come to a decision and then follow it or you end up with the worst of all worlds, plus edit wars and frustration.
Also, since it's usually easier to relax rules than to put the tooth past back into the tube, it's good to start with a stricter rule.

As for my personal opinion, I'm decidedly in the `Optional`-everywhere camp.
If you want to see a code base that does this, check out JUnit Pioneer, a JUnit 5 extension project that I maintain with a few other people - [link you know where](https://github.com/junit-pioneer/junit-pioneer).
You'll not find a single legal `null` in that code base and not that much `Optional`-wrapping either.

[brian]: https://stackoverflow.com/a/26328555/2525313
[stuart]: https://www.youtube.com/watch?v=fBYhtvY19xA

<!--
https://www.reddit.com/r/java/comments/sat1j4/comment/htwpanh/?utm_source=reddit&utm_medium=web2x&context=3
-->

## Outro

And that's it for today on the Inside Java Newscast.
If you have any questions about what I covered in this episode, ask ahead in the comments below and if you enjoy this kind of content, help us spread the word with a like or by sharing this video with your friends and colleagues.
Have a great end of the Lunar year, if that's your preferred way of counting them, and I'll see you again in the new one.
So long...

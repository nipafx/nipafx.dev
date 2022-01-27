---
title: "More Opinions On `Optional`"
tags: [optional]
date: 2022-01-27
slug: java-optional-opinions
description: "How much work is it to wrap `Optional`? Do you need to `null`-check `Optional` arguments? What about serializability and framework support? And why consider the type in the first place? Answers in here!"
featuredImage: java-optional-opinions
---

Last Sunday, an unsuspecting Redditor kicked the ant hill by starting yet another conversation about `Optional` - and I was thrilled to see it!
I love discussing this topic and so I immediately started writing the script on it for [the next Inside Java Newscast](inside-java-newscast-19).
That turned out to be way too long, so in the video I focus on the most common argument (overloading methods instead of using `Optional`) and categorized the opinions on `Optional` to give these conversations a bit more structure.

<contentvideo slug="inside-java-newscast-19"></contentvideo>

This blog post here contains the remainder of my thoughts on and replies to the Reddit thread.

## (Un-)Wrapping `Optional`

[A common argument](https://www.reddit.com/r/java/comments/sat1j4/comment/htwasst/) against using `Optional` was [brought forth](https://www.reddit.com/r/java/comments/sat1j4/comment/htyk9gj/) by Stuart Marks himself:

> If you have a method parameter of type `Optional` your callers still have to pass something, whether it's `Optional.of(value)` or `Optional.empty()`, so it clutters up the call sites.

That's true and it can be annoying.
But there's a good retort to that and it was even put forward [in one of the other threads](https://www.reddit.com/r/java/comments/sat1j4/comment/htwcn0j/):

> If you want to pass a value, there's a decent chance that it's already wrapped in an `Optional` in the current scope (it turns out that stuff that's optional in a downstream method is frequently optional in the current method).

I gotta say, that's my experience as well.
Usually, optional parameters pop up because the first caller, the one for which the method was originally introduced, had an `Optional` on their hands, so no wrapping is needed there.
And because most systems seem to require most data to be present, chances are good that the absent value is also frequently absent for other callers, too, so they don't need to wrap either.

What I find interesting here is how this seems to be the flip side of the overload selection I describe in the video.
There, I talk about three ways to model absence:

1. You can create a single method that expects some of its arguments to be `null`.
2. You can hide that method and create `null`-rejecting overloads that forward to it.
3. You can use `Optional` for all potentially absent parameters.

Now, let's see how those three variants behave in two different situations.
If you have a few arguments and know neither of them is `null`...

1. Call the `null`-accepting method, padding the absent arguments with `null`.
2. Easily select the overload that matches the arguments you have.
3. Call the `Optional`-accepting method with some `empty` and `of` calls in there.

If, on the other hand, you got a bunch of arguments, with some of them potentially absent...

1. Simply call the `null`-accepting method.
2. Build an `if-else` chain to select the correct overload.
3. Call the `Optional`-accepting method, maybe with some wrapping involved.

The `null`-variant comes off pretty well in this comparison, but remember that is it the sneaky one where you're never sure what can be `null` and why.

## Checking `Optional` for `null`

A [not](https://www.reddit.com/r/java/comments/sat1j4/comment/htwanm2) [infrequent](https://www.reddit.com/r/java/comments/sat1j4/comment/htvkfrp/) [comment](https://www.reddit.com/r/java/comments/sat1j4/comment/htyoeni/), often presented like a big gotcha, was that since `Optional` can be `null` as well, you still need to do a `null` check for the `Optional` argument.

Ehmm.... no?!

The parameter clearly isn't meant to be `null` so if it is, there's nothing to be done except throw a `NullPointerException`.
You don't need a `null` check for that - just call a method on it.

That said, passing or returning `null` for an `Optional` is really bad.
There's _never_ a situation where this is acceptable.
On the one hand that means that if it _does_ happen, it's automatically a bug and one that's easy to fix (probably just replace with an empty `Optional`), which is way simpler than if you first have to figure out whether `null` may legally represent absence in this case.
On the other hand, it makes it very easy to educate your colleagues accordingly.

So, don't do `null` checks for `Optional` arguments unless you store them away (e.g. in fields).

## Serializability

`Optional` isn't serializable.
Which sucks when using it as parameter or return type in methods that are called by, for example, RMI (not the most common use case anymore, though).
To work around that, you first need to [create a serializable wrapper](serialize-java-optional), which is fairly straightforward.
You can then use that wrapper in the methods that need it, which adds an additional wrap/unwrap call on each end - not great, but not the end of the world, either.

If you're considering using `Optional` for fields, you can apply the serialization proxy pattern to replace the `Optional` with the value it wraps in the class' logical representation.
The blog post [on the serializable `Optional` wrapper](serialize-java-optional) describes that as well.
If you already have a serialization proxy set up, this change takes a few minutes.
If you don't, check out item 90 in the third edition of Effective Java or [this post](java-serialization-proxy-pattern) for why and how.

And since we're talking about Effective Java, give item 85 "Prefer Alternatives to Java Serialization" a read.
I quote:

> In the words of the computer named Joshua in the 1983 movie _WarGames_, "the only winning move is not to play."
> There is no reason to use Java serialization in any new system you write.

## Framework Support

Yeah, this one is still not looking great.
I checked a few and, frankly, was a bit shocked by the lack of progress.

[In JPA](https://thorben-janssen.com/use-java-8-optional-hibernate/), entities can't have `Optional`-bearing fields, but if field injection is configured, at least the accessors can bear `Optional`s.
[Spring Beans](https://blog.frankel.ch/optional-dependencies-in-spring/) and [Spring Data JDBC](https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#projections.interfaces.nullable-wrappers), on the other hand, allows such fields in configs and projections, respectively.
Likewise, [Jackson](https://github.com/FasterXML/jackson-modules-java8) supports them out of the box, but [GSON](https://github.com/google/gson/issues/1102) and [Moshi](https://github.com/square/moshi/issues/1329) need custom adapters.
[Map Struct](https://github.com/mapstruct/mapstruct/issues/674) has an open issue for this, which was recently added to the 1.6 milestone.

So, yeah, if you're working with a framework and like to use `Optional` a lot, check compatibility for your use case beforehand.

## Why `empty`, `of`, and `ofNullable`?

This one didn't come up in the conversation, thankfully, but it is often trotted out as an argument for `Optional`'s API being "just stupid":
Why does `Optional` have three static factory methods—`empty`, `of`, and `ofNullable`—when the last one clearly suffices?

In short: to express intent.
If the method returns an `Optional`, but you don't have a value, return `Optional::empty`.
If, on the other hand, you have a value that you expect to never be `null`, use `Optional::of` to express that assumption and fail early if it turns out to be wrong.
Only use `ofNullable` if you don't know and don't care whether the instance you want to wrap is `null`.

## Expressing Intent

Since we're talking about expressing intent, that's the main upside I see with `Optional`.
As [one comment](https://www.reddit.com/r/java/comments/sat1j4/comment/htvq87i/) succinctly put it:

> The importance of `Optional` is not to handle `null`, but to explicitly express the intention of nullability.


This!

If `Optional` is used consistently, either for all returns that allow absent values or in all other places as well, it becomes much more than just an API to handle absence.
It becomes the sole and unmistakable marker for all cases in which a value can be absent.

Because the problem with `null` isn't the `if` statements, it's figuring out whether `null` was a legal value in the first place.
Once that's settled, fixing it is usually easy.
And when consistently using `Optional` for every absent return type or even _any_ absent instance, in all those cases the legality question is already settled and all that remains is the easy part.

I wrote [an entire article](intention-revealing-code-java-8-optional) (and [another one](stephen-colebourne-java-optional-strict-approach/)) about this, if you like more detail.

(Wow, seven and six years old, respectively.
Tempus fugit.)

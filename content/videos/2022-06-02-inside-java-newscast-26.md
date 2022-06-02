---
title: "Deconstructing Records in Pattern Matching - Inside Java Newscast #26"
tags: [project-amber, pattern-matching]
date: 2022-06-02
slug: inside-java-newscast-26
videoSlug: inside-java-newscast-26
description: "How record patterns use records' transparency to safely deconstruct them in pattern matching, allowing us to separate checking structure and value of data from processing it."
featuredImage: inside-java-newscast-26
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today we're gonna look at [JDK Enhancement Proposal 405][jep-405], which proposes to preview record patterns.
As we hoped for in the last Newscast, it has indeed been targeted for JDK 19, so we can discuss how to take records apart in pattern matching!

If you've watched this show even somewhat regularly, you already have a good understanding of where pattern matching in Java stands right now, so I'm not gonna repeat that.
If you want to catch up, check out Inside Java Newscasts [#8][ijn#8] and [#24][ijn#24] or my Oracle Dev Live talk [Pattern Matching in Java 17 and Beyond][odl].

With that out of the way, let's dive right in!

[jep-405]: https://openjdk.java.net/jeps/405
[ijn#8]: https://www.youtube.com/watch?v=anQq-R6AWOY&t=222s
[ijn#24]: https://www.youtube.com/watch?v=ENX5kHblFlY
[odl]: https://www.youtube.com/watch?v=UlFFKkq6fyU


## Deconstructing Records in Pattern Matching

### Record Recap

Before we go into the JEP, for everything to make sense we need to quickly recap an aspect of records, so let's start there.
So what are records all about?

Avoiding boilerplate. - No
Generating Java beans! - That doesn't even...
Poorly copying Scotlin features. - Noo!

Ok, so records are _transparent carriers for immutable data_ and the aspect we care about here is the transparency.
It promises that a record's state is fully accessible from the outside.
We can hence safely deconstruct it, meaning storing its state in variables, without having to worry about missing something hidden that we can't access.
We could do that by declaring new variables one by one and assign them the accessors' return values, but there's a better approach.

A record has a so-called canonical constructor that's always aligned with the list of components.
That gives us a natural pattern to declare and assign the variables that make up a record - we'll call it, I don't know, a _record pattern_.

This brings up topics like destructuring assignments like JavaScript has, how to handle components we don't care about, and whether this would be open to non-record classes - and I'm gonna get to those later but now let's look at deconstructing records in pattern matching.

### Extracting, Checking -> Processing

So what is pattern matching in `switch` all about?

It's about analyzing an instance and deciding based on its structure and value which piece of code to execute.
Unlike a series of `if`-checks, it clearly expresses that exactly one branch is supposed to be executed and the compiler will make sure that that's actually the case.
To that end, it relies on well-known patterns that the compiler understands and not just a series of arbitrary checks like an `if` does.
This works best if all checks can be encoded as patterns and `when` clauses on the left-hand side, so the right-hand side only contains the actual code processing the instance - this also makes for the most readable code.

So far, we can only use type patterns in switch - as a preview as I explained in [episode #24][ijn#24].
So if, for example, you switch over an event and only want to process orders from the last second, you'd want to check whether the event is an order event, extract its timestamp, check whether that's no more than 1 second in the past, and if so extract the order and process it.

But type patterns only allow you to do the first check with a `case OrderEvent oe` on the left side, leaving an `if` to check the timestamp, say with the method `is1SecondPast`, and more extraction for the right side.
Going further, `when` clauses allow you check the timestamp with `case OrderEvent oe when is1SecondPast(oe.timestamp())` but still leave more extraction for the right side.

And this is where deconstruction patterns come in handy because with them it is much easier to access the required components of the object.

### JEP 405

JEP 405 proposes that for a record like `OrderEvent` with a timestamp and an order you simply put what looks like the canonical constructor where the type name goes in a type pattern:
So `case OrderEvent(Instant timestamp, Order order)`.
To implement the rest of our requirement, we'd follow it up with `when is1SecondPast(timestamp)`, then probably the arrow, and on the right side just the instruction to process the actual `order`.
Easy, right?

Now, say the switch wants to special-case expensive orders.
Of course we could just put an `if` on the right that checks `isExpensive(order.amount())`, but that muddies the water - we want all checks on the left and only processing on the right.
No problem because record patterns can be nested!

So assuming `Order` is also a record, with components `amount` and `items`, we can further deconstruct it with `case OrderEvent(Instant timestamp, Order(int amount, List<Item> items) order)` and expand the `when` clause with `&& isExpensive(amount)`.
Then we take this new case and put it before the old one.
That's important because the old case covers all instances of the new case, the expensive orders, and more, the inexpensive ones.
That means the old case _dominates_ the new one and needs to come later.

Let's take another look at the last example, particularly the pattern `Order(int amount, List<Item> items) order`.
Not only is the order deconstructed into the amount and items, the `Order` instance itself is also assigned to a variable of name `order`.
This is called a _named_ record pattern and optional - you could omit the variable `order` if you don't need it.

Speaking of names, it's important to understand that components are not identified by their name but by their position.
That means you don't have to decompose `Order` into `amount` and `items` - for example, `payment` and `orderItems` or just `a` and `i` would work as well.
Also, you don't have to mention the types - you can just use `var` when you're not decomposing further.

But what about components we don't care about?
Let's leave JEP 405 behind and talk a bit about what may be coming in the future.

## Speculations

You might know that Java 8 deprecated and Java 9 disallowed using a single underscore as an identifier.
The plan is to reintroduce it with the special meaning of marking variables that the developer doesn't care about.
Say you have a lambda that gets two parameters `foo` and `bar`, but you only need `foo` - wouldn't it be nice to write `(foo, _) ->` whatever?
Or in the case of patterns, when you don't need an order's items, wouldn't it be nice to write `Order(int amount, _)`?
Yes and yes!
If I remember correctly that was originally part of [JEP 405][jep-405] and I don't know why it got kicked out but I really hope we see it proposed soon - particularly deconstruction patterns, which require us to list all of a record's potentially many components, would be all the better for it!

Something else that Brian Goetz and others have been hinting at is this.
Consider a regular declaration and assignment, say `Order order = getOrder()`.
Doesn't the left side look a lot like a very simple pattern that just covers all possible order instances?
Could we just make it accept deconstruction patterns?
Imagine we replaced `Order order` with `Order(int amount, var items)` - then we would have destructured the method's return value.
Holy shit, is this JavaScript?!

Well, this is highly speculative and I have no idea whether it will come, when that would happen, or what it might look like.
But it's exciting and you'll hear about it here first!
Unless you read [the mailing lists][amber-dev], or [inside.java][ij], or [Reddit][r-java], or follow [@Java on Twitter][tw-java], or follow [@nipafx on Twitter][tw-nipafx].
But right after that!

Finally a quick word on deconstructing classes, meaning non-records.
The idea to allow that with dedicated deconstructors has been floating around as well although a class' encapsulation would of course mean a lack of transparency.
It's all still pretty vague at this point.

[amber-dev]: https://mail.openjdk.java.net/mailman/listinfo/amber-dev
[ij]: https://inside.java/
[r-java]: https://reddit.com/r/java/
[tw-java]: https://twitter.com/Java
[tw-nipafx]: https://twitter.com/nipafx/


## Outro

And that's it for this Inside Java Newscast episode - you gotta admit, it was a pretty sick one.
Id' love to know what you think about JEP 405, so leave a comment below.
Don't forget to share this video with your friends and enemies.
I'll see you again in two weeks - so long...


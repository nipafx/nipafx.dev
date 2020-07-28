---
title: "A Taxonomy Of Comments"
tags: [clean-comments, documentation]
date: 2015-09-28
slug: taxonomy-comments
description: "A taxonomy of source code comments that enables further discussion about clean code and comments."
intro: "To discuss the up- and downsides of comments we need to know what exactly we are talking about. Categorizing and characterizing different kinds of comments is an important preparatory step."
searchKeywords: "taxonomy comments"
featuredImage: taxonomy-of-comments-contract
---

Comments can be used to convey what code does, what it should to, what it does not do, why it exists, when and how it should and shouldn't be used, and more.

Let's categorize them!

Isn't this boring?
Well, maybe, although [Carl](https://en.wikipedia.org/wiki/Carl_Linnaeus) didn't think so.
And I see it as an important next step in our discussion about comments:

[codefx_series\_comments\_list]

### Overview

The different kinds of comments will be compared along the lines of their content, maintenance implications, locations and alternatives.

The icons are from the [News and Magazine icon set](https://www.iconfinder.com/iconsets/news-and-magazine), created by [HevnGrafix](http://hevngrafix.com/).

[toc exclude=Overview heading_levels="2,3"]

## Categories

### Narrations [![taxonomy-of-comments-narration](//blog.codefx.org/wp-content/uploads/taxonomy-of-comments-narration-150x150.png){.size-thumbnail .wp-image-2071 width="30"}](http://blog.codefx.org/techniques/documentation/taxonomy-comments#narrations) {#narrations}

There are comments which narrate ***what*** the code does.
Things like "loop through the list of customers" or "increase total by the new product's price".

#### Maintenance

For these comments to add *any* value at all, they must be absolutely up-to-date.
Every diversion between code and comment will quickly lead to confusion and soon afterwards to them being ignored.

#### Location

These are typically inline comments.

The only way to keep them halfway maintainable is to only ever let them reference code in the following few lines.
Everything else falls apart quickly because there is no mechanism to find the far-away comments referencing the code one is about to change.

#### Alternatives

Narrations can be made almost superfluous by writing clean code.
Careful naming, transparent design, employment of well-known patterns, etc.
explain the code much better and also make it more maintainable.

It is widely agreed that these comments should be avoided.
Only in rare cases, if arcane but unavoidable language mechanisms are used, might they be necessary.

### Contracts [![taxonomy-of-comments-contract](//blog.codefx.org/wp-content/uploads/taxonomy-of-comments-contract-150x150.png){.size-thumbnail .wp-image-2071 width="30"}](http://blog.codefx.org/techniques/documentation/taxonomy-comments#contracts) {#contracts}

Then there are contract-defining comments.
They describe the central abstraction of a unit of code, how it interacts with its dependencies, and which pre- and postconditions hold.

They also talk about ***what*** the code does but unlike narrative comments they do so in a declarative style.
Ideally, they can be read *instead* of code and tests.

#### Maintenance

Writing and maintaining comments that fulfill this promise requires determination, an eye for detail, and unambiguous language.

Successfully doing so will greatly increase the usability of the commented code.
Unclear or outright wrong comments, on the other hand, or failing to keep contracts and code in sync will cause lots of confusion down the road.

Unlike narrations, contract comments only describe abstract behavior instead of implementation details and maintenance is hence less intense.

#### Location

In any language that has these, documentation comments (e.g. [Javadoc](http://www.oracle.com/technetwork/java/javase/documentation/index-jsp-135444.html) or [.NET XML comments](https://msdn.microsoft.com/en-us/library/b2s063f7.aspx)) should be used to express this category.

There is a clear imperative of locality.
Contract comments preferably talk about single concepts and only mention other units of code (e.g. one method another) if absolutely unavoidable.
If possible, this happens solely in the form of automatically updated links (e.g. [*@see* in Javadoc](http://docs.oracle.com/javase/8/docs/technotes/tools/windows/javadoc.html#CHDDIEDI)).
Otherwise the comments should avoid duplicating information and create a single source of truth.

#### Alternatives

Clean code and tests are often considered an alternative to contract comments.

The striking advantage of tests is that as long as the they are passing, the unit is guaranteed to display the tested behavior.
The same is of course not true for comments where behavior and documentation can differ due to ambiguous wording and halfhearted maintenance.

A disadvantage of documenting solely in code and tests is that building a high level understanding from the bottom up requires context switches and takes time - potentially a lot.
Much of the newly gained knowledge might soon be forgotten if the analyzed code is not worked with afterwards.

I consider the comparison of clean code and tests on one, and contract comments on the other side the most crucial aspect in this discussion.
I will not further it here but repeat what I said before: Why not invest in both?

### Technical Context [![taxonomy-of-comments-technical](//blog.codefx.org/wp-content/uploads/taxonomy-of-comments-technical-150x150.png){.size-thumbnail .wp-image-2071 width="30"}](http://blog.codefx.org/techniques/documentation/taxonomy-comments#technical-context) {#technical-context}

Comments can provide technical context and clarify ***what*** a unit code is there ***for***.
They can explain when it can be used and when it can not, which problem one might solve with it, and even give examples for how to do that.

Note that some of these information might also be part of the contract but it is important not to confound the two categories!
Contract comments make a promise, context comments explain why it was made and what it's good for.

Context comments will be of great value to anyone learning about that part of the code - be it to use it or to modify it.

#### Maintenance

In order to provide helpful context the author has to see things from the reader's perspective.
Something which can be difficult if routine-blindness strikes and all the abstractions and hard parts are so obvious.

Unlike contracts, context comments are not meant to replace reading and understanding the code itself - they only support that.
So while they should be fairly up-to-date, some deviation from the code is tolerable.

#### Location

It is essential to prevent the confusion of contract and context comments!
It is hence best not to mix them or, if the language provides no other commonly used mechanism, at least separate them clearly.

In Java it is common to compose them as non-Javadoc blocks, usually at the beginning of the described unit of code.
Since Java 8 [the new tags *@apiNote* and *@implNote*](javadoc-tags-apiNote-implSpec-implNote) can be used as well.

By their very nature comments of this kind might be less local and allude to other units of code.
It is of course preferable to keep them local and find a meaningful place for them.
This is not imperative, though, as they do not always have to be up-to-date.

#### Alternatives

The reader can usually find production code calling the unit she is investigating or have a look at its tests.
Deriving a broader understanding from these call sites is similar to understanding a contract from its tests: it is always up-to-date but can be a tedious bottom-up approach.
Additionally this might mix intended and problematic use cases without further distinction or explanation.

Demos are a great way to describe what a piece of code is there for.
They are rare, though, and must be maintained as well.

### Historical Context [![taxonomy-of-comments-historical](//blog.codefx.org/wp-content/uploads/taxonomy-of-comments-historical-150x150.png){.size-thumbnail .wp-image-2071 width="30"}](http://blog.codefx.org/techniques/documentation/taxonomy-comments#historical-context) {#historical-context}

Code is often written according to some specification or situation that demands a non-obvious design.
Maybe a cleaner approach could've been taken were it not for some very specific detail that could otherwise not be incorporated.
Documentation explaining such circumstances provides valuable information to understand ***why*** the code exists.

One form to document historical context are code comments.

#### Maintenance

They should always be taken with a grain of salt and be written in a form which prevents confusion with other comments.
Ideally historical context comments include some phrase like "at the time of writing" to emphasize their transient nature.
It is easier to identify them as outdated if they clearly state their assumptions.

I see little reason to invest time in updating them.
It seems better to let them stand even if slightly aged and simply delete them when the circumstance they describe changed too much for them to be useful.

#### Location

Maybe even more often than comments providing technical context will these describe or reference concepts that do not have a natural singular location.
This is tolerable if it is agreed upon that they are not updated.

#### Alternatives

In the form of commit messages these information can also be added to source control.
Doing so has the advantage that commit messages are always "up-to-date" as the changeset itself is immutable.
A message can also cover a set of changes across different files, which often comes in handy.
At the same time, this can be a disadvantage because very local information must be searched across several larger messages.
Finally, looking up commit messages adds a level of indirection from code to documentation.

Another source for historical context are the issues the commits are associated with.
They can contain lots of valuable information that are hard to present in comments or commit messages, like diagrams, discussions with clients, links to other sources like Wikis, and more.
But issues are even further removed from the code and often cover more high-level ground.

<contentimage slug="taxonomy-of-comments"></contentimage>

## Reflection

We divided comments into these four categories:

Content

Maintenance

Location

Alternatives

Goal

Cost

Form

Locality

Narrations

what

(descriptive)

match

impl.

very high

inline

very

important

clean code

Contracts

what

(declarative)

match

behavior

high

doc.

comments

important

clean code,

tests

Technical

Context

what for

be

helpful

medium

block

comments

preferable

clean code,

tests, demos

Historical

Context

why

delete if

outdated

very low

point out

transience

preferable

commit msg,

issues

I hope this taxonomy helps teams to decide whether and how they want to use comments.
We can see that different kinds have different properties and should hence be discussed separately.

---
title: "Comment Your &*☠# Code!"
tags: [clean-comments, documentation]
date: 2016-06-24
slug: talk-comment-your-code
description: "A heartfelt rant / thoughtful talk arguing for more comments in code"
searchKeywords: "comments"
featuredImage: comment-your-code
slides: https://slides.nipafx.dev/comment-your-code
videoSlug: comment-your-code-accento-2019
---

You think your code is so clean that it doesn't need any comments?
Or are your colleagues convinced that all comments are failures?
Then this talk is for you!

Let's first dispute some common arguments against commenting code:

* Comments lie?
* Tests are better?
* Good names suffice?

We find fault with all of them (and more)!

With that out of the way we categorize comments and analyze their costs and benefits.
This wills us the means to discuss the end:
Which comments will improve a code base?

Of course, every team has to come up with its own answer, but the vocabulary and ideas presented in this talk can help find it.

<!--
## Pitch

After working in different code bases I've got the impression that it is common to not comment code at all (not even doc comments; e.g. Javadoc in Java). I am convinced this has considerable downsides and the community should move away from the overly simplifying "clean code doesn't need comments".

The talk is based on an [ongoing series of blog posts](tag:clean-comments). The [first](comment-your-fucking-code) was a heartfelt rant against common arguments for not writing comments; it lends its title and content to this talk (but not its choice of words). It found much resonance with the community, with responses ranging from “just read Clean Code, dude” to “maybe some comments but just a little” to “OMG yes“. The entailing discussions online and at my workplace started an ongoing thought process, which the talk will roughly follow.

The first part disputes arguments against comments. It will be given in a ranty tone of someone tired of hearing them (that would be me). The next part is a neutral exploration of the topic, categorizing comments and analyzing their costs and benefits. The last part draws conclusions from the preceding analyses and recommends techniques to identify places where comments add considerable value and how to write them to reduce maintenance.

The talk generally argues in favor of comments but not for "comment everything" or any other rigid strategy. Instead, it provides tools to employ comments in a beneficial way. It also wants to help teams discuss the topic and come to a shared understanding on how they want to comment their code.

## Details

### Disputing Arguments Against Comments

* Tests replace comments
(comments are much faster to comprehend).
* Good names suffice
(a host of pre- and postconditions do not fit into a name).
* It's _either_ "clean code" _or_ "comments"
(why not do the first as best you can, then polish with the latter?).
* Comments are only for public APIs
(they add value to every reused unit of code, no matter how public it is).
* Comments age/lie
(they get neglected; often by the same developers later claiming they "aged")

### Categorization

Includes an analysis of maintenance and location characteristics and looks at alternatives for recording the same information.

* Narrations
(e.g. "increase total by the new product’s price")
* Contracts
(e.g. library documentation with Javadoc or XML comments)
* Technical context
(explain what the code is there _for_)
* Historical context
(explain idiosyncrasies of the system or business logic that influenced the design of the commented unit)

### Costs And Benefits

* Costs
	* Initial composition
	* Maintenance
	* Confusion (if a comments is misleading)
	* Obstruction (because it takes up lines)
* Benefits
	* Keeps abstractions intact
	* Supports a top-down approach to understanding code
	* Documents intent
-->

---
title: "What Happened to Java's String Templates? Inside Java Newscast #71"
tags: [project-amber]
date: 2024-06-20
slug: inside-java-newscast-71
videoSlug: inside-java-newscast-71
description: "JDK 23 doesn't contain the string template preview that was present in JDKs 21 and 22. Let's discuss why the feature was removed (probably not for the reasons you think), what a new proposal could look like, and when we may see it."
featuredImage: inside-java-newscast-71
---

And just like that, string templates are gone!
What happened here?
Was it because of the syntax?
Will string templates come back and when?
Let's talk about it.

<!-- Logo -->

Welcome everyone, to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about the withdrawal of the string template preview from the JDK - from a technical point of view but also what that tells us about the development process and when we may see a new proposal.
Ready?
Then let's dive right in!


## Why String Templates Are Out

JDK 21 and 22 [previewed string templates](https://openjdk.org/jeps/459), a language feature that makes it easier to safely embed variables in structured languages like SQL, HTML, JSON, etc.
I assume you know its outlines and understand how it embedded variables and how it required template processors to turn those templates into strings or other arbitrary objects.
If you don't, here's a video that will fill in the gaps.

From its first days, the proposal caught some flack.
Lots of people took issue with its use of `\{}` instead of something they're more familiar with (like `${}`) to embed variables and we'll get back to that later.
There were also qualms about its special syntax for processor invocations (the `$processor.$template` syntax), which was just sugar for a regular method call to the processor's `process` method.

Then there are a few things that turned up when using the feature in practice, for example within jextract.
One is that template processors often don't quite cut it, for example due to the intentional limitation that they need to return something.
And in those cases, it would be super handy to just pass the string template to a method but that required the special processor `RAW`, which wasn't exactly elegant.
Nesting templates also wasn't really supported but would be very handy.
And, lastly, when designing or evolving text-based APIs, developers would have to choose between methods accepting strings or template processors, two very different approaches.

Brian Goetz summarized this as "the real criticism here is that template capture and processing are complected, when they should be separate, composable features".

```java
// TEMPLATE CAPTURE
// creating a string template
// (e.g. to assign to a variable)
StringTemplate t = // ...

// TEMPLATE PROCESSING
// turning the template into something else
// (often a string, maybe an SQL query)
Statement query = SQL.process(t);

// EXAMPLE OF COMPLECTION
// must apply a processor, even
// if just to get the template
StringTemplate t = RAW."template";
```

But that intertwining wasn't an accident.
A background design goal of string templates was to bring the abysmal performance of string formatting on par with string concatenation.
The template processor `FMT` accomplished that because it got access to an internal API, was highly optimized, and occurred right next to the string it was supposed to format.
That last point turned out not to be a requirement for a fast implementation, after all, and so the template and the code processing it don't have to appear side by side, after all.

This was the straw that broke the processor's back.
It turned out, processors aren't needed right there next to the template, which means they don't need a special syntax to be usable and the string template processing can happen in just any arbitrary method.
This unravelled a lot of already-settled design decisions and basically sent string templates back to the drawing board.


## Current State in JDK 23

All of this came to a head in March, when Brian Goetz sent [a mail to an Amber mailing list](https://mail.openjdk.org/pipermail/amber-spec-experts/2024-March/004010.html) recounting this development.
This triggered a super-interesting discussion but it's length and breadth indicated that this issue wouldn't be solved in the remaining 12 weeks or so before JDK 23 would be branched and so the decision was made to remove string templates entirely.
And as we've touched on in the last Inside Java Newscast, that's exactly what happened:
JDK 23 contains no string templates at all and once you update your experimental and hobby code bases, you'll have to rip out everything related to string templating, which isn't particularly fun.

<contentvideo slug="inside-java-newscast-70"></contentvideo>

Talking about not fun.
I'm not entirely healthy right now, you might hear it in my voice, and I'm a bit unfocused, too.
Haha, very funny.
But it's not bad enough to call in sick and I really wanted to let you know about string templates, so I recorded the video anyway.
That said, I didn't quite manage to keep the script short and I also don't want to spend an inordinate amount of time editing the remainder of the video, so to keep it lively, I'll just record in different rooms around my flat.
What do you think about that?
Doesn't matter, I'll do it anyways.


## String Template Future

So what's going to happen next with string templates?
Before we delve into that, keep in mind that nobody can predict the future.
What follows is based on the discussions on the mailing list, specifically the exchange in early March, but as you can tell by what just happened, nothing is set in stone.

Ok, with that out of the way, there are a few things we should examine:

* the string template goals
* security vs simplicity
* the dollar sign
* the most elegant solution
* open questions
* future timeline
* what this means for OpenJDK

Let's get into it!

### String Templates Goals

Probably most importantly, none of the experiences made during the preview phase changed the goals that string templates set out to achieve:

* simplify and improve readability of combining strings with values computed at run time
* improve the security of such mixed expressions by supporting validation and suitable transformation
* enable transformation to non-string values that doesn't require an intermediate string representation
* allow non-JDK code, like in libraries or applications, to seamlessly hook into this mechanism

An essential observation is that these goals don't include "make string interpolation as simple as possible".
In fact, this is explicitly listed as a non-goal - quote:

> It is not a goal to introduce syntactic sugar for the string concatenation operator, since that would circumvent the goal of validation.

Let's talk about that next.

### Security vs Simplicity

> Why don't you just add string interpolation like all those other languages have.
> Stop overcomplicating everything!

... is a common opinion on this topic.
But, and how do I put this delicately, it's not on point.
Not because of the intention - I get that string interpolation would be nice to use.
But because of its superficiality.

Nobody needs to be saved from having to type a `+` between a string and a variable.
But in the most recent [OWASP Top Ten](https://owasp.org/Top10/A03_2021-Injection/), injection attacks are in third place (down from first place in the previous ranking, btw).
This is clearly a serious problem for our industry and regularly causes the loss of sensible user data, legal challenges, and significant financial damages.
_This_ is a problem worth tackling, not the `+`.

But if it's all about security, why do the goals mention simplicity and readability?
Well, first of all:
Don't get me wrong, it would be really nice to get rid of the `+`, so I'm all in favor of exploring the options there.
But more importantly, if the new approach is safer than concatenation but less elegant (even less elegant), there will always be a tension and developers will always tend towards the unsafe option.
So making it more elegant than concatenation will avoid that tension and make us want to use the safer option.
But to achieve that, it doesn't need to be the most elegant solution - just elegant enough.

And it's important to think about this holistically.
[Python Enhancement Proposal 498](https://peps.python.org/pep-0498/) introduced literal string interpolation to Python.
[PEP 501](https://peps.python.org/pep-0501/) _starts_ by pointing out that code using it is "superficially elegant" but also "an opening for a form of code injection attack".
It then proposes a new kind of expression and an `InterpolationTemplate` type that look very similar to the string template previews in JDK 21 and 22.
So did Python copy Java here?
Eh no, all this went down in 2015 and while Python does have interpolation since then, it never got around to retrofitting a safe alternative.
Oops - better to think about this upfront, I guess.

So that's why we won't get, I don't know... `String s = ``text $variable``;`
Oh, and I'm pretty sure we won't get `$` for embedding variables either.
Let me burst that bubble next!

### 🤑🤑🤑

So I know that quite a few people weren't very happy with the `\{}` syntax to embed expressions.
They're used to `$` or `${}` from some other languages and want to see the same in Java.
But while familiarity is a good reason to examine a potential solution, it's not a good reason to adopt it.
And really, there's nothing in favor of `$` except familiarity.

Well, some people say it's hard to type `\{` on their keyboard but given that curly braces are ubiquitous in Java and the backslash isn't exactly rare either, I don't think this argument is very strong.
And, for what it's worth, on my German keyboard, `\{` is simpler than `${`.
Maybe that makes me biased, I don't know.

Anyway, there are two main arguments against the dollar sign:

1. If it becomes a special character in string templates, it needs to be escaped to appear as-is, and given that it's quite common, that would be annoying.
2. Turning a string into a string template or the other way around would then require carefully updating a bunch of dollar escapes even though they are entirely unrelated to any interpolation that the developer is probably thinking about right now.

I also want to point out that of the top 10 TIOBE languages, only JavaScript actually embeds expressions with a `$`, so... I don't know, doesn't seem to be that common after all.

The main arguments for `\{}` are that `\...` is already an established escape mechanism (so why add another one?) and that `\{` is a currently illegal character sequence, which means it's not present in non-template strings, doesn't need escaping, and the compiler will yell at you when you switch from a template to a regular string.
And based on these arguments, Brian describes `\{}` as "objectively better" than the dollar sign, so I'm pretty sure that's what we'll end up with.

Ok, any more dreams I can crush?
Oh, yeah, the old solution was too cumbersome, we need something more elegant!

### Elegance

Right, so a few folks found `STR."text \{variable}"` too cumbersome, specifically the `STR.` part.
If you're one of them and were happy that this proposal was retracted, I'd recommend to curb your enthusiasm - I don't think the next proposal will be leaner than that.

So here's the thing:
The `STR.` syntax was essentially just a shortcut for calling `STR.process()` with the string template as an argument, right?
This was done so the template and its processor must appear side by side, which was considered necessary to make `FMT` faster than `String.format` due to some internal optimization that I don't understand.
Since it now appears possible to achieve that performance improvement by other means, without those having to appear side by side, that special syntax no longer carries its own weight - we'll probably end up simply creating a string template and then passing it to a method.

So string templates could just be a new kind of literal, although it's unclear what exactly they would look like.
To have something to talk about, let's say they use backticks as delimiters.
Then a simple interpolation could be something like `String.interpolate(``text \{variable}``)`.
That's less weird but longer than that `STR.`, so... yeah, don't hope for a shorter solution is all I'm saying.

### Open Issues (and Timeline)

(Yep, this is my bathroom.
Yep, we are doing this.)

So as I just described, a new proposal will:

* favor security over the simplest possible interpolation
* will very likely use `\{}` to embed expressions
* will probably get rid of any syntax sugar and require regular method calls to process templates

Still, there are a lot of open questions to be answered and they may well shape the feature in entirely unforeseen ways.
For example:

* What would APIs look like in the future?
  Regular methods accepting strings and or string templates presumably?
  A few security-sensitive APIs may limit themselves to just templates, but many more would be ok with either - do they all need overloads?
* What marks a string template?
  In the retracted proposal that was the template processor, but with that out of the picture, does something else need to take its place?
  It would be nice to be able to seamlessly create a template without variables, specifically for those APIs that only accept a template.
* And what about concatenating and nesting templates?
  Should that be possible or specifically supported?
* Another one is: Should `String` extend `StringTemplate` or the other way around?
  Or maybe string literals can be either?

All of these and more have been discussed at length in that thread back in March and I can only recommend to check it out if you want to have an informed opinion on these matters.
But these and more questions need to be answered before a new proposal can be made.
And since the main goal is to improve security in Java, all answers will have to be measured by that metric.

And just so it has been said, I don't think it's guaranteed that we'll see string templates in Java in the future.
If there's no solution that's both safer and elegant enough (in terms of usability, migrations, etc.), then maybe we'll be stuck with `+`.
And as a corollary to that observation:
I have no clue when we'll see another proposal, but just personally, I'd be somewhat surprised to see a JEP on this in 2024.

### The Preview Process

(Yeah, I'm back here.
Sorry I ran out of ideas.
But, hey, I changed the colors.)

While opinions on the proposal varied, sometimes widely, most comments I saw were generally appreciative of the fact that the OpenJDK developers are taking the time to get this right and that they made the surely-not-easy decision to retract the proposal this late in the game instead of just letting it get over the finishing line in a state they didn't think was optimal.
And I agree with that!
Yeah, I liked the proposal.
And I have to rework quite a bit of code to pull templates out and then, hopefully, put them back in in a few months.
Still, if the folks behind this think they can make it better, I'm inclined to trust them and see what the next proposal will be.

In fact, I think this is a great example of the process working as intended.
Preview features are here to be used in practical experiments (internally or externally) without the wider community relying on them.
This allows OpenJDK to identify weaknesses and, if necessary, correct course or even scrap a proposal entirely.
So that's all good.

Still, I know we were all kinda surprised that this happened.
I mean, in over five years, I think, it's the first preview feature that didn't become final.
While that was always possible, it didn't feel quite real.
But it is!
So let this be a reminder:
Preview features can change, evolve, or be dropped - just like [the JEP that introduced the concept](https://openjdk.org/jeps/12) points out.

Talking about JEPs:
Preview features are impermanent and do not carry over from one Java release to the next.
Even if unchanged, a new JEP needs to be filed for the next release to include the feature.
As an unfortunate side effect of that, people who limit their reporting on a new Java version to the JEP list, won't give you the full picture as they would miss cases like this.
But that's easily fixed:
Just get your Java info from people who know what they're talking about!

That was your cue to subscribe to this channel.
I meant us, I mean... it doesn't matter.
Don't forget to leave a like as well and I'll see you again in two weeks.
So long ...

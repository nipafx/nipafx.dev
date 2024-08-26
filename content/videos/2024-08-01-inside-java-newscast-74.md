---
title: "How to Read a JDK Enhancement Proposal - Inside Java Newscast #74"
tags: [openjdk, community, java-next]
date: 2024-08-01
slug: inside-java-newscast-74
videoSlug: inside-java-newscast-74
description: "OpenJDK evolves Java through JDK Enhancement Proposals, JEP for short, and uses them to communicate its intentions, but the the devil is in the details"
featuredImage: inside-java-newscast-74-a
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna dive back into the string template drama - sort of.
Back in June, when JDK 23 was forked, a lof of people looking into that and even a few reporting on it didn't quite catch that string templates were no part of 23.
Why?
Because they didn't read the JEP correctly and since that happens again and again, I thought I'd take this opportunity to talk about how to read a JEP.
First some theory and then I'll answer a bunch of frequently asked questions on this topic.
Ready?
Then let's dive right in!

## JEPs From 10'000 Feet

Let's start with a triviality that only a fool wouldn't know.
JEP of course stands for Java Enhancement Proposal, Java Enhancement Proposal, Java Enhancement Propo, Java Enhanc
Crap, there goes my carefully crafted illusion of expertise.
But we can learn something from that:
How easy it is to overestimate one's understanding of these documents.

Just three simple examples:

* they're a description of a JDK feature
* all features get JEPs
* JEPs are immutable

And those are all wrong.
Not just on a "well, actually"-level, no, they're _very_ wrong.
So before we get into JEP details, lets set the stage.

"An _enhancement_ is an effort to design and implement a nontrivial change to the JDK code base or to do some other kind of work whose goals, progress, and result are worth communicating broadly."
A JDK Enhancement Proposal, then, is at the center of that communication.
In its early state (more on states in a minute) it forces its authors to put their analysis, research, and ideas into writing for the wider Java but specifically the OpenJDK community, which needs to decide whether to move forward or not.
And as the JEP progresses through the states and the idea evolves due to discussions, prototypes, and feedback, the JEP is updated accordingly and eventually serves as the focal point for the decision whether to adopt the proposal.
Whether adopted or not, after that, it stands (usually unchanged) as documentation of what was done and why.

Already we can see a few core properties of JEPs that get easily overlooked:

* OpenJDK uses JEPs as part of its development process, which implies certain requirements and limitations
* during its active lifetime, the text is a _proposal_ of what should be (in the eyes of its owners) not a _description_ of what is
* a JEP is a living document that goes through considerable rewrites and multiple state changes

Before we get to those states and a few more JEP details, let's get a few frequently asked questions out of the way.


## JEP FAQ #1

> So, where can I learn more about JEPs?

Plenty of places actually:

* [the URL for JEP 0](https://openjdk.org/jeps/0) leads to an overview page with all JEPs that was recently restructured for better readability
* [JEP 1](https://openjdk.org/jeps/1) describes the overall process but is mostly superseded by [a JEP 2.0 proposal](https://cr.openjdk.org/~mr/jep/jep-2.0-02.html)
* JEPs [11](https://openjdk.org/jeps/11) and [12](https://openjdk.org/jeps/12) describe how incubator modules and preview features are being developed

And there are of course links to all this in the description.

> What do JEP numbers mean?

JEPs proposing JDK features or infrastructure improvements like the migration to Git get an incrementing number that was started at 101 - at the moment, the next free number is 483 and we're currently seeing about a dozen JEPs in each JDK release.
JEPs that change the OpenJDK development process, so-called _process JEPs_, get the numbers under 100, with 1 to 3 and 11 and 12 already taken.
What's with the split of smaller vs larger than 10?
Haters will say I wrote this script last minute and couldn't find out in time but let's not go there.
As soon as I know, I'll pin a comment.

> Are JEPs self-contained?

They strive to be but there are limits to that.
Particularly when they connect to other features that are also in planning, this connection is usually not explored due to the nature of a JEP - proposing one enhancement at a time.
For the larger vision behind them, it's often better to search for documents of the OpenJDK project proposing them, mailing list exchanges, or videos on this channel.
Subscribe and ding that bell.

> Do JEPs capture all changes in a new release?

No.
Like, _noooooo_.
The bar that a change needs to clear to become a JEP is quite hight and many, many, many changes don't even come close.
Please read the release notes for every new JDK release to get the full picture.
Or have Billy read them to you!
He does that for every JDK release in the week it comes out - here's the one for JDK 22.

> What's the connection to the Java Community Process and the Java Specification Requests?

A proper answer to that would take a bit of time, so I'll try a short and oversimplified one:
The JCP and JSRs are mainly concerned with the Java Platform Specification as a whole.
The OpenJDK Community, and hence JEPs, are mainly concerned with the design, specification, and implementation of specific features.
When a JEP wants to change part of the specification, those changes are rolled up into the Platform JSR for the relevant release.


## JEP Progression

A minute ago, I mentioned that JEPs go through states.
And indeed they do, as you can see in this handy diagram.
No need to rush to the screen if you're currently cooking, commuting, or whatever else you're doing while having me on, yapping in the background.
Imagine a diagram with 11 nodes, 24 arrows, and 13 annotations.
Yeah, it's a bit of a mess, so let's talk through it.

The first state in every JEP's life cycle is _Draft_ - a lot can change here and it's not advisable to form an opinion about what's going to happen this early on.
Once the JEP owners are happy, they submit the JEP and then the OpenJDK Lead, Mark Reinhold, may make it a _candidate_ JEP.
And this is the state most JEPs have for most of their existence.
As work on them progresses, further changes will be made until eventually, they go down the road of publication:
Owners _propose to target_ a specific JDK release and the project lead can confirm, making the JEP _targeted_.
Once the code is merged, the JEP is _integrated_, and once all follow-up work is completed, it's _complete_.
Still, however unlikely, things can change.
They're only settled once the JDK version is released, at which point the JEP is _closed_ as _delivered_.
Early on, owners can also _withdraw_ a JEP or the OpenJDK lead can _reject_ it and once it has been targeted, the owner or the project lead can propose to _drop_ to it.

The importance of these states is hard to overstate.
This was one source of the string template confusion:
Yes, the text of JEP 465 said, in fact still says, "We propose to finalize the feature".
Similarly, the text of JEP 468 says that derived record creation will be a preview feature in JDK 23.
But that's just what's being proposed - were those JEPs targeted to JDK 23?
No?
Then the texts don't matter.
Period.

So when reading a JEP, carefully parse the header.
There you'll find the JEP's authors and owner, its status, what mailing list to contact, last update date, and a link to the JBS issue.
Oh right!
I should probably mention that a JEP is just a special kind of issue in the JDK Bug System, JBS for short, the JIRA instance OpenJDK uses as issue tracker.
You don't need an account to view them and it comes in handy when you want to check a JEP's history, for example.

The other mistake people made with string templates is that they mistook "no JEP" for "no news" but preview features need to be renewed on every release, even if unchanged.
So "no JEP" doesn't mean mean "no news", it means "no feature".
I'd love to get deeper to into the process and technical aspects of preview features, but I'd rather answer a few more JEP-related questions.
Let me know in the comments if a Newscast on that topic is something you're interested in.

## JEP FAQ #2

> There's a JEP with my favorite feature - when will it be released?

That's the wrong question to ask.
The more interesting one is _whether_ it will be released.
(What?)
Anything up to and including candidate JEPs may neither have nor, in the worst case, ever get an implementation.
Later states require one but it can still get rejected.
A JEP only describes a real feature once it reached closed/delivered - anything before that is speculation, albeit with varying degrees of uncertainty.
And as a corollary to all that:
Nobody can say when it gets released.

> A JEP lists my favorite feature as a non-goal - why do you hate it?

Non-goals must be understood in the context of a JEP.
They really just define its scope and clarify what _this_ specific JEP is _not_ trying to do.
Generally speaking, that doesn't mean anything about OpenJDKs overall attitude towards that goal.
In fact, somebody could be drafting a JEP right now that makes that very non-goal its goal and starts working on it.

> Can there only be one JEP for any one feature?

No.
While that rarely happens, it is entirely possible for multiple JEPs to propose features that solve partially or even fully overlapping problems.

> How can I create a JEP?

You need to be a contributor to OpenJDK, which requires you to participate in mailing list discussions, have made a few small contributions, and have signed the Oracle Contributor Agreement.
But more important than that organizational hurdle is that you have identified something really worth working on, which is best figured out in communication with the respective OpenJDK group or project.
The best way is to start is with a mail laying out the problem and maybe your research into possible solutions - don't focus on a proposed solution before you convinced anybody that there's a problem worth solving.

> How can I contribute to a JEP?

Give feedback!
That's the easiest one:
Give feedback.
You don't need JBS access for that, by the way, just write to the mailing list that's listed in the JEP's header.
Ideally, with practical feedback after trying out a prototype or preview feature in practice.
That feedback can of course be critical and propose changes but please also mention what works and why - this is almost as important as what doesn't work.
Once you've done that for a while, avenues for other contributions will open up by themselves.

> Nice, thank you!

Ok, I hope that answered all your questions but if it didn't, please ask ahead in the comments - as always I'll hang out there to reply.

And that's it for today on the Inside Java Newscast.
If you liked the video and think more Java devs should see it, help us spread the word with a like.
Subscribe if you didn't already and I'll see you again in... oh right, that's gonna be a while actually.
A couple of months I asked Ana and Billy to take over an episode or two and by coincidence they picked the remaining ones from now up to and including the JDK 23 release, so I'll see you again on the live stream for the JDK 23 release.
So long ...

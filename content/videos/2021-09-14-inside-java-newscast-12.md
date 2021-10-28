---
title: "Faster LTS and free JDK with Java 17 - Inside Java Newscast #12"
tags: [java-17]
date: 2021-09-14
slug: inside-java-newscast-12
videoSlug: inside-java-newscast-12
description: "Java 17 comes with more than just new features. A faster LTS cadence and free Oracle JDK make this the best-supported modern release ever."
featuredImage: inside-java-newscast-12
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.

Wait, no, no, no.
This is no normal episode.
It's the Java 17 release day _and_ we got some big news, so could you at least dress for the occasion?

Better.

Ok.

Now, go!

I'm Nicolai Parlog, Java developer advocate at Oracle and... eh... big news, right, oh right.
Oracle made two big announcements today regarding long-term support: how frequent you can get it and how much you pay.

Ready?
Then lets dive right in!


## Long-Term Support

### Every 3 Years

Remember the old days when we hoped for a new Java release every two years but got one every three to five?
Then came the new release cadence that, like clockwork, has been shipping a new feature release every six months since then.
They're high-quality and production-ready, full of new features, enhancements, and bug fixes.
Most developers really like that change and some are in the fortunate position to have gone with each release as it came out.

But many enterprises were still used to a less nimble approach and for that we have the LTS releases.
Oracle committed to offering long-term support for every sixth version, so every three years, starting with 11.
Most other community members adopted the same time frame and so there's a wide range of offers for 11 and now 17 from volunteers providing free, up-to-date OpenJDK builds on a best-effort basis to commercial offerings with SLAs and everything.
This also worked well and many companies flocked to these versions.

But there's a tension here between developers and companies:
The former often prefer a faster, incremental update strategy while the latter opt for the stability offered by updating every few years.
We've seen a drift towards the faster cycle with more and more projects and companies adopting it, but we at Oracle think that we can do more to ease the tension and give that drift a little push.

### Every 2 Years 🤯

Because today, September 14th, Mark Reinhold, Chief Architect of the Java Platform Group at Oracle, proposed to increase the LTS cadence to every four versions, meaning every two years.
If this proposal is accepted, the next LTS versions after 17 won't be 23 and 29 but 21, 25, and 29.

Shortening the time span between LTS releases obviously eases the tension as developers don't have to wait quite as long for companies to adopt new versions.
And beyond that, it also makes non-LTS versions more attractive.
I think the steps from 11 to 17 demonstrated that going with each version is entirely possible and feasible, but turning six steps into four will make that option safer yet.

In case you're wondering how long "long-term support" will be now, that's up to every vendor to decide.
As for Oracle, it will continue to offer the usual minimum of eight years of paid support for each LTS release.

I'm really hyped about this change and am curious to hear from you.
In the comments below, of course, but you can also reply on the OpenJDK general discussion mailing list (link below, an d remember you need to subscribe before posting) or under the hashtag #javatrain on Twitter.
Not right now, though, because I got more great news for you!


## Oracle's JDKs

### Oracle's OpenJDK vs Oracle JDK

Oracle offers two JDK distributions:

One is _Oracle's OpenJDK_, a straight-up, GPL-licensed, free to use OpenJDK build that you can find on jdk.java.net,
It ships each feature release followed by two quarterly update releases, so you can always get an up-to-date OpenJDK build for the very latest feature release from Oracle.

The other distribution is _Oracle JDK_.
It's also based on the OpenJDK code base, but may contain additional fixes that were developed for customers.
As I mentioned before, the LTS versions, currently 11 and 17 of the modern releases, are supported by Oracle for at least eight years.
But to use, for example, Oracle JDK 11 in production, you need an Oracle Java SE Subscription, meaning you have to become a paying Oracle customer, which also gets you customer service, contractual guarantees, access to the new Java Management Service, GraalVM Enterprise, and all of that fancy stuff.

This situation might seem weird.
On the one hand you have the six-month cadence and on the other the LTS versions.
Java's steward offers free access to the first but not the second.
But that's about to change!

https://www.oracle.com/java/java-se-subscription/

### Free Oracle JDK

Starting with JDK 17, you will be able to use Oracle JDK for free, now also in production!
Instead of under the OTN licence, it will be available under a new, more permissive license that doesn't require you to click-through, so all kinds of tooling will be able to pick it up.
For more license details and sexy legalese, check out the FAQ that I link in the description.

As always, Oracle JDKs get quarterly updates in sync with the larger OpenJDK Community.
The first three years of those are free, which gives you a nice one year overlap with the next LTS version if the two-year cadence gets adopted.
After that, you can either eagerly jump to the newest release, conservatively step to the next LTS, or pick an offer that allows you to be spared all of those pesky new features that ship with new versions and stick to the one you've enjoyed for three years already.

This resolves the awkwardness I mentioned before as you can now get free JDKs from Oracle for both the six-month cadence as well as the LTS versions.

I want to quickly point out that this changes nothing for Oracle's OpenJDK builds.
All I said about Oracle and OpenJDK before stays as is - this is just about Oracle JDK.

https://www.oracle.com/java/technologies/javase/jdk-faqs.html

### Free Support?

Does that mean Oracle support is now free?
First, the word "support" is terribly overloaded.
It's used to describe anything from "on a best-effort basis, we provide up-to-date builds and help triaging problems" to "you can call this hotline 24/7 to have a production issue fixed within X hours".

What this offer gives you for free is bit by bit the same Oracle JDK that paying customers receive.
What you don't get are the other perks of the Java SE Subscription that I mentioned before.
Makes sense, right?


## Bits & Bytes

There are so many more things happening right now.
One is, and I'm not sure you knew that, but Java 17 came out today!
Check this episode for a quick feature rundown and then head over to jdk.java.net/17 to get your fix.

Also, Oracle Developer Live all about Java is happening right now for the Americas, but the edition for the rest of the world takes place Thursday if you're interested.
Link below.

Then there's something the Dev Rel team has been working on for a few months.
You know how Java doesn't have a canonical site that targets developers?
That you can use to start learning Java?
That the community can use as a reliable source on new developments and features.
That acts as a hub to all the other sites from jdk.java.net to the tool documentations and Javadoc?
That has at least decent search engine tags so you might actually find it when searching for stuff that you don't yet know where to find exactly?
I'm sure you see where I'm going with this...
Because now all of that exists under dev.java.
I'll talk more about it in the next Newscast but you can check it out until then.

Talking about talking about things.
If you're watching this video in the hours after it goes live, you have a good chance that I'm streaming on Twitch right now.
I'll just be there to answer questions about everything I explained above or everything Java, really, so you have any, come by and ask.
Find me at twitch.tv/nipafx - I'll be live until about 1730  UTC, that's 1030 am Pacific time and 1930 European summer time.

Otherwise, do all the YouTube things, I'll see you again in two weeks
So long...

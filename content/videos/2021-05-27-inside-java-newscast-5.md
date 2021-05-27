---
title: "Pattern Matching in Switches and Security Manager Deprecation - Inside Java Newscast #5"
tags: [switch, pattern-matching]
date: 2021-05-27
slug: inside-java-newscast-5
videoSlug: inside-java-newscast-5
description: "JEP 406, which is a candidate for Java 17, introduced pattern matching in `switch` statements and expressions, introduces guarded patterns, and improves null handling. Then we need to talk about JEP 411's deprecation of the security manager."
featuredImage: inside-java-newscast-5
---

## Intro

Welcome everyone,

to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today we got two topics for you:

* new switch and pattern matching capabilities from JEP 406
* a few comments on the discussion around deprecating the security manager with JEP 411

Ready?
Then let's dive right i..

Wait, did you notice that I said "_we_ got two topics for you"?
Because today, I'm not alone.
Jose Paumard is with me - Java Champion, JavaOne Rockstar, my colleague here at the Java Platform Group at Oracle, and an all around amazing Java expert.
He'll tell you all about Java Enhancement Proposal 406.


## Pattern Matching And Switches

Thanks, Nicolai.
Indeed we have a new JEP: the [JEP 406] called _Pattern matching for switch_.
It's still a preview feature and as of this recording, it is a candidate JEP, so we'll see if it makes it to the targeted JEPs for JDK 17.
This JEP 406 is build on the [JEP 394] _Pattern matching for instanceof_ and the [JEP 361] about switch expressions.

With pattern matching for `switch`, you will be able to use the same syntax in the case label of a switch expression as the one you can use in the `instanceof` operator.
For instance this is what you will be able to write:

```java
String message = switch (o) {
	case null, (String s && s.isBlank())
		-> "Hello there!";
	case (String s)
		-> String.format("Hello %s!", s);
	default
		-> "Hello!";
}
```

`String s = switch`, because `switch` is now an expression that returns something.
Then `o`, the switch-element, between brackets and then the series of cases you need between curly braces.

Now here is the new thing:
For your cases you can write `String s`, same syntax as `instanceof`, that defines a pattern variable, here `s`.
Then you add your little arrow in ASCII art, we all love this, and then some code that can use this pattern variable.
This is the first new thing and it's really great.

But there is more.
As in the case of `instanceof`, you will be able to add a boolean expression to the pattern.
So have something like `case String s`, this `String s` defines a pattern variable `s` of type `String` that you can use later and an `s.isBlank()`, for instance, if this is what you need to test.
And, as it was the case for the switch expression, you can also combine different cases in one case expression, for example check if this object is `null` and then another case if you need it.

This syntax may look like what you can already do with `instanceof` but is in fact very different because a `case` label does not accept a boolean expression.
A case label is a constant, it's not a boolean expression.
So this boolean operator `&&` is in fact an extension to the pattern matching itself, and this extension is called a guarded pattern.

I hope you're as excited as I am about this new feature, it’s really great to be able to do that and it's one more step towards pattern matching in Java, which is the goal of the Amber project.
And now back to the studio, thanks Nicolai, I'll leave it to you.

[JEP 406]: https://openjdk.java.net/jeps/406
[JEP 394]: https://openjdk.java.net/jeps/394
[JEP 361]: https://openjdk.java.net/jeps/361


## Security Manager Deprecation

[JEP 411], which is proposed to target Java 17, deprecates the Security Manager for removal.
That has lead to some spirited discussions and a few misconceptions that I want to set straight:

* what happens in Java 17 and what happens later?
* does this break projects?
* why does the security manager need to be removed in the first place?
* what about non-security use cases

Now, before I start, I considered asking you to go read the JEP before you form your own opinion, but then I realized you're way too smart to participate in a conversation based solely on second-hand knowledge, so I scrapped that part.

[JEP 411]: https://openjdk.java.net/jeps/411

### What happens in Java 17?

Let's start with what behaviors are actually proposed to change in Java 17. Three things:

First, most security manager related classes and methods are annotated as deprecated for removal.
If your project directly interacts with this API, you'll see new warnings during compilation.

Then there's the system property `java.security.manager`.
Stick with me for a moment.
This property has been around since forever and [JDK 12 expanded it][JDK-8212047] two years ago by interpreting the values "allow" and "disallow" as special tokens.
With "allow", no security manager is enabled at startup but one can be set at run time with the `setSecurityManager` method.
With "disallow", no security manager is enabled at startup and none can be set at run time.

In Java 12 to 16, "allow" was the default value, although [the Javadoc][sm-12] already mentioned that a future release may change that to "disallow".
And that's exactly what's proposed to happen in Java 17: the default value changes.
So if your app sets the security manager at run time, you need to set the system property `java.security.manager` to "allow".

The third change is that if you use the security manager, you get a warning on the command line that it will be removed in the future.
And that's all for Java 17.
So unless your project actively uses the security manager, this change requires no action from you.

[JDK-8212047]: https://bugs.openjdk.java.net/browse/JDK-8212047
[sm-12]: https://docs.oracle.com/en/java/javase/12/docs/api/java.base/java/lang/SecurityManager.html

### I heard this breaks projects

One thing that has been wandering around the Internets is that this change breaks some or even many projects out there.
Well... as far as anybody knows the only project that is directly impacted by this is Eclipse Equinox.

Besides specific tokens like "allow" and "disallow", the system property `java.security.manager` accepts class names as values and Equinox wants to instantiate those classes.
You can probably guess where this is going:
It doesn't yet know about "allow" and "disallow" and tries to instantiate classes of that name, [which leads to a `NoClassDefFoundError`][eq-573731].
Equinox project lead [Thomas Watson is on it][tw-tom], though, and already [has a patch][eq-patch], so this specific problem will be solved soon.
That means projects that use Equinox _and_ load a security manager at run time, need to update their dependency to run on Java 17.

You might also have heard about [NetBeans not launching][nb-5703].
NetBeans uses Equinox but not a recent version, so they might now benefit from the fix.
They're using a pretty old version, but they already patch it locally and even the specific file that needs to be changed!
That has the unexpected benefit that the fix for NetBeans boils down to a one-line change - as OpenJDK security developer Wei-Jun Wang showed, [it even fits in a tweet][nb-patch].

This is not uncommon.
Even the most innocuous JDK changes, including internal ones, can cause some project or other of the thousands out there to break.
Frequently, like in this case, they just trigger a latent bug or misconception that then gets fixed and everybody moves on.
What's important here is that these get found early, so there's plenty of time to fix'em.
That's why I keep imploring that you run your project builds against recent Java versions, including early access builds of upcoming releases.

[eq-573731]: https://bugs.eclipse.org/bugs/show_bug.cgi?id=573731
[tw-tom]: https://twitter.com/TomWatson5150/status/1397151910340218885
[eq-patch]: https://git.eclipse.org/r/c/equinox/rt.equinox.framework/+/180950/2/bundles/org.eclipse.osgi/container/src/org/eclipse/osgi/internal/framework/SystemBundleActivator.java
[nb-5703]: https://issues.apache.org/jira/browse/NETBEANS-5703
[nb-patch]: https://twitter.com/wangweij/status/1397273810194288643

### What happens after Java 17?

So, what happens after Java 17?
Since Oracle and pretty much all other JDK vendors consider 17 to be a long-term support version, you'll likely be able to use the security manager for 5 or 10 years to come.

That said, at some point after Java 17, releases will start to make security manager calls no-ops.
During that, the API itself will still be around, so frameworks and libraries that call such methods have time to adapt.
At some point, though, the classes and methods themselves will be removed.

I know of no time frame for either of those changes, but, speaking only for myself here, I'd be surprised if the next LTS release after 17 still contained a fully functioning security manager.

### Why the eventual removal?

But why remove the security manager at all?
Won't that make Java less secure?
In theory, yes.
The security manager, if used correctly, makes your app more secure.
You can see the but coming, right?
[Phrasing]!

But it's not that simple.
The security manager has a number of theoretical and practical shortcomings, which I can't possibly explain here, so I'll refer to the JEP as well as the Inside Java article [_Security and Sandboxing Post SecurityManager_][sandbox].
The combined effect of those shortcomings is that the security manager isn't all that great in practice and hasn't seen wide adoption.
As evidenced by the JEP and [the][sec-dev-sm-1] [discussions][sec-dev-sm-2] [on][sec-dev-sm-3] [the][sec-dev-sm-4] [mailing list][sec-dev-sm-5], not many people can come forward who actually use it in their app.
So while _theoretically_ useful, it's not contributing a lot to overall security _in practice_.

By the way, if your project relies on the security manager to make it more secure, please take that to [the mailing list][sec-dev].
As much fun as it is to leave spicy YouTube comments, provocative tweets, or forceful messages on Reddit, and while you will meet me and other people from the Java Platform group *Ron Pressler* there, any serious conversation about such topics belongs on the mailing lists.

Back to the security manager.
All new language features and APIs must be evaluated to ensure that they behave correctly when the security manager is enabled.
It also takes away time from other security-related work.
That constitutes a real cost - to Java's evolution as a whole as well as to its security in particular.

When balancing these costs and benefits, the JDK devs don't think the security manager comes out ahead.
So it's gotta go.

[Phrasing]: https://www.youtube.com/watch?v=hyLWrKh2fB0&t=23s
[sandbox]: https://inside.java/2021/04/23/security-and-sandboxing-post-securitymanager/
[sec-dev-sm-1]: https://mail.openjdk.java.net/pipermail/security-dev/2021-April/025486.html
[sec-dev-sm-2]: https://mail.openjdk.java.net/pipermail/security-dev/2021-April/025527.html
[sec-dev-sm-3]: https://mail.openjdk.java.net/pipermail/security-dev/2021-April/025495.html
[sec-dev-sm-4]: https://mail.openjdk.java.net/pipermail/security-dev/2021-May/025703.html
[sec-dev-sm-5]: https://mail.openjdk.java.net/pipermail/security-dev/2021-May/025706.html
[sec-dev]: https://mail.openjdk.java.net/mailman/listinfo/security-dev

### What about other use cases?

I've said that the security manager isn't used very much, but that's only part of the truth.
It isn't used very much _for security_, but a number of projects use it for different purposes, namely to intercept or observe specific interactions.

A great example is `System.exit`.
Say you create a webserver - then you're probably not a fan of the idea that any app that happens to call `System.exit` shuts down the entire server, right?
The security manager happens to contain functionality that lets you prevent that.
Or you want to observe which library uses the file system.
Once again, you can utilize the security manager to implement that.

But it's important to note that these are not the intended use cases.
That makes it overly complex to implement them and doesn't justify the security manager's maintenance burden.
Also, with instrumentation and particularly [JFR event streaming][ijp-13], there are already partial alternatives for this.

One of the goals of JEP 411 is to flush out these use cases, so that a potential future JEP may take them as input and work out an API that's tailored towards these narrow use cases, which means it will support them much better than the security manager can and doesn't come with its baggage.

[ijp-13]: https://inside.java/2021/02/22/podcast-013/


## Outro

And that's it for today on the Inside Java Newscast.
If you have any questions about what Jose and I covered in this episode, ask ahead in the comments below and if you enjoy this kind of content, help us spread the word with a like or by sharing this video with your friends and colleagues.
I'll see you again in two weeks.
So long...

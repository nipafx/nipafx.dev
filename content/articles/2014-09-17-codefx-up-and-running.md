---
title: "CodeFX Up And Running"
tags: [meta]
date: 2014-09-17
slug: codefx-up-and-running
description: "Summer recess is officially over and shit got done! Finally, CodeFX is ready to take on the world."
searchKeywords: "CodeFX"
featuredImage: codefx-up-and-running
---

Summer recess is officially over and shit got done!
Finally, **CodeFX** is up and running.

## Up

Besides starting my new day job, I finished some long waiting coding and infrastructure work.

### Code

I cleaned up my *SnapshotView* over at [ControlsFX](http://controlsfx.org) ([which is currently waiting to be pulled](https://bitbucket.org/controlsfx/controlsfx/pull-request/407/major-redesign-of-snapshotview)) and finally got everything working to [release the first production-ready version of LibFX](libfx-0-1-1).

### CodeFX

Maybe even more important in this context is that I finally got this blog ready to go!
I tweaked the theme (and hope everybody reacts to the Eclipse purple I recklessly plagiarized) and got some much needed plugins like the very cool [Crayon](https://wordpress.org/plugins/crayon-syntax-highlighter/) which paints my code like this:

```java
StringProperty currentEmployeesStreetName = Nestings
	.on(currentEmployeeProperty)
	.nest(Employee::addressProperty)
	.nest(Address::streetNameProperty)
	.buildProperty();
```

Foregoing the neither pretty nor overly usable WordPress comments I looked for another way to lure you, the reader, into a conversation.
I would've liked to go for [Discourse](http://www.discourse.org/) but couldn't find a cheap (read: for free) way to run it.
Who knows, if this blog takes off, I might still spend some money.

But for now we're going with [Disqus](https://disqus.com/).
To keep the site loading fast, comments are only loaded on demand (see the button at the end of this post) and in case you already have a Disqus account you can of course use it here as well.

Finally, I'm done fighting with newsletter plugins, be it *Mailpoet*, *Newsletter Ready!* or *Newsletter* (ha, no links for you!).
I'm sticking with the latter and since it does not provide a convenient way to send out complete posts, you won't get them via the newsletter.
So if you want to read without stopping by, you'll have to [subscribe to the RSS-feed](https://nipafx.dev/feed.xml).

<!-- Batman-running.gif -->

## Running

So now that everything's done there are no more excuses.
I'm ready to [achieve ultimate blog success in one easy step](http://blog.codinghorror.com/how-to-achieve-ultimate-blog-success-in-one-easy-step/)!
:)

And look at that, I even have some ideas of (interesting?) things to write about!
Like a tutorial on creating a first open source project - something I recently went through myself.
Or how to create a JavaFX control the way it's supposed to be done...

So I’ll be back and I hope so will you!

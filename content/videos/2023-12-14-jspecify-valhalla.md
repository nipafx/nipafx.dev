---
title: "How Project Valhalla And JSpecify Can Kill NPEs"
tags: [project-valhalla, libraries, conversation]
date: 2023-12-14
slug: jspecify-valhalla
videoSlug: jspecify-valhalla
description: "Project Valhalla's value types need to be aware of which instance can be `null` and which can't, so the JVM can inline them. So will Java get a null-aware type system after all? Not quite, but it may get close and JSpecify can help with some of those steps."
featuredImage: jspecify-valhalla
---

Hey, I'm nipafx, but you can call me Nicolai and today it's gonna be you, me, Kevin Bourrillion, and Project Valhalla, specifically its interest in and intentions for `null`.
As I'll explain in a minute, Valhalla needs to know which value type instances can be null and which can't, so it can inline them.
There have been different ideas for how to do that, but the most recent one proposes to introduce question mark and exclamation mark, or bang, as modifiers for value types.
Then, for example, an `Integer!` could be treated as an `int` and we'd get similarly performant behavior for non-null instances of our own value types.

Now, tracking `null` is also something that IDEs and tools can do for you, but they're not quite aligned on how they do that and there are various discrepancies.
A standard is needed and together with other people, Kevin is working on that in [JSpecify](https://jspecify.dev/).
A few months ago, he presented it [on my Twitch channel](https://twitch.tv/nipafx) and I uploaded most of his presentation earlier this week - give it a watch if you want to know the goal, design, and progress of JSpecify.

In that video, I left out the section of his presentation that revolved around the overlap between JSpecify and Valhalla as well as our conversation about that topic, for example how JSpecify could help with a hypothetical expansion of question mark and bang to reference types.
This video here are those parts stitched together, but I took the freedom to rearrange them for a better structure, so please forgive the occasional dangling pointer to something that's missing or comes later.
So, here it is: Java, null, JSpecifcy, and Project Valhalla.
Enjoy!

* [Intro](https://www.youtube.com/watch?v=Re5HvyUtIJ0&t=0m00s)
* [Valhalla & null](https://www.youtube.com/watch?v=Re5HvyUtIJ0&t=1m28s)
* [JSpecify & Valhalla](https://www.youtube.com/watch?v=Re5HvyUtIJ0&t=9m24s)
* [How JSpecify can help Java](https://www.youtube.com/watch?v=Re5HvyUtIJ0&t=11m34s)
* [Outro](https://www.youtube.com/watch?v=Re5HvyUtIJ0&t=21m25s)

You might have noticed on the screen behind me that I had a second guest on.
That was Manu Sridharan of NullAway fame.
He's one of the other contributors to JSpecify and he had more to say on non-Valhalla topics in the Q&A after Kevin's presentation, where I and the stream audience got to ask all kinds of questions about JSpecify.
I hope to upload that next week, but it's quite a bit of work.
I think a few likes on this video could really motivate me to spend my weekend on that.
So long ...

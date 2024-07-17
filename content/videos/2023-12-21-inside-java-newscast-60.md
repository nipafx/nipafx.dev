---
title: "Java Highlights of 2023 - Inside Java Newscast #60"
tags: [turn-of-the-year, on-ramp, java-8, community, meta]
date: 2023-12-21
slug: inside-java-newscast-60
videoSlug: inside-java-newscast-60
description: "2023 is coming to a close and it was quite a year for Java! Let's look back at some of the highlights: on-ramp improvements, why Java 8 is dying, JVMLS, community achievements, and how cool our YouTube channel is. 😊"
featuredImage: inside-java-newscast-60
---

2023 is coming to a close and it was quite a year for Java!
JDK 21 released to great fanfare, finalizing both virtual threads as well the pattern matching basics.
There were also some amazing conferences, new Java champions, and we achieved some milestones on this channel, too.
Oh, and I'm officially calling it:
2023 was the last year, where it was still reasonable for most projects to be on Java 8.

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and it's time to look at some of Java's highlights in 2023.
Of course, the ecosystem is way too large to cover all that in about 10 minutes, so I'll focus on a few things that I find most noteworthy.
For everything I've left out or missed, I'm relying on you to post your highlights in the comments.
Ready?
Then let's dive right in!


## On-Ramp

Language, APIs, VM, usability, efficiency, performance - Java is improving in many different areas.
One recent addition to the to-do list has been approachability and in 2023 a lot has happened here.
After JShell in 2017 and single-source-file execution in 2018, this past year has built a few new sections of [the on-ramp](https://openjdk.org/projects/amber/design-notes/on-ramp) from early programming to the highway of full-blown Java:

* At the very beginner-end of the on-ramp waits [the loosened launch protocol](https://openjdk.org/jeps/463) that gets away with just the top-level method `void main() { ... }`, which means Java newbies don't have to either ignore or learn about visibility, classes, static, arrays, or parameters.
  Just write a very simple method signature and off you go.
* At the farther end of the on-ramp is the ability to directly launch not just one but now [multiple source files](https://openjdk.org/jeps/458) (even with dependencies) directly, meaning without having to compile them first.
  This means learners, experimenters, and prototypers can stick with just an editor and the Java launcher until they need to build JARs, at which point a build tool is probably still the best option.
* Then we have [the official Oracle VS Code extension for Java](https://marketplace.visualstudio.com/items?itemName=Oracle.oracle-java), which offers quicker adoption of new Java releases, better Gradle integration, and an overall much smoother development experience.
  Meeting developers, especially young ones, where they are is important and for many of them, that is VS Code, so it's good that there's an option that supports all the latest Java features early and reliably.
* Last but not least, there's the Java playground.
  Need to experiment with a new feature, explain a language construct to a beginner, or quickly figure out with a colleague how an API works?
  Just head to [dev.java/playground](https://dev.java/playground), write your code, and get your output - all you need is a browser.

The importance of keeping Java accessible, a good language to learn programming with, is hard to overstate and I'm glad we're seeing progress in this area.
If you want to learn more about this, there are some follow-up links in the description, for example to [my video on simplified `main`](https://www.youtube.com/watch?v=P9JPUbG5npI) and to [Ana's video on the VS Code extension](https://www.youtube.com/watch?v=3NSdlU22C0Q).

<contentvideo slug="inside-java-newscast-49"></contentvideo>


## Java Version Adoption

I talk a lot about new Java features: on this channel, at conferences, in articles, ... really everywhere where people listen and even some places where they don't.
Probably the second most common reply I get is "I'm still on Java 8" - often with gallows humor, sometimes resignated, and occasionally accusatory as if that's somehow my fault.
And the numbers bear that out - not that it's my fault but that Java 8 is still dominant.
All surveys suffer from self-selection bias but as far as I can tell, it's the best data we have, and, for example, [the recent JetBrains ecosystem survey](https://www.jetbrains.com/lp/devecosystem-2023/java/#java_versions) indeed shows that Java 8 is still the most common version, used by half of all developers.
But it's worth looking beyond that and examining the report and those from past years in a bit more detail.

<table>
	<thead>
		<tr>
			<th></th> <th>2018</th> <th>2019</th> <th>2020</th> <th>2021</th> <th>2022</th> <th>2023</th>
		</tr>
	</thead>
	<tbody>
		<tr> <td>Java 6</td> <td>8 %</td> <td>5 %</td> <td>3 %</td> <td>2 %</td> <td>2 %</td> <td>1 %</td> </tr>
		<tr> <td>Java 7</td> <td>33 %</td> <td>13 %</td> <td>7 %</td> <td>6 %</td> <td>3 %</td> <td>2 %</td> </tr>
		<tr> <td>Java 8</td> <td>84 %</td> <td>83 %</td> <td>75 %</td> <td>72 %</td> <td>60 %</td> <td>50 %</td> </tr>
		<tr> <td>Java 9</td> <td>18 %</td> <td>14 %</td> <td>6 %</td> <td>4 %</td> <td>1 %</td> <td>1 %</td> </tr>
		<tr> <td>Java 10</td> <td></td> <td>13 %</td> <td>6 %</td> <td>2 %</td> <td>1 %</td> <td>1 %</td> </tr>
		<tr> <td>Java 11</td> <td></td> <td>22 %</td> <td>32 %</td> <td>42 %</td> <td>48 %</td> <td>38 %</td> </tr>
		<tr> <td>Java 12</td> <td></td> <td></td> <td>10 %</td> <td>4 %</td> <td>2 %</td> <td>2 %</td> </tr>
		<tr> <td>Java 13</td> <td></td> <td></td> <td>14 %</td> <td>4 %</td> <td>2 %</td> <td>2 %</td> </tr>
		<tr> <td>Java 14</td> <td></td> <td></td> <td></td> <td>8 %</td> <td>3 %</td> <td>2 %</td> </tr>
		<tr> <td>Java 15</td> <td></td> <td></td> <td></td> <td>14 %</td> <td>4 %</td> <td>2 %</td> </tr>
		<tr> <td>Java 16</td> <td></td> <td></td> <td></td> <td></td> <td>6 %</td> <td>3 %</td> </tr>
		<tr> <td>Java 17</td> <td></td> <td></td> <td></td> <td></td> <td>30 %</td> <td>45 %</td> </tr>
		<tr> <td>Java 18</td> <td></td> <td></td> <td></td> <td></td> <td></td> <td>8 %</td> </tr>
		<tr> <td>Java 19</td> <td></td> <td></td> <td></td> <td></td> <td></td> <td>8 %</td> </tr>
		<tr> <td>Java 20</td> <td></td> <td></td> <td></td> <td></td> <td></td> <td>11 %</td> </tr>
		<tr> <td>Java 21</td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr>
		<tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr>
		<tr> <td>Total</td> <td>143 %</td> <td>150 %</td> <td>153 %</td> <td>158 %</td> <td>162 %</td> <td>176 %</td> </tr>
	</tbody>
</table>


First, note that the usage percentages sum up to 150-170% as developers could reply with more than one version, which already puts the 50% in perspective.
Then, there's a clear downward trajectory for Java 8:
It has lost 1/6th of its share in each of the last two years.
If it keeps going like this, it will be at 30% in 3 years.

Another reason why 8 is superficially dominant is that there's no clear winner takes all past it.
11 was first covered in the 2019 report, where it already had 22%, which it then grew to 48% last year before dropping in 2023 because people migrated to 17.
That even started with 30% in 2022 and went to 45% this year.
That means newer Java versions seem to get picked up quicker, a trend I'm expecting to hold for 21.
Then there's a consistent 10-15% of developers on the most recent version even if it doesn't get long-term support from anybody, which delights me to see.
On the other hand, the 20-25% on versions that were at that point unsupported are a bit worrying.

<contentimage slug="java-version-adoption-2023"></contentimage>

So if you've been keeping track, while in 2023 Java 8 stood at 50%, newer versions combined where at 120%.
In fact, already the 2021 report shows that versions past 8 are more common than 8 with 78% versus 72%.

As I mentioned at the top, surveys like these are not representative, so I don't care about the specific numbers too much.
But the trends are clear:

* Java 8 user share drops significantly
* newer versions combined see strong adoption and very likely already overtook 8
* the latest version with LTS see great and arguably _increasingly fast_ adoption

And I'm pretty happy with those trends.
I was even foolish enough to extrapolate them into the future.
See the pinned comment for my predictions for the 2024 survey - I'm curious to read yours.

* Java 6: 1% (because, of course)
* Java 7: 1%
* Java 8: 38% (slightly faster reduction due to waning support from libraries and frameworks)
* Java 11: 25% (no good reason to be on 11)
* Java 17: 42% (slightly more moving to 21 than coming from 8 and 11)
* Java 21: 35% (21 in 2024 can do better than 17 in 2022! 😃)
* Java 22: 12%
* $unsupported: 18% (although it should be 0!)

But it's not just that development that tolls the bell for Java 8.
A plethora of open source projects upped their minimum Java version requirement beyond 8, many of them this year.
The few I had on my list were:

* Spring 6 and Spring Boot 3, which require Java 17
* Helidon 4, which requires 21
* Quarkus 3 requires Java 11 and 3.7 will require 21
* Jakarta EE 10 requires Java 11 and JEE 11, scheduled for mid 2024, will require 21

"Surely there are more", I thought, and asked on social media and, damn, did I get a lot of replies!
Thank you all for that.

* with Java 11 requirements we have Wildlfy 30, Microprofile 6, Debezium 2, Caffeine 3, Bootique 3, non-Enterprise jOOQ 3.19, the Selenium Grid, Dropwizard 3, Hazelcast 5.3, Jetty 10, and Apache Tomcat 10.1, Cayenne 5, Kafka 4, Jena 4, Log4J3, and Storm 2.6 - that felt like a countdown
* requiring Java 17 are Jetty 12, Jaybird 6, Netty 5, AssertJ 4, Vaadin 24, Selenide 7, Apache Spark and Camel 4 and OpenNLP 2.3
* Tomcat 11 will target JEE 11 and will thus also require Java 21

With the Java 8 user base dwindling, I only expect this process to accelerate, so if your project is still on 8, not only is it soon becoming a minority, it will also see its dependencies move out from under it, which will only make the eventual update harder.
I really think 2023 was the last year, where it was still reasonable for most projects to be on 8.


## JVMLS is BAck!

So there was no JavaOne this year, which, if I can be frank, sucked.
But [the JVM Language Summit made a return](https://openjdk.org/projects/mlvm/jvmlangsummit/)!
In early August, 100 of the smartest people our community has to offer met in Santa Clara, USA to discuss where Java and the JVM are going in the coming years.
Whether Java on the GPU, start time and header size improvements, code reflection and the class-file API, or behind-the-scenes insights into value types, virtual threads, and the foreign function and memory API - this was a cornucopia of Java insights!
Being much, much, much further down the list of smartest people, I wasn't there but luckily most talks were recorded and published to this channel.
I link [the playlist](https://www.youtube.com/playlist?list=PLX8CzqL3ArzW90jKUCf4H6xCKpStxsOzp) in the description.

But JVMLS was not the only conference with a big year in 2023.
For more on that and other community achievements, let's switch to Shar.


## Community Achievements

The holiday season is upon us as another year comes to a close.
And here on the Java Developer Relations Team, as we continue to deliver a variety of technical and community content out to all of you, we also wanna highlight many of the contributions made throughout the year by the Java community.
So in the holiday spirit, sit back and let us acknowledge some of those important milestones and people.

Boy, what a year 2023 has been for events and conferences!
So many of them celebrated special anniversaries.
First off, I'd like to say Happy 10th birthday to Devoxx UK!
Happy 20th birthday to Devoxx Belgium!
And happy 10th birthday to Devoxx Morocco!
And how can we forget, a happy 20th birthday to JFall!
I'd like to say thank you to all the event organizers, Java User Group leaders, and volunteers that made these experiences so unforgettable!

Second, [the Java Champions program](https://javachampions.org/) continues to flourish.
This year, in 2023, we welcomed 18 new members whose voices add to the harmony of fellow Java Champions.
So to the newest members and to all Java Champions:
Thank you for keeping burning bright the Java light.

Also, the community has participated in many ways and we've tried to acknowledge their experiences and voices through [the Duke's Corner Podcast](https://oraclegroundbreakers.libsyn.com/).
This year, 8 members of the Java community, shared their unique knowledge and experiences to all!
So, have a listen, and hopefully we can record you in a future episode.

And finally, a special thank you to all of the inaugural contributors to dev.java, the official Java portal:
Venkat Subramaniam, Jeanne Boyarsky, Heinz Kabutz, Cay Horstman, Daniel Schmid, and Gail and Paul Anderson.
Thank you for sharing your articles with the Java community.
We're looking for more [contributions from the community](https://dev.java/contribute/devjava/), so please visit us on [our official GitHub page](https://github.com/java/devjava-content), so we can publish your contributions to the entire Java world.

In 2024, we're looking forward to seeing even more Java community participation that we can highlight at year's end.
Until then, my sincerest gratitude to all of you: those of you that have contributed, those of you that continue to learn, those of you that continue to share, and those of you that continue to collaborate.
Thank you for keeping Java vibrant and have a fantastic happy new year!


## Gloating about YouTube

Thanks Shar!

I don't want to bore you with gloating about how cool this channel is but... you know, we spend a lot of time on it, and we can see from your reaction that it's worth it, so I'll do it anyway - gloating, I mean; and maybe boring you, too.
Just gimme two minutes.

This is Inside Java Newscast #60 and it's running in its third year now and roughly tripled its viewership during that time.
We had some bangers this year with "Java 21 is no LTS Version" being my absolute favorite - keep spreading the word!

<contentvideo slug="inside-java-newscast-52"></contentvideo>

While Jose slacked a bit on JEP Cafes, he's been really killing it with his YouTube Short series ["Cracking the Java Coding Interview"](https://www.youtube.com/playlist?list=PLX8CzqL3ArzX0zXLKycnQslZaF6viV0oQ), getting over 850.000 views this year and about as many thankful comments on them.
And Billy keeps digging into JDK internals with both his [Sips](https://www.youtube.com/playlist?list=PLX8CzqL3ArzWkPoqzLemlQ-Nm5wXzRmfE) as well as [the new Stack Walker videos](https://www.youtube.com/playlist?list=PLX8CzqL3ArzVpnvuuVxEtMAazHDLhdrgv) that take a bit more time to dive deeper.
I link [my favorite one](https://www.youtube.com/watch?v=XEKkUpPnf4Q) in the description.

But we're not just all doing our own thing, we also occasionally work together.
Leading up to the JDK 21 release, we published [the RoadTo21 video series](https://www.youtube.com/playlist?list=PLX8CzqL3ArzVHAHWowaXwYFlLk78D8RvL) which was a lot of fun and very well received, so I'm sure we'll repeat that for JDK 25 in 2025.
And in September we had [a big Java 21 launch stream](https://www.youtube.com/watch?v=E8NV68ihJyY), with Ana taking first place for most hours moderated.
We enjoyed that a lot as well and will probably do it again for 22, albeit maybe a bit shorter than 8 hours.

All that was watched for a total of over 130.000 hours and more than 30.000 of you decided it was worth a subscription which brings us within a hair's breadth of surpassing the 150k subscriber threshold.
That's so cool, thank you very much for that.

Instead of asking you to do all the YouTube things today, I want to close with thanking you all very, very much for subscribing, watching, and commenting; but beyond that for being active members of the various online Java communities, be it on Reddit, Twitter, or Mastodon (and Bluesky, we're getting there); or for participating in local Java User Groups, for visiting or speaking at conferences, for maintaining open source projects, and just generally for being members of this amazing community.
I can't describe how proud I am to be a part of it.
Have a great last week of the year and I'll see you again in 2024.
So long...

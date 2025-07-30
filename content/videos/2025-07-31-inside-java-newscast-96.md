---
title: "HTTP/3 in Java - Inside Java Newscast #96"
tags: [core-libs]
date: 2025-07-31
slug: inside-java-newscast-96
videoSlug: inside-java-newscast-96
description: "JEP 517 proposes to update Java's HTTP Client (introduced in Java 11) to be compatible with HTTP/3"
featuredImage: inside-java-newscast-96
---

Yes, you've seen a similar thumbnail just two weeks ago.
Thanks for clicking nonetheless, this is indeed a different video.
We just ran out of ideas and that one seemed to do well.
Could've been worse.

<!-- logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about [JDK Enhancement Proposal 517](https://openjdk.org/jeps/517): HTTP/3 for the HTTP client API that was introduced in Java 11.
We'll also have an AMA (ATAA) soon, where you get to ask your questions and we make the OpenJDK folks answer them, more on that at the end of the video.

Ready?
Then let's dive right in.

## HTTP/3

In 2022, [HTTP/3](https://en.wikipedia.org/wiki/HTTP/3) was standardized and it is intended to be a successor to HTTP/2.
But instead of TCP, it uses the UDP-based [QUIC](https://en.wikipedia.org/wiki/QUIC) as transport-layer protocol, which, together with other changes, promises lower latency, less network congestion, and more reliable transport.

<contentimage slug="http-stack"></contentimage>

HTTP/3 is supported by [every modern browser](https://caniuse.com/http3) and deployed to a little over [one third of all websites](https://w3techs.com/technologies/details/ce-http3).
So high time that Java gets on board, which is what JEP 517 intends to do.
It is not currently targeted to any release, but I would be surprised if we didn't see it in Java in 2026.

At its heart, this change is very simple:
The HTTP client will be updated to allow it to send and receive HTTP/3 requests and responses.
The central API change is super small, just the new value `HTTP_3` for the enum `HttpClient.Version`.
You pass the value to the builder method `version` when building an HTTP client or request, which you then use as you normally would.

```java
var client = HttpClient
	.newBuilder()
	.version(HttpClient.Version.HTTP_3)
	.build();

var request = HttpRequest
	.newBuilder(
		URI.create("https://openjdk.org/"))
	.version(HttpClient.Version.HTTP_3)
	.GET().build();

var response = client
	.send(request, BodyHandlers.ofString());
```

Almost everything else happens beneath the surface.
What is a bit tricky is how the API determines what HTTP version ends up being used, so lets look at that next.

## Negotiating the HTTP Version

The thing is that HTTP/1.1 and 2 use the same transport-layer protocol (TCP) and so a connection can be initiated and then upgraded.
But since HTTP/3 ultimately uses UDP, you cannot upgrade a TCP-based connection to it.
And because you don't generally know for any given server, what HTTP version it supports, you may have to make multiple requests to figure things out and there are different strategies you can employ:

(To save ourselves some time and sanity, I will only mention HTTP/2 and implicitly include 1.1 in that.)

* You can start with an HTTP/2 request and if the response indicates that HTTP/3 is available, you switch to that.
* Or you can start with an HTTP/3 request and, if you don't receive a response in time, repeat it with HTTP/2.
* Or, if you don't receive a response in time, you fail.
* And finally, you can send the first request twice with HTTP/2 and 3 and then reply with the version that got the first response.

Luckily _you_ don't need to do any of that.
Java's HTTP client can do this for you and you can select any of these four strategies with the right combination of arguments to the aforementioned `version` methods as well as to the new `setOption` method on the client builder.
I will spare you the exact details of what does what because, let's face it, by the time this feature shows up in a GA release, let alone in our code bases, we'll all have forgotten these details two times over.
The JEP has you covered.

## Potential Improvements

Instead, I want to briefly cover a few things that JEP 517 doesn't do:

* make HTTP/3 the default - HTTP/2 will remain the preferred version
* add configuration options to the HTTP client and request builders to control discovery of the target server
* add configuration and tuning options for the HTTP/3 implementation
* add new exceptions for HTTP/3-specific errors
* provide an API for QUIC
* provide a server-side implementation of HTTP/3

Some of that is probably going to get worked on in the future - for now, it's important to get HTTP/3 out the door.
And that's all on that topic, now let's talk about ATAA.

## Ask The Architects Anything

ATAA of course stands for Ask The Architects Anything and, no, you can't just say it like a normal person - it has to be ATAA.
Anyway, next week is the JVM Language Summit and after hitchhiking across the United States all the way from Kansas, Billy will be there to ask the OpenJDK folks _your_ questions.
Brian Goetz will be there, and John Rose.
Dan Heidinga, Joe Darcy, Paul Sandoz, and many, many more.
So whatever question you have on your mind, Billy will find an expert to answer it.

I will pin a comment about that below the video - please reply with your questions there, so I can collect them.
Also, if you're curious about other people's questions and the architects' answers, go watch any of these videos from previous ATAAs.

* [Ask the Java Architects @ Devoxx BE 2024](https://www.youtube.com/watch?v=SPc9YpLsYo8)
* [Brian Goetz Answers Your Java Questions](https://www.youtube.com/watch?v=mE4iTvxLTC4)
* [Java Architects Answer Your Questions](https://www.youtube.com/watch?v=WoQJnnMIlFY)

Beneficial side effect:
You won't ask a question that was already answered, because I will ruthlessly cull those.
Billy will see you in two weeks and then we have something special for you in late August.
So long...

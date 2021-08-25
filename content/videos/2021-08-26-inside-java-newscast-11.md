---
title: "Fast and Secure Inter-process Communication on JDK 16 - Inside Java Newscast #11"
tags: [java-16]
date: 2021-08-26
slug: inside-java-newscast-11
videoSlug: inside-java-newscast-11
description: "JDK 16's socket channel / server-socket channel API can use Unix domain sockets for faster and more secure inter-process communication on the same host - also: JDK 17 final release candidate and Oracle Developer Live"
featuredImage: inside-java-newscast-11
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle and today we're gonna talk about faster and more secure inter-process communication with JDK 16's Unix domain sockets (even on Windows).

Just one topic?
I knew it, Jose spoiled you!
I asked him to hold back, but oh no, he decided to totally upstage me and come out with four topics.
Remember that one time, when I was proud I had three?
Four!
That man, unbelievable.
So to compensate, we're gonna have just one topic today.

Ready?
Then let's dive right in!

## Unix Domain Sockets

_[... snip this part - [my code-first Unix domain socket tutorials](java-unix-domain-sockets) goes a but further with more examples ...]_

<!--

Java's socket channel API provides blocking and multiplexed non-blocking access to sockets, which you can use to communicate between two services.
This used to be limited to TCP/IP sockets, but since Java 16 it's also possible to access Unix domain sockets.
(No, not like that.)
Unix domain sockets are addressed by filesystem path names, which comes with a few advantages and a considerable limitation - more on that later.
They are supported on Unix based operating system (like Linux and MacOS) and - despite their name - since Windows 10 and Windows Server 2019.

Let's have a look!

### Connecting Client and Server

As mentioned, Unix domain sockets are based on path names, so the first thing we need is a `Path` instance.
Twice actually, once on the server once on the client, both pointing to the same name.
We we can then use the path to create instances of `UnixDomainSocketAddress`.

The next step is to prepare a `ServerSocketChannel` on that address.
For that we call the static factory method `open` with the new enum value `StandardProtocolFamily.UNIX`.
Then we can bind the server channel to the address and start accepting incoming connections.

On the client, we need a `SocketChannel` (note, not `ServerSocketChannel`, just `SocketChannel`).
It also has a static factory method `open` that we pass the same `UNIX` protocol enum to.
Then we connect it to the address.

```java
// server and client
var socketFile = Path
	.of(System.getProperty("user.home"))
	.resolve("server.socket");
var address = UnixDomainSocketAddress
	.of(socketFile);

// server
var server = ServerSocketChannel
	.open(StandardProtocolFamily.UNIX);
server.bind(address);
SocketChannel channel = server.accept();

// client
var client = SocketChannel
	.open(StandardProtocolFamily.UNIX);
client.connect(address);
```

The two classes `SocketChannel` and `ServerSocketChannel` have existed since Java 4 and what kind of socket they use to connect makes no difference in how messages are passed between them and so message passing across Unix domain sockets works the same as with TCP/IP.
That means it's a bunch of low-level input/output stream or even byte buffer fiddling that I'm gonna spare you here.

### Versus TCP/IP

Compared to TCP/IP connections, Unix domain sockets have the considerable limitation that they only work on the same host because client and server need access to the same file system path.
Note that this does not prevent communication between containers on the same system as long as you create the sockets on a shared volume.

If you are on the same host, though, you get a number of advantages over TCP/IP loopback:

1. Because Unix domain sockets can only be accessed from the same system, opening them instead of a TCP/IP socket has no risk of accepting remote connections.
2. Access control is applied with file-based mechanisms, which are detailed, well understood, and enforced by the operating system.
3. Unix domain sockets have faster setup times and higher data throughput than TCP/IP loopback connections.

So if you're doing inter-process communication on the same host, maybe between Java code and some native app, I highly recommend to check out Unix domain sockets for more throughput and security.
-->


## Shots

I got two shorter pieces of news for you:

1. JDK 17's first release candidate that Jose talked about in the last Newscast didn't need any changes and so it's now the final release candidate.
   That means unless it's a hair-on-fire emergency, there will be zero changes between now and September 14th.
2. Oracle Developer Live will take place on September 14th for the Americas and September 16th for the rest of the world.
   It's a free online event all around Java innovations - if you're interested, I'll leave a link in the description.

https://developer.oracle.com/developer-live/java-innovations-sep-2021/


## Outro

And that's it for today on the Inside Java Newscast.
If you have any questions about Unix domain sockets, ask ahead in the comments below and if you enjoy this kind of content, help us spread the word with a like or by sharing this video with your friends and colleagues.
I'll see you again in two weeks.
So long...

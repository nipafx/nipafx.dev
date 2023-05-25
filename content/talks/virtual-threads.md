---
title: "Scaling Simply with Virtual Threads"
tags: [project-loom, java-21]
date: 2023-05-24
slug: talk-virtual-threads
description: "How a community of Java enthusiasts drives innovation for 15 years, turning ideas into designs into code into features you can use in your IDE"
featuredImage: virtual-threads-loom
slides: https://slides.nipafx.dev/virtual-threads
---

When every request coming into a system runs in its own thread but keeps blocking it for outgoing requests to the file system, databases, or other services, the number of threads the system supports quickly becomes the limiting factor for scaling up throughput.
Reactive programming solves this problem by only occupying platform threads when they are actually needed, thus offering better scalability, but comes at a cost: developing, maintaining, debugging, observing, and benchmarking code becomes more challenging.

Virtual threads combine the simplicity of blocking code with the resource efficiency and scalability of reactive programming and in this talk you're going to learn how they do that and how you can use them in your project.

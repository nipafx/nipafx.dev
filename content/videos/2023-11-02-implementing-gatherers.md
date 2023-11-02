---
title: "Implementing New Java Stream Operations"
tags: [streams]
date: 2023-11-02
slug: implementing-gatherers
videoSlug: implementing-gatherers
description: "Implementing a bunch of `Gatherer`s to better understand the proposed addition to the stream API"
featuredImage: implementing-gatherers
---

[JEP 461](https://openjdk.org/jeps/461) proposes `Stream::gather` and `Gatherer` - a new intermediate meta-operation that can be used to implement all kinds of specific operations, from existing ones like `map` and `sorted` to new ones like `flatMapIf` and `increasingSequence`.
Once you grokked [the theory](inside-java-newscast-57), it's time to put it into practice to implement more operations:

* [doNothing](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=0m22s)
* [map](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=2m15s)
* [filter](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=3m03s)
* [flatMapIf](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=3m57s)
* [takeWhileIncluding](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=5m59s)
* [limit](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=10m30s)
* [increasing](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=14m23s)
* [runningAverage](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=17m06s)
* [fixedGroups](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=19m35s)
* [slidingWindow](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=23m57s)
* [sorted](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=27m06s)
* [increasingSequences](https://www.youtube.com/watch?v=pNQ5OXMXDbY&t=30m59s)

---
title: "JDK 24 Deprecates Remote Debugging with `jstat` And `jhsdb` For Removal"
tags: [java-24, migration]
date: 2025-01-31
slug: remote-jstat-jhsdb-deprecation
description: "Due to their reliance on RMI, which the JDK is moving away from, the remote debugging capabilities of `jstat` and `jhsdb` are deprecated for removal"
canonicalUrl: https://inside.java/2025/01/31/quality-heads-up/
featuredImage: remote-jstat-jhsdb-deprecation
---

## Moving Away From RMI

Java's Remote Method Interface (RMI) was introduced in 1997 to allow transparent [remote procedure calls](https://en.wikipedia.org/wiki/Remote_procedure_call) from one Java Virtual Machine to another.
It uses serialization to encode objects as bytes when transporting them as arguments and return values between JVMs.
Both technologies have long-term security concerns and configuration difficulties and did not stand the test of time.
Today, the wider ecosystem has replaced RMI with more web friendly protocols and so Java itself is also reducing and removing dependencies on it where possible.


## Local Measurements and Debugging

Among other tools, Java offers these two to connect to a local HotSpot JVM and observe or debug it as well as the program it executes:

* [`jstat`](https://docs.oracle.com/en/java/javase/23/docs/specs/man/jstat.html) reads performance counters
* [`jhsdb`](https://docs.oracle.com/en/java/javase/23/docs/specs/man/jhsdb.html) provides snapshot debugging and analysis features

Both tools' capabilities for local use remain in place and there are no plans to change that.


## Remote Use Deprecated for Removal

Both `jstat` and `jhsdb` offer remote capabilities, which are implemented using RMI.
Due to the aforementioned effort to reduce dependencies on RMI, `jstat`'s and `jhsdb`'s remote capabilities are deprecated for removal:

* `jstatd` (allows remote connections with `jstat`) - [JDK-8327793](https://bugs.openjdk.org/browse/JDK-8327793)
* `jhsdb debugd` (allows remote connections with `jhsdb`) as well as the `--connect` option of the `jhsdb` subcommands `hsdb` and `clhsdb` - [JDK-8338894](https://bugs.openjdk.org/browse/JDK-8338894)

Questions or feedback on these deprecations can be directed at [the serviceability-dev mailing list](https://mail.openjdk.org/mailman/listinfo/serviceability-dev).


## Alternatives

An alternative tool for getting remote insights into a running HotSpot JVM is [the JDK Flight Recorder (JFR)](https://docs.oracle.com/en/java/javase/23/docs/specs/man/jfr.html).

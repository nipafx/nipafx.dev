---
title: "JDK 23 Changes Default Annotation Processing Policy"
tags: [java-23, core-lang, migration]
date: 2024-06-18
slug: annotation-processing-off
description: "Starting with JDK 23, annotation processors in the class path will no longer be executed without further javac configuration"
canonicalUrl: https://inside.java/2024/06/18/quality-heads-up/
featuredImage: annotation-processing-off
inlineCodeLanguage: none
---

Annotation processing is a compile-time feature, where javac scans the to-be-compiled source files for annotations and then the class path for matching annotation processors, so they can generate source code.
Up to JDK 22, this feature is enabled by default, which may have been reasonable when it was introduced in JDK 6 circa 2006, but from a current perspective, in the interest of making build output more robust against annotation processors being placed on the class path unintentionally, this is much less reasonable.
Hence, starting with JDK 23, javac requires an additional command-line option to enable annotation processing.


## New `-proc` Value

To that end, the pre-existing option `-proc:$policy` was extended, where `$policy` can now have the following values:

* `none`: compilation _without_ annotation processing - this policy exists since JDK 6
* `only`: annotation processing _without_ compilation - this policy exists since JDK 6
* `full`: annotation processing followed by compilation - this policy is the default in JDK ≤22, but the value itself is new (see next section for versions that support it)

Up to and including JDK 22, code bases that require annotation processing before compilation could rely on javac's default behavior to process annotations but that is no longer the case.
Starting with JDK 23, at least one annotation-processing command line option needs to be present.
If neither `-processor`, `--processor-path`, nor `--processor-module-path` is used, `-proc:only` or `-proc:full` has to be provided.
In other words, absent other command line options, `-proc:none` is the default on JDK 23.


## Migration to `-proc:full`

Several measures were undertaken to help projects prepare for the switch to `-proc:full`:

* As of the April 2024 JDK security updates, support for `-proc:full` has been backported to 17u (17.0.11) and 11u (11.0.23) for both Oracle JDK and OpenJDK distributions.
  Additionally, Oracle's 8u release (8u411) also supports `-proc:full`.
* Starting in JDK 21, javac prints an informative message if implicit usage of annotation processing under the default policy is detected.

With `-proc:full` backported, it is possible to configure a build that will work the same before and after the change in javac's default policy.


## More Details

This is a summary, for more details make sure to read the [original proposal](https://mail.openjdk.org/pipermail/jdk-dev/2024-May/009028.html).

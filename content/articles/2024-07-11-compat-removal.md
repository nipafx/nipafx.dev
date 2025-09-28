---
title: "JDK 23 Removes COMPAT Locale Provider"
tags: [java-23, migration]
date: 2024-07-11
slug: compat-removal
description: "With the removal of the JDK's own (somewhat outdated) locale data, all projects must now use the CLDR data or other implement a custom locale data provider"
canonicalUrl: https://inside.java/2024/07/11/quality-heads-up/
featuredImage: compat-removal
inlineCodeLanguage: none
---

## A Quick History of Locale Data in the JDK

Before the Unicode Consortium created the Common Locale Data Repository (CLDR) in 2003 to manage locale data, the JDK had to provide its own collection.
It did so successfully and in JDK 8 supported about 160 locales.
To reduce maintenance effort, allow better interoperability between platforms, and improve locale data quality, the JDK started to move towards CLDR in 2014:

* JDK 8 comes with two locale data providers, which can be selected with the system property `java.locale.providers`:
	* `JRE`/`COMPAT` for the JDK's legacy data collection (default)
	* `CLDR` for the CLDR data
	* a custom locale provider can be implemented
* JDK 9 picks CLDR by default
* JDK 21 issues a warning on `JRE`/`COMPAT`

There are plenty of minor and a few notable differences between the legacy data and CLDR - the recently rewritten [JEP 252](https://openjdk.org/jeps/252) lists a few of them.


## Locale Data in JDK 23

JDK 23 [removes legacy locale data](https://bugs.openjdk.org/browse/JDK-8325568).
As a consequence, setting `java.locale.providers` to `JRE` or `COMPAT` has no effect.

Projects that are still using legacy locale data are _highly encouraged_ to switch to CLDR as soon as possible.
Where that is infeasible, two alternatives remain:

* Create custom formatters with patterns that mimic the legacy behavior and use them everywhere where locale-sensitive data is written or parsed.
* Implement [a custom locale data provider](https://docs.oracle.com/en/java/javase/22/docs/api/java.base/java/util/spi/LocaleServiceProvider.html).

For more details on that as well as on CLDR in the JDK in general, please check [JEP 252](https://openjdk.org/jeps/252).
It has been recently rewritten to provide better information and guidance.

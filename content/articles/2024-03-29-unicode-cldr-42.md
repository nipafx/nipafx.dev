---
title: "JDK 20-23: Support For Unicode CLDR Version 42"
tags: [java-23, java-20, migration]
date: 2024-03-29
slug: unicode-cldr-42
description: "Java 20 updates its locale data to Unicode CLDR version 42, which comes with formatting and parsing changes, particularly of dates and times"
canonicalUrl: https://inside.java/2024/03/29/quality-heads-up/
featuredImage: unicode-cldr-42
---

## JDK 20 - Support for Unicode CLDR Version 42

The JDK's locale data is based on the Unicode Consortium's Unicode Common Locale Data Repository (CLDR).
As mentioned in the [December 2022 Quality Outreach newsletter](https://mail.openjdk.org/pipermail/quality-discuss/2022-December/001100.html), JDK 20 upgraded CLDR to [version 42](https://cldr.unicode.org/index/downloads/cldr-42), which was released in October 2022.
This version includes a ["more sophisticated handling of spaces"](https://unicode-org.atlassian.net/browse/CLDR-14032) that replaces regular spaces with non-breaking spaces (NBSP / `\u00A0`) or narrow non-breaking spaces (NNBSP / `\u202F`):

* in time formats between `a` and time
* in unit formats between {0} and unit
* in Cyrillic date formats before year marker such as `г`

Other noticeable changes include:

* [" at " is no longer used for standard date/time format](https://unicode-org.atlassian.net/browse/CLDR-14831)
* [fix first day of week info for China (CN)](https://unicode-org.atlassian.net/browse/CLDR-11510)
* [Japanese: Support numbers up to 9999京](https://unicode-org.atlassian.net/browse/CLDR-15966)

As a consequence, production and test code that produces or parses locale-dependent strings like formatted dates and times may change behavior in potentially breaking ways (e.g. when a handcrafted datetime string with a regular space is parsed, but the parser now expects an NBSP or NNBSP).
Issues can be hard to analyze because expected and actual strings look very similar or even identical in various text representations.
To detect and fix these issues, make sure to use a text editor that displays different kinds of spaces differently.

If the required fixes can't be implemented when upgrading to JDK 20, consider using the JVM argument `-Djava.locale.providers=COMPAT` to use legacy locale data.
Note that this limits some locale-related functionality and treat it as a temporary workaround, not a proper solution.
Moreover, the `COMPAT` option will be eventually removed in the future.

It is also important to keep in mind that this kind of locale data evolves regularly so programs parsing/composing the locale data by themselves should be routinely checked with each JDK release.

For more details, please check [JDK-8284840](https://bugs.openjdk.org/browse/JDK-8284840).


## JDK 23 Update - Loose Matching of Space Separators

From JDK 23 onwards, parsing of date/time strings allows _loose matching_ of spaces.
This enhancement is mainly to address the issue described above.
Loose matching is performed in the _lenient_ parsing style for both date/time parsers in `java.time.format` and `java.text` packages.
In the default _strict_ parsing style, those spaces are considered distinct as before.

To utilize loose matching in the `java.time.format` package, applications will need to explicitly set the leniency by calling `DateTimeFormatterBuilder.parseLenient()`:

```java
var dtf = new DateTimeFormatterBuilder()
	.parseLenient()
	.append(DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT))
	.toFormatter(Locale.ENGLISH);
```

In the `java.text` package, the default parsing mode is lenient and applications will be able to parse all space separators automatically (i.e. the default behavior changes with this feature). In case they need to strictly parse the text, they can do:

```java
var df = DateFormat.getTimeInstance(DateFormat.SHORT, Locale.ENGLISH);
df.setLenient(false);
```

For more details, please check [JDK-8324665](https://bugs.openjdk.org/browse/JDK-8324665).

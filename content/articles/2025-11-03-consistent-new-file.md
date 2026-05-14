---
title: "Consistent Behavior of `new File(\"\")`"
tags: [java-25, core-libs, migration]
date: 2025-11-03
slug: consistent-new-file
description: "Prior to this change, a `new File(\"\")` behaved differently, depending on whether it was queried as a relative or absolute file"
canonicalUrl: https://inside.java/2025/11/03/quality-heads-up/
featuredImage: consistent-new-file
---

## Inconsistencies of 'new File("")'

On JDK 24 and earlier, the behavior of a `File` instance created from the empty string was inconsistent.
Queried for information, it appeared to be non-existent:

```java
var file = new File("");
// print "false" on JDK 24
IO.println(file.exists());
IO.println(file.isDirectory());
```

Similarly, methods like `canRead` returned `false` and `length`, `lastModified`, etc. returned `0`.

When transformed to an instance representing the absolute path, the behavior changed, though:

```java
var file = new File("").getAbsoluteFile();
// print "true"
IO.println(file.exists());
IO.println(file.isDirectory());
```

The reason is that `new File("").getAbsoluteFile()` maps to the current user directory and the `File` API behaves accordingly.
Since `new File("")` and `new File("").getAbsoluteFile()` should represent the same file system entry, this inconsistency is jarring and can be surprising.

The newer API in `java.nio.file` avoids this issue and treats both `Path.of("")` and `Path.of("").toAbsolutePath()` as the current user directory.
For example:

```java
var path = Path.of("");
// print "true"
IO.println(Files.exists(path));
IO.println(Files.isDirectory(path));

path = path.toAbsolutePath();
// print "true"
IO.println(Files.exists(path));
IO.println(Files.isDirectory(path));
```

## Change in JDK 25

JDK 25 fixed this long-standing inconsistency and `new File("")` now properly represents the current user directory:

```java
var file = new File("");
// print "true" on JDK 25
IO.println(file.exists());
IO.println(file.isDirectory());
```

The [Javadoc for `File`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/File.html) was updated to spell out the intended behavior:

> Accessing a file with the empty abstract pathname is equivalent to accessing the current user directory.

For more details, check [JDK-8024695](https://bugs.openjdk.org/browse/JDK-8024695).

## Migration

Code that relies on the old behavior is often found in unit tests (e.g. to intentionally create non-existent files with `new File("")`) or where user input is mapped to file system entries (e.g. to treat "no user entry" and "invalid user entry" the same: as an absent file).
Here it may show itself through misbehavior around file-related arguments or configuration.

While fixing such code should be straightforward, identifying it may not be - a thorough test suite helps.
For dependencies and tools, the recommendation is to rely on their tests and statements regarding JDK 25 compatibility.
Only they can fix potential issues as there is no way to restore the inconsistent behavior of JDK 24 and earlier.

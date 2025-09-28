---
title: "JDK 24 Prepares Restricted Native Access"
tags: [java-24, project-panama, migration]
date: 2024-12-09
slug: jni-restriction
description: "JEP 472 prepares restricted access to native code through JNI and the FFM API"
canonicalUrl: https://inside.java/2024/12/09/quality-heads-up/
featuredImage: jni-restriction
inlineCodeLanguage: none
---

## Native Access and Integrity by Default

Any interaction between Java code and native code, be it via the Java Native Interface (JNI) or the Foreign Function & Memory API (FFM), is risky in the sense that it can compromise the integrity of applications and of the Java Platform itself, for example by causing JVM crashes, even after the native code completed execution.
According to the policy of [integrity by default][ibd], all JDK features that are capable of breaking integrity must obtain explicit approval from the application's developer.
JDK 24, by means of [JEP 472], prepares that by aligning the behavior of JNI and FFM by:

* printing warnings for all restricted operations (with the goal to turn these into exceptions in a future release)
* expanding the command-line options `--enable-native-access` and `--illegal-native-access` to govern restricted operations of both APIs

Note that the intent is neither to discourage the use of, deprecate, or even remove JNI nor to restrict the behavior of native code called via JNI or FFM.
The goal is to ensure that applications and the Java Platform have integrity by default while giving application operators the tools they need to selectively opt-out where needed.

## Restricted Operations

These JNI operations are considered _restricted_:

* calls to `System::loadLibrary`, `System::load`, `Runtime::loadLibrary`, and `Runtime::load`
* declaration of a native method

These FFM operations are considered _restricted_:

* `AddressLayout::withTargetLayout`
* `Linker::downcallHandle`
* `Linker::upcallStub`
* `MemorySegment::reinterpret`
* `ModuleLayer.Controller::enableNativeAccess`
* `SymbolLookup::libraryLookup`

The documentation contains an [always up-to-date list of all restricted methods][restricted-method-list].

## Enabling/Disabling Restricted Operations

Executing restricted operations will, by default, cause output like the following on the standard error stream:

```
WARNING: A restricted method in java.lang.System has been called
WARNING: System::load has been called by com.foo.Server in module com.foo (file:/path/to/com.foo.jar)
WARNING: Use --enable-native-access=com.foo to avoid a warning for callers in this module
WARNING: Restricted methods will be blocked in a future release unless native access is enabled
```

Note that this is a change for JNI, which used to not trigger such warnings, as well as for FFM, which used to forbid restricted operations by default.
Starting with JDK 24, both APIs behave uniformly by printing warnings - in the future, both will throw exceptions instead.
You can configure this behavior with the two command line options `--enable-native-access` and `--illegal-native-access`.

The option `--enable-native-access=$value` enables access to all restricted operations for either the entire class path (if `$value` is `ALL-UNNAMED`) or the listed modules (if `$value` is similar to `com.mod1,com.mod2`).
This is the intended and long-term supported way to enable access to restricted native operations.

If native access is not enabled via that option, it is illegal for code to perform restricted operations.
The new option `--illegal-native-access=$value` determines how the Java runtime handles such cases, depending on `$value`:

* `allow`: allows the operation
* `warn`: issues warnings as described above (this is the default in JDK 24)
* `deny`: throws an `IllegalCallerException`

In a future release, `deny` will become the default and `allow` will be removed.
Similar to `--illegal-access`, which was introduced in JDK 9, setting this option to values below the default (e.g. to `allow` on JDK 24) should be considered a short-term fix until the correct use of `--enable-native-access` is established.
Also similar to `--illegal-access`, `--illegal-native-access` can be used to prepare a project for a future, stricter Java release.

The recommended way to run applications that use JNI or FFM on JDK 24 is:

```
java --enable-native-access=$value --illegal-native-access=deny ...
```

Here, `$value` is ideally a list of names of modules that access restricted operations, otherwise `ALL-UNNAMED` if such code resides on the class path.

## More

To help identify libraries that use JNI, [a new JDK tool, tentatively named `jnativescan`][jnativescan], statically scans code in a provided module path or class path and reports uses of restricted methods and declarations of native methods.
If you want to track (un)loading of native libraries, observe the JDK Flight Recorder events `jdk.NativeLibraryLoad` and `jdk.NativeLibraryUnload`.

For more details, please read [JEP 472] and check [JDK-8324665].

[ibd]: https://openjdk.org/jeps/8305968
[JEP 472]: https://openjdk.org/jeps/472
[restricted-method-list]: https://docs.oracle.com/en/java/javase/24/docs/api/restricted-list.html
[JDK-8324665]: https://bugs.openjdk.org/browse/JDK-8324665
[jnativescan]: https://docs.oracle.com/en/java/javase/24/docs/specs/man/jnativescan.html

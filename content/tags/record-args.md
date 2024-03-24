---
title: "Record Args"
slug: record-args
tags: [records, java-21]
date: 2024-03-25
description: "A simple command-line argument parser for Java applications that relies on records and sealed interfaces"
inlineCodeLanguage: none
---

Using [RecordArgs](https://github.com/nipafx/record-args/) is a simple two-step process:

* create a record that captures your application's configuration:

```java
record ServerArgs(String url, int port) { }
```

* let `Args` parse the `args` string array to an instance of it:

```java
// launch command: "java [...] --url localhost --port 8080"
public static void main(String[] args) throws ArgsParseException {
	ServerArgs serverArgs = Args.parse(args, ServerArgs.class);
}
```

RecordArgs uses records' component names to identify command line arguments, their canonical constructors to create instances, and their immutability to let you freely pass them around without fear of unwanted changes.
It uses `Optional` for optionality and sealed interfaces to model mutually exclusive sets of arguments, so-called "modes" or "actions".

## Getting Started

RecordArgs is available on Maven Central:

* group ID: `dev.nipafx.args`
* artifact ID: `record-args`

For documentation on arguments (e.g. their names and types), args records, advanced features, and error handling, check out the README [on GitHub](https://github.com/nipafx/record-args/).

<!--
## Posts

Here are some posts that highlight different aspects of RecordArgs:

<postlist kind="tag"></postlist>
-->

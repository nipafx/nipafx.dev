---
title: "Analysing Crashed JVMs - Inside Java Newscast #109"
tags: [java-next]
date: 2026-04-02
slug: inside-java-newscast-109
videoSlug: inside-java-newscast-109
description: "The Java tool jcmd (\"j command\") sends diagnostic commands to the JVM, which, at the moment, requires a running JVM, but once candidate JEP 528 is adopted, a lot of the information can be seamlessly extracted from a crashed JVM's core dump, allowing easy post-mortem analysis"
featuredImage: inside-java-newscast-109
---

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're going to talk about a clever little addition to jcmd that will considerably broaden your debugging tooklit.
Ready?
Then let's dive right in!

## A `jcmd` Primer

I just checked and there are about 30 binaries in my JDK 26 install, so I'm not assuming that you know all of them - I surely don't.
One that I barely use is jcmd but that's just because I don't debug production applications anymore.
If you do, [jcmd is super helpful](https://docs.oracle.com/en/java/javase/26/docs/specs/man/jcmd.html) and you should look into it.
With it, you can send diagnostic commands to a running JVM and get it to divulge all kinds of behind-the-schenes information, for example:

* to see the GC's finalizer queue, which is very handy in preparation for finalization's removal

```sh
$ jcmd $pid GC.finalizer_info
# > No instances waiting for finalization found
```

* to create heap and thread dumps; the latter are great to explore the thread relationships established through structured concurrency

```sh
$ jcmd $pid Thread.dump_to_file -format=json threads.json
# check threads.json for thread relationships
```

* speaking of virtual threads, you can see what their scheduler is up to

```sh
$ jcmd $pid Thread.vthread_scheduler
# > java.util.concurrent.ForkJoinPool@1b9180c2[Running,
#     parallelism = 16, size = 4, active = 1, running = 0,
#     steals = 5, tasks = 0, submissions = 0, delayed = 1]
```

* you also use jcmd to configure, start, and stop the JDK Flight Recorder

```sh
$ jcmd $pid JFR.start
# > Started recording 1. No limit specified,
#    using maxsize=250MB as default.
# > Use jcmd 14384 JFR.dump name=1 filename=FILEPATH 
#     to copy recording data to file.
```

* and there's much, much more from basically all moving parts in the JVM

All in all, jcmd is a really useful tool and I recommend you check it out if you haven't already.
Or subscribe to this channel, I'll try to get Billy to do a Stack Walker episode on it.

## Reviving A Dead JVM's Brain

So let's talk about [JDK Enhancement Proposal 528](https://openjdk.org/jeps/528), which is a candidate but currently not targeted to any release.
It may make it into JDK 27, but, as always, we need to let the process play out and see what happens.

JEP 528 describes how everyting I just said is fine and dandy but only works with a running JVM.
And yet, you're very likely to need that information just after a JVM crashed.
And by that I don't mean an application crash due to an uncaught exception or out-of-memory error but a proper JVM crash ("proper fucked"), probably because somebody didn't use JNI correctly or found out where `Unsafe` got its name from.
If the JVM crashes, all you're likely left with is a core dump and while you can extract _some_ information from that with tools like jhsdb, it's too bad that you can't use all of jcmd's power.

"Ha", says JEP 528, "but what if you could"?
Let's recreate the JVM's memory image and execute native code in the JVM binary to interpret the data structures in that image.
This enables jcmd's diagnostic commands to work exactly as they do in a live JVM, with no changes to the commands or their implementations, but some limitations that I'll get to in a second.

```sh
$ java # [... some JVM crashing app ...]
# [... JVM crash info ...] 
# Core dump will be written. Default location: /cores/core.$pid
# [... more JVM crash info ...] 
$ jcmd /cores/core.$pid Thread.print
# > /cores/core.$pid:
# > 2026-03-31 11:27:55
# > [... JDK version info ....]
# > 
# > Threads class SMR info:
# > _java_thread_list=0x0000ffff0c004410, length=17, elements={
# > 0x0000ffff9002a6d0, 0x0000ffff900c4b60, 0x0000ffff900c6380, 0x0000ffff900c7d10,
# > 0x0000ffff900c9520, 0x0000ffff900cad20, 0x0000ffff900cce40, 0x0000ffff900ce7c0,
# > 0x0000ffff9013bf50, 0x0000ffff90148830, 0x0000ffff381e94b0, 0x0000ffff9046a460,
# > 0x0000ffff904c4200, 0x0000ffff904c5880, 0x0000ffff08004250, 0x0000ffff08009380,
# > 0x0000ffff0c0021a0
# > }
# > 
# > "main" #3 [13] prio=5 os_prio=0 cpu=-0.00ms elapsed=18446744073709552.00s
#     tid=0x0000ffff9002a6d0 nid=13 waiting on condition  [0x0000ffff9660d000]
# > [... way more thread info ...]
```

The JEP phrases this as "reviving" the JVM but I don't think that's a good metaphor because the JVM doesn't really come back to life and, for example, can absolutely not execute any Java code.
It's more like briefly reanimating a corpse's brain to access its last memory, meaning this capability is strictly limited to post-mortem analysis of crashed JVMs.

## Example & Limitations

When experimenting with this, I created a little example that uses structured concurrency, so we can see something interesting in the core dump, and Unsafe to crash the JVM by accessing an illegal memory location.

```java
void main() throws Exception {
	try (var scope = StructuredTaskScope.open()) {
		scope.fork(asCallable(() -> Thread.sleep(1_000));
		scope.fork(() -> {
			var startTime = System.currentTimeMillis();
			var currentTime = System.currentTimeMillis();
			while (currentTime - startTime < 1_000)
				currentTime = System.currentTimeMillis();
		});
		scope.fork(asCallable(() -> crashJvm());

		scope.join();		
	}
}

void crashJvm() throws ReflectiveOperationException {
	var unsafeField = Unsafe.class.getDeclaredField("theUnsafe");
	unsafeField.setAccessible(true);
	Unsafe unsafe = (Unsafe) unsafeField.get(null);
	unsafe.putInt(0, 42);
}
```

That immediately confronted me with some limitations of this new capability:

1. The machine on which the post-mortem analysis is done must have the same operating system and CPU architecture as the system where the JVM crashed.
2. Since nobody runs macOS in production, this feature is currently limited to Linux and Windows, which was an issue for me because I only have my fruity work laptop with me.
   Thanks, Ana, for running the experiments on your machine.
3. I couldn't actually execute `jcmd Thread.dump_to_file`, which shows structured concurrency relationships in its JSON output, because that specific diagnostic command is written in Java and since this JVM is but a muttering corpse, it can't execute that.

Very few jcmd commands are written in Java, though, so the vast majority that make sense to execute after a crash are available.
There are 26 of those and the JEP lists them all:

```
Compiler.CodeHeap_Analytics
Compiler.codecache
Compiler.codelist
Compiler.directives_print
Compiler.memory		
Compiler.perfmap	
Compiler.queue		
					
GC.class_histogram	
GC.heap_dump		
GC.heap_info		
					
JVMTI.data_dump		
					
Thread.print	

VM.class_hierarchy
VM.classes
VM.classloader_stats
VM.classloaders
VM.command_line
VM.events
VM.flags
VM.metaspace
VM.native_memory
VM.stringtable
VM.symboltable
VM.systemdictionary
VM.version
					
help				
```

In my case, I resorted to `Thread.print`.

One limitation that one might expect but jcmd successfully avoids is JDK version lock-in.
The crashed JDK and the anylsing JDK can be of arbitrary versions as long as they both include JEP 528.
If it indeed gets integrated in 27, that means you could, for example, analyze a crashed JDK 27 with jcmd from a JDK 28 and vice versa.

If you don't want to miss the JEP's integration or when some of its limitations get lifted in future releases - it hints at that in its _Future Work_ section - subscribe to this channel.
And if you like the feature, Java, or my hiking escapades, give this video a like.
I'll see you again in two weeks - so long...

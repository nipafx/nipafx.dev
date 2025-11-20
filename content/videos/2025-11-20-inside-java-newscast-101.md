---
title: "Java 26 Warns of Deep Reflection - Inside Java Newscast #101"
tags: [java-26]
date: 2025-11-20
slug: inside-java-newscast-101
videoSlug: inside-java-newscast-101
description: "Java 26 will issue run-time warnings when a final field is mutated through reflection. This prepares a future change that will make such final field mutation illegal by default to improve Java's integrity."
featuredImage: inside-java-newscast-101
---

There's a big change beginning in Java 26 that you'll have to react to in all likelihood:
No more reflective mutation of final fields!
Finally!

And, yes, lame jokes involving the word "final" are par for the course here.
Nothing I can do about that, I don't make the rules.
But I *will* enforce them in the comments, so you better...

<!-- logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna talk about how Java 26 will take the first step towards disallowing reflection from mutating final fields.
This change may require you to add a command-line flag or two, update the odd dependency, or, in the long run, maybe even migrate away from one.
We'll start with _what_ you need to do before looking at the bigger picture and a bit of history on deep reflection.
Ready?
Then let's dive right in!


## Final Field Mutation

As you know, the language does not allow mutating final fields - they must be assigned exactly once during construction and that's it.

```java
void main() throws Exception {
	var box = new Box("element");
	// compile error:
	//  "cannot assign a value to final variable value"
	box.element = "new element";
}

class Box {

	final String element;

	Box(String element) {
		// assignment is enforced
		// (in declaration, initializer, or constructor)
		this.element = element;
	}

	public String toString() {
		return "[" + element + "]";
	}

}
```

Then you can rely on the invariants you established for correctness and for security and the just-in-time compiler can aggressively optimize through those immutable fields for performance.
Is what you'd think.
But, alas, reflection can still change that field.
After fetching it and a swift call to `setAccessible(true)`, calling `set` _will_ mutate the presumably immutable field.

```java
void main() throws Exception {
	var box = new Box("element");
	// prints "[element]"
	IO.println(box);

	var elementField = Box.class.getDeclaredField("element");
	elementField.setAccessible(true);
	elementField.set(box, "new element");

	// prints "[new element]"
	IO.println(box);
}
```

At least in Java, the question what happens when an unstoppable force hits an immovable object has a clear answer but for reasons already alluded to and explored in more depth later, it's fair to say that it's the wrong one.
And [JDK Enhancement Proposal 500](https://openjdk.org/jeps/500), which is already integrated into JDK 26, sets out on a path that changes that.

Let's start with a look at what lies at the end of that path:
Without further command-line options, a `final` field will be truly final.
Neither use of the language nor of any API nor even JNI will be able to mutate it after construction.
Ideally, no code will want to, either, and all libraries and frameworks that do that today have moved to different approaches, which are outlined or at least linked in the JEP.
Nonetheless, if code insists on changing such fields, there are two steps you, as the application developer, have to take.

Step 1 is to ensure that the field is not encapsulated from the reflecting code.
If the field is on the class path, part of its module's public API, or field and reflecting code are both in the same module, then that's already the case.
But if the field is not public API and in a module other than the reflecting code, you need to open the former to the latter with the command-line option `--add-opens`.
Either path allows the `setAccessible` call to go through and thus the mutation of non-final fields through reflection.
This has been required since modules were introduced in Java 9, so it's not exactly new.

What's new is step 2:
Allow the reflecting code to change final fields.
You do this by adding the command-line option `--enable-final-field-mutation` with either `ALL-UNNAMED` if the reflecting code is on the class path or otherwise with its module name.
Note that you can only refer to modules in the boot module layer - it's not possible to enable final field mutation for code in user-defined layers.

So, taken together, to reflectively mutate a private final field in a module, you need to `--add-opens` (to ignore `private`) and to `--enable-final-field-mutation` (to ignore `final`).
You're most likely to pass these as command-line options but

* you can also add them to the environment variable `JDK_JAVA_OPTIONS`
* you can put them into an argument file that you reference with `@`
* for executable JARs, you can add it to the manifest
* or you can configure your custom runtime via `jlink`'s `--add-options` flag

Once the next JDK 26 early access build ships, you will be able to use `--enable-final-field-mutation` and set everything up for the glorious future, where `final` means final - at least by default.
So that's the destination - now let's have a look at the path that takes us there.


## Migration Path

As with prior developments where Java changed its stance, or at least its default position, `final` being truly final will be introduced gradually with help of a temporary command line option just like `--illegal-access` for strong encapsulation and `--illegal-native-access` for restricted JNI or FFM operations.
This new option allows you to forego changing your code, fiddling with your dependencies, or working out the exact modules that reflect over final fields and give blanket permissions - or blanket vetos actually, as we'll see.
It's called `--illegal-final-field-mutation` and has four well-known values:

The first one is `allow` and makes final field mutation "just work".
Although the reflecting code still needs access to the field, which may require an `--add-opens` as explained earlier.

The second value, and the default on JDK 26, is `warn`, which will do just that.
Final field mutation will succeed with one warning per reflecting module getting printed to the error stream.
The warning will identify the field that is being reflected over and the method that is doing it.

```
WARNING: Final field $field in $class_1 has been mutated by class $class_2 in module $module
WARNING: Use --enable-final-field-mutation=$module to avoid a warning
WARNING: Mutating final fields will be blocked in a future release unless final field mutation is enabled
```

The third value is `debug`, which also allows the mutation and prints the same message as `warn` plus a stack trace and for every illegal mutation, not just the first one from any given module.
As an aside, if you want maximal visibility into final field mutation, you can also enable the JDK Flight Recorder and observe the event `jdk.FinalFieldMutation`.

Finally, we have `deny`, which leads to exceptions.
The JEP as well yours truly recommends this from day one because it forces you to look into all offenders and to prepare for the value to become the inevitable default of this option.

The funny thing about the permanent option `--enable-final-field-mutation` and the temporary option `--illegal-final-field-mutation` is that while the latter offers blanket access and thus seems to promise fewer hassles in the short term, you may also only need one `--enable-final-field-mutation`.
Because if the reflecting code, even if spread across many JARs, is all on the class path, `--enable-final-field-mutation=ALL-UNNAMED` is all you need to enable all of it - so you might as well not bother with the temporary `--illegal-final-field-mutation`.

And before you get giddy that not adopting modules saved you work, it'll also save you from much of the benefits of making final fields final because now you're telling the runtime to make an exception for the entire class path, which apparently includes your application and all dependencies.
So, joke's on you - no extra performance for you!


## Odds & Ends

Before we get to performance and other benefits in a second, I want to briefly touch on a few points:

If the code calling `setAccessible` and the code doing the actual mutation through `set` are not in the same module, the situation becomes a bit more complex but the JEP has you covered - see the section [_The deep reflection API_](https://openjdk.org/jeps/500#The-deep-reflection-API).

```java
// module A makes field accessible
var field = Box.class
	.getDeclaredField("element");
field.setAccessible(true);

// module B sets a new value
field.set("new element");
```

If you use reflective final field mutation in a `clone` implementation along an inheritance hierarchy, then be warned that this case gets no exception.
You either need to enable final field mutation on the command line or, and this is the preferable option, solve the problem some other way, either by implementing `clone` with constructor calls or by outright replacing it with static factory methods.

```java
class Box implements Cloneable {

	final String element;

	Box(String element) {
		this.element = element;
	}

	// `clone` that makes changes through reflection
	public Box clone() throws CloneNotSupportedException {
		var clone = (Box) super.clone();
		try {
			// try to make field value lower-case
			var elField = Box.class.getDeclaredField("element");
			elField.setAccessible(true);
			elField
				.set(clone, element.toLowerCase());
		} catch (ReflectiveOperationException _)  {
			// ignore error
		}
		return clone;
	}

	// alternative `clone` that goes through the constructor
	public Box clone() {
		return new Box(element.toLowerCase());
	}

}

```

Then, if you use reflective final field mutation for deserialization, check out the JEP's section on `ReflectionFactory`.
This API allows you to execute an object's deserialization protocol so you don't need to assign the field after the fact and need no extra command-line flags.

And lastly, if you're the developer of a library that uses deep reflection to mutate potentially final fields, you should really try to move away from that.
There are a few paths that you can take that are outlined in the JEP draft for integrity by default - there's a link to that section in the video description right under the like button.
Although, maybe more important to you specifically, the dislike button is also right there.
If none of those approaches work for you, reflection remains the last resort, but it requires your users to enable final field mutation and you to convince them that it's worth the trade-off.

So let's talk about the benefits of `final` finally meaning final.


## Integrity By Default

If you've been following Java's development closely or just listened carefully to what I said so far, you probably already know where all this coming from - or rather where it's leading: integrity by default.
In this case the integrity of `final` as a keyword.
It promises immutability after the initial assignment and yet there's an API that undermines that very guarantee, so if push comes to shove, nobody can actually rely on final fields not getting reassigned.

* Not you when something quirky is going on and you're trying to understand a program's data flow.
* Not the forensics expert who has to figure out how the attacker made the program misbehave.
* And not the just-in-time compiler who desperately wants to constant-fold across final fields, among other optimizations.

So not being able to rely on finality has material downsides, which is why final fields of [hidden classes](https://openjdk.org/jeps/371) and of [records](https://openjdk.org/jeps/395), introduced in Java 15 and 16, respectively, could never be changed through reflection.
And with integrity by default for `final`, the same will be true for regular classes' fields.
Unless certain command-line options are used, like in this case `--enable-final-field-mutation`, we can rely on Java's promises, which improves maintainability, compatibility, security, and performance.

Of course this begs the question why exceptions like the one for final field mutation were made in the first place and I don't think there's a aingle answer to that.
From what I gathered from all that was written about strong encapsulation, unsafe memory access, finality, etc. I got the impression that there are a few things at play.

* Most obviously, there was often a feature in development that seemed to demand an exception from the rule and that was important enough to make one.
  And who else could be at fault in the case of final field mutation than our old nemesis serialization, whose protocol basically demands assigning to an empty object's final fields, and so JDK 5 changed the reflection API to allow just that.
* I think another factor is that OpenJDK did not always have the opportunity to research alternative approaches.
  After all, it takes resources and persistence to hold back a feature that is already functioning to keep working on it to prevent downstream issues.
  In this case it took until Java 7 before method handles were introduced, which underpin the possibility to execute a class' deserialization protocol, so the fields don't have to be assigned after the fact.
* Finally, I believe the understanding that these exceptions not only have individual downsides but coalesce into a larger problem that is worth addressing in a principled manner has formed somewhat recently - I suspect in the aftermath of modules taking the first principled step to improve integrity, even though it wasn't yet called that back then.

All in all, I think it's to Java's immense credit that the ecosystem recognizes these issues and takes careful steps to rectify them.
In this case, by making you avoid or otherwise green-light the mutation of final fields through reflection.

And that's it for today on the Inside Java Newscast.
Have a great time, I'll see you again in two weeks.
So long...

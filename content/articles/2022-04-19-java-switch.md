---
title: "How To Use `switch` In Modern Java"
tags: [switch, pattern-matching]
date: 2022-04-19
slug: java-switch
description: "Since Java 14 introduced switch expressions, using `switch` isn't as straight-forward as it used to be: colons or arrows, statement or expression, labels or patterns? Here's how to best use `switch` in modern Java."
featuredImage: java-switch
---

When it comes to using `switch` past Java 14, there are three decisions to be made:

* colons ("classic") or arrows (since Java 14)
* statement ("classic") or expression (since Java 14)
* labels ("classic") or patterns (3rd preview in Java 19)

<pullquote>These are completely orthogonal</pullquote>

This leaves us with a whopping eight possible combinations!
Fortunately for us, these three decisions are completely orthogonal (meaning neither impacts any other), so we can examine each in isolation.
So let's do that and find out how to best use `switch` in modern Java!

<admonition type="note">

If you're looking for one particular decision, note that there's a table of contents that lets you skip ahead in the box on the left.

</admonition>

## Colon vs Arrow

### Colon and `break`

The "classic" version uses a colon after the case label (or pattern) and requires a `return` or `break` to prevent falling through into the next case:

```java
// with colon and break
switch (number) {
	case 1:
		callMethod("one");
		break;
	case 2:
		callMethod("two");
		break;
	default:
		callMethod("many");
		break;
}
```

Preventing all fall-through with `break`s is the common case, but there are situations where it is intended.
Fall-through is often used to list several cases with empty branches, so they fall through into the one with statements (and usually a `break`), thus applying the same behavior to all cases:

```java
// with colon and break
switch (number) {
	case 1:
	case 2:
		callMethod("few");
		break;
	default:
		callMethod("many");
		break;
}
```

Non-trivial fall-through from a branch with statements into one with even more is sometimes the best solution but it's also easy to get wrong, miss, or misunderstand.
Having the less common case opt-out (not opt-in) makes it error prone to the point where linters usually issue a warning on non-trivial fall-through (i.e. after a non-empty branch) and some action (like adding a comment) is required to silence it.
Then, the common case is verbose because of the `break` and the rare case even more so because of the comment.

<pullquote>Fall-through as default didn't stand the test of time</pullquote>

In my opinion, fall-through is one of those cases where Java's default didn't stand the test of time.

### Arrow

Since Java 14, `switch` allows using the lambda arrow to "map" from case to code:

```java
switch (number) {
	case 1 -> callMethod("one");
	case 2 -> callMethod("two");
	default -> callMethod("many");
}
```

It doesn't fall through - not only _not by default_ but _not at all_, which is superb.
And it comes with two bonuses:

* It's common to write lambdas on a single line and so it's common to have case and branch on a single line, too.
  (Nothing stopped us from doing the same in the colon form, of course, we just usually didn't.)
* To have multiple statements in a branch, you need to create a block with `{ }`, which immediately gives you a new scope for local variables, so you can easily reuse variable names in different branches.

	```java
	// This is not how you'd write
	// this code in real life, but
	// it demonstrates that the
	// name `str` can be reused.
	switch (number) {
		case 1 -> {
			var str = "one";
			callMethod(str);
		}
		case 2 -> {
			var str = "two";
			callMethod(str);
		}
		default -> {
			var str = "many";
			callMethod(str);
		}
	}
	```

  (Again, we could've done the same with colons, but we rarely did.)

### Colon vs Arrow

To me, this decision is super easy:
Arrow form all day, every day.

<pullquote>Arrow form all day, every day</pullquote>

That is, unless I can't avoid fall-through, which I try because it's harder to understand.
Fortunately, the ability to list multiple case labels ([see below](#labels)) eliminates a big use case for it.

That leaves non-trivial fall-through as the only reason I see to use the "classic" form and I hope that spotting colons in `switch` will become a strong indicator that there's fall-through ahead, which would alert us to pay extra attention to this more complicated construct.

<admonition type="note">

From here on out, I'll only use arrows but all examples also work with `:` and `break`.

</admonition>


## Statement vs Expression

### Switch Statement

This is the "classic" form:
The value of the switch variable determines the branch, which then gets executed.
The end.

```java
switch (number) {
	case 1 -> callMethod("one");
	case 2 -> callMethod("two");
	default -> callMethod("many");
}
```

### Switch Expression

Using `switch` as an expression works the same way, but the story doesn't end after the execution.
Instead, the switch as a whole takes on the value of the computation, which can then be assigned to a variable (or passed as an argument, but that's horribly unreadable):

```java
var string = switch (number) {
	case 1 -> "one";
	case 2 -> "two";
	default -> "many";
};
callMethod(string);
```

#### Exhaustiveness

By definition, an expression has a value and so a switch expression must always compute to one.
Consequently there must be a branch for each possible value of the switch variable - this is called _exhaustiveness_.

<pullquote>A switch expression must cover all possible values. This is called _exhaustiveness_.</pullquote>

In the example above, without the default branch, `string` would be undefined if `number` were neither `1` nor `2`, which would make the switch non-exhaustive.
The compiler catches that and throws an error.

But exhaustiveness checks don't end there!
While a default branch will always make a switch exhaustive, it isn't required - if the cases cover all possible values, e.g. of an enum, that suffices:

```java
enum Count { ONE, TWO, MANY }

Count count = // ...
var string = switch (count) {
	case ONE -> "one";
	case TWO -> "two";
	case MANY -> "many";
	// no default branch needed
};
```

Without a default branch, new `Count` values (say `THREE` is added), lead to compile errors, which will make us consider how to handle that new case.
With a default branch, on the other hand, new cases are (silently) caught and processed by it.
Java's `switch` allows us to pick the behavior that best fits each given situation.

(NB: Check [the section on patterns](#exhaustiveness-1) for more on exhaustiveness.)

### Statement vs Expression

Some problems can only be solved reasonably with a switch statement.
For example, when each case requires calling different methods that have no return values (or they're not needed):

```java
switch (number) {
	case 1 -> callOne();
	case 2 -> callTwo();
	default -> callMany();
}
```

For other problems, switch expressions are clearly the better fit.
For example, when a value needs to be "translated" to a different value:

```java
var string = switch (number) {
	case 1 -> "one";
	case 2 -> "two";
	default -> "many";
};
```

But there'll be a lot of cases, where it's not clear cut and both approaches work reasonably well.
This will often be the case when a value needs to be translated and then passed to a method (or methods) that's the same in each branch:

```java
// translate `number`, then `callMethod` with it

// as switch statement
switch (number) {
	case 1 -> callMethod("one");
	case 2 -> callMethod("two");
	default -> callMethod("many");
}

// as switch expression
var string = switch (number) {
	case 1 -> "one";
	case 2 -> "two";
	default -> "many";
};
callMethod(string);
```

This is probably a matter of personal taste, but I lean towards using expressions in these scenarios for a few minor reasons.
In order or decreasing importance:

<pullquote>When statement _and_ expression work, I lean towards expression</pullquote>

* the expression is checked for exhaustiveness
* the "translate, then call" logic is more directly mirrored on the code, making it a bit easier to spot
* it introduces an additional variable that I can give a name (hopefully a better one than `string` 😬), which helps readability

Regarding exhaustiveness, I tend to avoid default branches whenever possible, preferring to get compile errors when things change.

My recommendation when getting to know switch expressions is to frequently implement both variants (it usually only takes a few minutes) and compare them side by side to figure out which one works better in that scenario and why.
Such comparisons make great topics for pair programming, code reviews, at the water cooler, and every other bikeshed-adjacent location.
In my experience, intuition for what to do when builds after a few weeks of consistent use and reflection.


## Labels vs Patterns

### Labels

Not much to say about classic case labels except that you can now have many of them after one `case`:

```java
var string = switch (number) {
	case 1, 2 -> "few";
	default -> "many";
};
```

Super handy to replace trivial fall-through.

### Patterns

The details of [pattern matching](java-pattern-matching) in `switch` are still in flux (there'll be [a third preview](https://openjdk.java.net/jeps/8282272) in Java 19), so this section is somewhat speculative, but there are three aspects that are particularly interesting for this conversation.

#### Exhaustiveness

Earlier, I motivated the need for switch expressions to be exhaustive with the fact that an expression has to have a value.
But while classic switch statements don't _have_ to be exhaustive, it's surely helpful if they are because then new cases don't accidentally result in no behavior.
And "_all switches must be exhaustive_" is a simpler model than "_all switch_ expressions _must be exhaustive_".

To be able to get there in the future, it's helpful not to take one more step into the wrong direction in the present and so pattern switches will likely have to be exhaustive - even if used in a statement.
That would leave us with "_all switches must be exhaustive, except statements with labels_" - not very intuitive, but hopefully temporary.

<pullquote>Pattern switches (even as statements) must be exhaustive</pullquote>

```java
Object obj = // ...
switch (obj) {
	case String str -> callMethod(str);
	// even though this is a statement, it will
	// probably have to be exhaustive, in which
	// case this default branch (or a total
	// pattern) would be needed
	default -> { }
}
```

#### Type Patterns

At the time of writing, Java only supports [type patterns](java-type-pattern-matching), with deconstruction patterns for records proposed by [JEP 405](https://openjdk.java.net/jeps/405).
They can already be used in `if`-statements but soon also in `switch`, which begs the question when to use what.

```java
Object obj = // ...

// works since Java 16
if (obj instanceof String str)
	callStringMethod(str);
else if (obj instanceof Number no)
	callNumberMethod(no);
else
	callObjectMethod(obj);

// works (as preview) in JDK 17+
switch (obj) {
	case String str -> callStringMethod(str);
	case Number no -> callNumberMethod(no);
	default -> callObjectMethod(obj);
}
```

I think the switch comes out ahead:

* it more clearly expresses the intend to execute exactly one branch based on `obj`'s properties
* the compiler checks exhaustiveness
* if a value needs to be computed (not the case here), use as an expression is more succinct

This is a categorically new aspect in our deliberations.
So far we've discussed what kind of switch to use in "switchy" situations but haven't considered that more situations may become "switchy" - this scenario changes that.
It suggests that there are situations where `switch` can (should?) replace `if`-`else`-`if` chains.
Let's see another, less immediate example.

<pullquote>There are situations where `switch` can replace `if`</pullquote>

#### When Clauses

When clauses ([formerly](https://openjdk.java.net/jeps/420) _guarded patterns_) refine a pattern with additional boolean checks.
While this is currently not being proposed, there has been talk on the mailing list (couldn't find the link 😔) about one day allowing conditions without the preceding pattern.
It could work like this (syntax made up by me):

```java
String str = // ...
String length = switch (str) {
	case str.length() > 42 -> "long";
	case str.length() > 19 -> "medium";
	case str.length() > 1 -> "small";
	case null || str.length() == 0 -> "empty";
};
```

Again, this could be an `if`-`else`-`if` chain instead, but again I think the switch comes out ahead (for the same reasons as above).

With `switch` becoming more powerful, my guess is that it will start to eat into the use cases for longer `if`-`else`-`if` chains.
And it makes sense because that's the core tenet of `switch`:

> Here's a bunch of possibilities for this value - pick one and compute.

It communicates that much more clearly than an `if`-`else`-`if` chain and so I hope to some day see it being used in all such situations.

### Labels vs Patterns

After that excursion into `switch` vs `if`, let's get back to when to use what form of `switch`.
Now: labels vs patterns.
The answer to that is super simple, though, as it is fully determined by what you want to check for the switch variable.

<pullquote>Labels vs patterns is fully determined by what you want to check</pullquote>

Need to compare to specific values?
Use labels.

```java
// works in Java 14+
String str = // ...
var number = switch (str) {
	case "one" -> 1;
	case "two" -> 2;
	case "one MILLION" -> 1_000_000;
	default -> 0;
};

```

Need to check structural properties?
Use patterns.

```java
// not even proposed and syntax made up by me;
// I picked this very hypothetical example
// because it also switches on a string
String str = // ...
String length = switch (str) {
	case str.length() > 42 -> "long";
	case str.length() > 19 -> "medium";
	case str.length() > 1 -> "small";
	case null || str.length() == 0 -> "empty";
};
```


## Reflection

How to best use `switch`:

<dl>
	<dt>Colons or arrows:</dt>
	<dd>Always arrows (to avoid dealing with fall-through), except when non-trivial fall-through is needed.</dd>
	<dt>Statement or expression:</dt>
	<dd>Often dictated by the problem, but where both work, lean towards expression (to benefit from exhaustiveness checks and to make code clearer by surfacing the logical flow). Initially, consider implementing both variants to build an understanding of the trade-offs.</dd>
	<dt>Labels or patterns:</dt>
	<dd>Dictated by the problem, but keep in mind that patterns (particularly "pure" when clauses if they ever come) may make <code class="language-java"><span class="token keyword">switch</span></code> preferable to <code class="language-java"><span class="token keyword">if</span></code>.</dd>
</dl>

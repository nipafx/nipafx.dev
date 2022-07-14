---
title: "Data-Oriented Programming - Inside Java Newscast #29"
tags: [records, sealed, pattern-matching, patterns, techniques]
date: 2022-07-14
slug: inside-java-newscast-29
videoSlug: inside-java-newscast-29
description: "Data-oriented programming focuses on modeling data as data (instead of as objects). Records for data and sealed types for alternatives let us model immutable data where illegal states are unrepresentable. Combined with pattern matching we get a safe, powerful, and maintainable approach to ad-hoc polymorphism that lets us define operations on the data without overloading it with functionality."
featuredImage: inside-java-newscast-29
---

## Intro

Welcome everyone, to the Inside Java Newscast where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java developer advocate at Oracle, and today we're gonna learn about data-oriented programming.
Well, I learned about it a few days ago in Brian Goetz's  article ["Data Oriented Programming in Java"][goetz-dop] and now I want to share that with you.
In fact, Brian put most things so well, that I'll often just say his words out loud.

So let's see what DOP is all about, how it uses new language features like records and pattern matching to shape our code, and how it relates to OOP, object-oriented programming, that is.
I'll start at the deep end and come to the motivation later so hold your "But Objects" comments until the end.
Ok?
Then let's dive right in!

[goetz-dop]: https://www.infoq.com/articles/data-oriented-programming-java/

## Data-Oriented Programming

Data-oriented programming is a relatively new term and, by the way, totally unrelated to data-oriented design, so keep those two apart.
It encourages us to model data as immutable data, separating it from the domain logic that acts on it.
It hinges on sealed types and records, the combination of which is called algebraic data types (ADT for short), to express data and pattern matching to add behavior to it.

Brian formulates four principles:

1. **Model the data, the whole data, and nothing but the data.**
   Records should model data.
   Make each record model one thing, make it clear what each record models, and choose clear names for its components.
   Where there are choices to be modeled, such as "a search can result in no match, an exact match, or a few fuzzy matches", model these as sealed classes, and model each alternative with a record.
   Behavior in record classes should be limited to implementing derived quantities from the data itself, such as formatting.
2. **Data is immutable.**
   If we want to model data, we should not have to worry about our data changing out from under us.
   Records give us some help here, as they are shallowly immutable, but it still requires some discipline to avoid letting mutability inject itself into our data models.
3. **Validate at the boundary.**
   Before injecting data into our system, we should ensure that it is valid.
   This might be done in the record constructor (if the validation applies universally to all instances), or by the code at the boundary that has received data from another source.
4. **Make illegal states unrepresentable.**
   Records and sealed types make it easy to model our domains in such a way that erroneous states simply cannot be represented.
   Just as immutability eliminates many common sources of errors in programs, so does avoiding modeling techniques that allow us to model invalid data.

So that's Brian's four principles for data-oriented programming in Java.
Let's put these into practice!

### In Practice I

Let's start with something simple.
Say you have a method that returns a result, say a `User`, but sometimes there isn't one - what should be the return type?
Of course it could just be `User` and we return `null` to signal absence, but that's error-prone and frustrating.

```java
public User findUser(String id) {
	// ...
}

// elsewhere
var user = findUser(id);
if (user != null) {
	// process `user`
}
```

Alternatively, we could create a wrapper type that contains the user if there is one.
That wrapper would need to expose a method to get the potential user and a boolean flag to check its presence first.
Maybe you've seen a type like that.
It would work ok-ish but the requirement to first check presence and then get isn't enforced by the API and could, potentially, lead to people just calling `get` and then getting hit by exceptions.
Maybe you've seen that happen, too.

```java
class Optional<T> {

	private final T value;

	public Optional(T value) {
		this.value = value;
	}

	public T get() {
		if (value == null)
			throw new RuntimeException();
		else
			return value;
	}

	public boolean isPresent() {
		return value != null;
	}

}

public Optional<User> findUser(String id) {
	// ...
}

// elsewhere
var user = findUser(id);
if (user.isPresent()) {
	// process `user.get()`
}
// oopsie
user.get()
```

Let's try something else.
Brian said we should use sealed types to express alternatives, so we make `Optional` a sealed interface with two implementations:

* `None` - a record without components
* `Some` - a record with the present value as its only component

```java
sealed interface Optional<T> { /* no `get()` */ }
record None<T>() implements Optional<T> { }
record Some<T>(T value) implements Optional<T> {
	// constructor needs to null-check `value`
}

public Optional<User> findUser(String id) { /* ... */ }

// elsewhere
var user = findUser(id);
user.get(); // compile error - no method `Optional::get`
if (user instanceof Some(User u)) // only this works
	// use `u`
```

Note that `Optional` no longer offers a method to get a value that I can call without checking for presence first.
Now, to get access to the value, I have to do a type check and unlike the check for presence I can't forget that.
So the API contract "check presence then get" was lifted into the type system by expressing the two alternatives of "value" and "no value" as types instead of a boolean flag.
Too bad that we can't get _this_ `Optional`, but since we can also mostly avoid `isPresent`-then-`get` with `Optional`'s functional API, which is why I like it so much, I will cope.

### In Practice II

We can apply that same pattern to a more complex example.
Say we have an API that looks some entities up by a property, say users by name, and distinguishes between "no match found", "exact match found", and "no exact match, but there were close matches."
In the interest of time, I'm glossing over the step where I try to cram these alternatives into a single type.
You can see it here and it works but it's not pretty.

```java
class MatchResult<T> {

	private final MatchResultType type;
	private final T match;
	private final List<FuzzyMatch<T>> matches;

	// private constructor and factory
	// methods for the three result types

	// accessors that throw exception
	// when no such result
}

enum MatchResultType { NONE, ONE, FUZZY }
record FuzzyMatch<T>( value, int rank) { }


MatchResult<User> findUser(String name) {
	// ...
}


// elsewhere
var r = findUser(name);
// be careful not to just call `r.match()` or
// `r.matches()` without checking `r.type()`!
switch (r.type()) {
	case NONE -> processNoMatch();
	case ONE -> processMatch(r.match());
	case FUZZY -> processMatches(r.matches());
}
```

The better solution is to once again create a sealed interface, `MatchResult`, with an implementation for each case, `NoMatch`, `ExactMatch` and `FuzzyMatch`.
If we encountered this return hierarchy while browsing the code or the Javadoc, it's immediately obvious what this method might return and how to handle its result.
While such a clear encoding of the return value is good for the readability of the API and for its ease of use, such encodings are also often easier to write because the code virtually writes itself from the requirements.

```java
sealed interface MatchResult<T> { }
record NoMatch<T>() implements MatchResult<T> { }
record ExactMatch<T>(T match) implements MatchResult<T> { }
record FuzzyMatches<T>(List<FuzzyMatch<T>> matches)
	implements MatchResult<T> { }
record FuzzyMatch<T>(T value, int rank) { }


MatchResult<User> findUser(String name) {
	// ...
}


// elsewhere
var r = findUser(name);
// no way to accidentally call `r.match()` or
// `r.matches()` - there are no such methods!

// also, we don't even need `r`:
switch (findUser(name)) {
	case NoMatch() -> processNoMatch();
	case ExactMatch(var user) ->
		processMatch(user);
	case FuzzyMatches(var matches) ->
		processMatches(matches);
}
```

### In Practice III

For the last example, let's model something that's more akin to an application-specific domain: an arithmetic expression with variables.
Such expressions are best modeled as trees where each inner node is an operation, like addition or multiplication, and the leaves are numbers or variables.

```java
x² + 2x

   +
 ┌─┴─┐
exp  *
┌┴┐ ┌┴┐
x 2 2 x
```

Even without sealed types and records, we'd probably all model that as an interface `Node` with specific implementations for each operation and value.

```java
interface Node { }

class AddNode implements Node {
	// with fields `Node left`, `Node right`
}
class MulNode implements Node {
	// with fields `Node left`, `Node right`
}
class ExpNode implements Node {
	// with fields `Node node`, `int exp`
}
class NegNode implements Node  {
	// with field `Node node`
}

class ConstNode(double val) implements Node {
	// with field `double val`
}
class VarNode(String name) implements Node {
	// with field `String name`
}

// x² + 2x
var expr = new AddNode(    //       +
	new ExpNode(           //   exp─┤
		new VarNode("x"),  // x ─┤  │
		new ConstNode(2)), // 2 ─┘  │
	new MulNode(           //    * ─┘
		new ConstNode(2),  // 2 ─┤
		new VarNode("x"))  // x ─┘
);
```

Now say you want to evaluate such an expression.
It stands to reason that an `evaluate` method on `Node` would be a good way to do that.
But maybe we also want to evaluate subexpressions in parallel, on the same machine or maybe in a small cluster - are that two more methods?
We also want to differentiate.
And format.
And estimate computation time and resource use.
Bill users for their computations that they run on our engine.
That's a lot of very diverse functionality to add to our nice little `Node` interface.

```java
// 🤔
interface Node {
	double evaluate();
	double evaluateParallel();
	double evaluateInCluster();
	Node differentiate(String var)
    void draw(Direction d, Style s, Canvas c);
    Resources estimateResourceUsage();
    Invoice createInvoice(User u);
}
```

But thanks to the power of algebraic data types and pattern matching we don't have to do that.
Make `Node` sealed, turn the implementations into records and use pattern matching in methods outside of these types to add functionality.
Here are a few of those that I mentioned earlier.

```java
sealed interface Node { }

record AddNode(Node left, Node right) implements Node { }
record MulNode(Node left, Node right) implements Node { }
record ExpNode(Node node, int exp) implements Node { }
record NegNode(Node node) implements Node { }

record ConstNode(double val) implements Node { }
record VarNode(String name) implements Node { }


// operations
double evaluate(Node n, Function<String, Double> vars) {
    return switch (n) {
        case AddNode(var left, var right) ->
			evaluate(left, vars) + evaluate(right, vars);
        case MulNode(var left, var right) ->
			evaluate(left, vars) * evaluate(right, vars);
        case ExpNode(var node, int exp) ->
			Math.exp(evaluate(node, vars), exp);
        case NegNode(var node) ->
			-evaluate(node, vars);
        case ConstNode(double val) -> val;
        case VarNode(String name) -> vars.apply(name);
    }
}

Node differentiate(Node n, String v) {
	return switch (n) {
		case AddNode(var left, var right) ->
			new AddNode(
				differentiate(left, v),
				differentiate(right, v));
		case MulNode(var left, var right) ->
			new AddNode(
				new MulNode(
					left,
					differentiate(right, v)),
				new MulNode(
					differentiate(left, v),
					right));
		case ExpNode(var node, int exp) ->
			new MulNode(
				new ConstNode(exp),
				new MulNode(
					new ExpNode(node, exp-1),
					differentiate(node, v)));
		case NegNode(var node) ->
			new NegNode(differentiate(node, var));
		case ConstNode(double val) ->
			new ConstNode(0);
		case VarNode(String name) ->
			name.equals(v)
				? new ConstNode(1)
				: new ConstNode(0);
	}
}

double cost(Node n) {
    return switch (n) {
        case AddNode(var left, var right) ->
			1 + cost(left) + cost(right);
        case MulNode(var left, var right) ->
			2 + cost(left) + cost(right);
        case ExpNode(var node, int exp) ->
			exp + cost(node);
        case NegNode(var node) -> cost(node);
        case ConstNode(double val) -> 0;
        case VarNode(String name) -> 0;
    }
}
```

Before we had records and pattern matching, the standard approach to writing code like this was [the visitor pattern][ijn#8].
Pattern matching is clearly [more concise than visitors][visitor-pointless], but it's also more flexible and powerful.
Visitors require the domain to be built for visitation, and imposes strict constraints; pattern matching supports much more ad-hoc polymorphism.
Crucially, pattern matching composes better:
We can use nested patterns to express complex conditions that can be much messier to express using visitors.

```java
Node differentiate(Node n, String v) {
	return switch (n) {
		case AddNode(var left, var right) ->
			new AddNode(
				differentiate(left, v),
				differentiate(right, v));

		// special cases of k*node or node*k
		case MulNode(var left, ConstNode(double val) k)
			-> new MulNode(k, diff(left, v));
		case MulNode(ConstNode(double val) k, var right)
			-> new MulNode(k, diff(right, v));

		case MulNode(var left, var right) ->
			new AddNode(
				new MulNode(
					left,
					differentiate(right, v)),
				new MulNode(
					differentiate(left, v),
					right));
		case ExpNode(var node, int exp) ->
			new MulNode(
				new ConstNode(exp),
				new MulNode(
					new ExpNode(node, exp-1),
					differentiate(node, v)));
		case NegNode(var node) ->
			new NegNode(differentiate(node, var));
		case ConstNode(double val) ->
			new ConstNode(0);
		case VarNode(String name) ->
			name.equals(v)
				? new ConstNode(1)
				: new ConstNode(0);
	}
}
```

[ijn#8]: https://www.youtube.com/watch?v=anQq-R6AWOY&t=476s
[visitor-pointless]: https://nipafx.dev/java-visitor-pattern-pointless/

<!--
### Type System Support

We could do data-oriented programming with only maps, lists, and other general data structures - something that's often done in languages like Javascript.
But static typing still has a lot to offer in terms of safety, readability, and maintainability, even when we are only modeling plain data.
And in recent years, Java has acquired new tools to make exactly that easier.

Records are a form of "product types", so-called because their state space is the cartesian product of that of their components - or, even better, the valid subset of that that passed the constructor checks.
Sealed classes are a form of "sum types", so-called because the set of possible values is the sum of the value sets of the alternatives.
The combination of records and sealed types is an example of what are called algebraic data types (ADTs) and Java's interpretation of that has a number of desirable properties:

* They are nominal, meaning the types and components have human-readable names.
* They are immutable, which makes them simpler, safer, and freely shareable.
* They are easily testable because they contain nothing but their data (plus possibly behavior that's derived from it).
* They can easily be serialized to disk or across the wire.
* They are expressive, so they can model a broad range of data domains.

And then there's pattern matching.
It works great with ADTs and gives us a reasonable third option to define behavior on data other than defining methods on the involved types or using the visitor pattern.
Specifically, it allows us to flexibly combine various data structures without having to add dependencies between them.
-->

### Versus Object-Oriented Programming

Now that we've seen the principles and some examples, let's discuss why we'd want to write code like that - doesn't look particularly object-oriented to me!
Object-oriented programming is at its best when it's defining and defending boundaries: maintenance boundaries, encapsulation boundaries, compilation and compatibility boundaries, etc.
Dividing a large program into smaller parts with clear boundaries helps us manage complexity because it enables modular reasoning - the ability to analyze one part of the program at a time, but still reason about the whole.
It's essential when modeling complex entities and when creating rich libraries, powerful frameworks, and large programs.

But programs have gotten smaller and within a small service, there is less need for internal boundaries.
At the same time, a smaller service has a larger surface area, relatively speaking, so it'll require more code dealing with data from or for the "outside world" where we can't count on it fitting cleanly into Java's type system.
So overall, there's a trend that increases the share of problems for which OOP isn't the optimal solution.

So when we're building simpler services or subsystems that process plain, ad-hoc data, often involving the outside world, the techniques of data-oriented programming may offer us a straighter path.
Importantly, DOP and OOP are not at odds; they are different tools for different granularities and situations.
We can freely mix and match them as we see fit.

## Outro

And that's it for today on the Inside Java Newscast.
For more theory and practice on data-oriented programming in Java read Brian's article - link in the description.
Leave a comment, like the video, share it with your friends and enemies, I'll see you again in two weeks.
So long...

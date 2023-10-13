---
title: "Java 21 Pattern Matching Tutorial"
tags: [java-21, pattern-matching, java-basics]
date: 2023-09-17
slug: java-21-pattern-matching
videoSlug: road-to-21-patterns
description: "Java 21 is the first Java release with all essential pattern matching features finalized: sealed types, type patterns, an improved switch, records, and record patterns. This tutorial puts them all together."
featuredImage: road-to-21-patterns
---

Imagine we're writing an employee management tool.
For our core domain types we start with an interface `Employee` and for now `Salaried` and `Freelancer` are all the implementations we need.
The next step is to add operations:

* to request and confirm signage of legal documents
* to manage access to various platforms
* to track completion of compliance trainings (can you tell I'm working for a large corporation?)
* to issue payments
* to plan project work
* to schedule holidays
* etc.

We quickly realize that it's probably a bad idea to place all those very disparate operations that interact with mostly separate subsystems on the same type.
Imagine, `Employee` gobbling up all that functionality and in turn depending on most of our system!
I shudder at the thought.

So we need to separate the operations from the type.
We leaf through our copy of Design Patterns and land on the visitor pattern.
Immediately, the shudder returns and we wonder "Isn't there a simpler way?"

And the answer is, in Java 21, there absolutely is!
Just like lambda expressions turned the strategy pattern into a language feature, so we hardly think of it as design pattern anymore, does pattern matching turn the separation of types and operations into a simple application of a few language features, namely patterns, `switch`, and sealed types.
And that's what this last episode in the road to Java 21 is all about, so let's get started!

> So it should come at no surprise that this is what's called pattern matching.
> Pattern matching lets you construct your own data-driven dispatch in your implementation code, rather than in API code.

## Ingredients

### Extended `instanceof`

We'll take things slowly and start with a feature that you, if you're on Java 17, might already have used: the extended `instanceof`.
The old, clunky way to type check with `instanceof` consists of three steps:

* the type check
* the declaration of a new variable, and
* a cast of the general variable into the new one

```java
public void pay(Employee employee) {
	if (employee instanceof Freelancer) {
		Freelancer freelancer = (Freelancer) employee;
		// use `freelancer` ...
	} else if (employee instanceof Salaried) {
		Salaried salaried = (Salaried) employee;
		// use `salaried` here
	}
}
```

The [extended `instanceof`](https://openjdk.org/jeps/394) combines all three steps into just one operation.
With a simple `if (employee instanceof Freelancer freelancer)` we get the type check, a new variable of the desired type and name, and the old variable cast into it.
We can use the new variable `freelancer` everywhere where the condition is true, in this case in the `if`-branch.
Now, if we want to implement an operation that accepts an `Employee` instance but needs to handle each type differently, we could create a series of `instanceof` checks that runs through all known subtypes.

```java
public void pay(Employee employee) {
	if (employee instanceof Freelancer freelancer) {
		// use `freelancer` here
	} else if (employee instanceof Salaried salaried) {
		// use `salaried` here
	}
}
```

I know you're feeling that shudder again but stick with me, it's only a hypothetical step on the path to a good solution.
Let's a analyze it, though.

If the method doesn't return anything, the if-else-if chain doesn't need to cover all cases and if we add an additional class `Contractor implements Employee`, for example, we silently get no behavior at all for its instances and that's not good.
So it's probably a good idea to at least add an `else` branch that throws an exception but then we still only find out at run time that a branch is missing.

```java
public void pay(Employee employee) {
	if (employee instanceof Freelancer freelancer) {
		// use `freelancer` here
	} else if (employee instanceof Salaried salaried) {
		// use `salaried` here
	} else {
		throw new IllegalArgumentException();
	}
}
```

That's a serious maintainability problem and the reason for the shudder you felt earlier when I started going down this road.
We'll need to improve over this.
But let's put a pin in it for now and turn to another feature that's already available in 17, one you've probably used way more often.

### Switch enhancements

The good old `switch` statement has seen [two important improvements](https://openjdk.org/jeps/361).
One is that we can use it as an expression, meaning it computes a value that we, for example, assign that to a variable on the left-hand side or return from a method.
Where to use this depends on context:
Do we need to compute a value, then we'll use `switch` as an expression, or do we just execute some code, then a statement is fine.
The other improvement is that instead of following up the case label with a colon `:`, we can now use the lambda arrow `->`, which eliminates fallthrough and thus the need for all those `break`s.
This should definitely be your default choice unless you intentionally want to fall through.

Now, imagine for a moment that instead of an `Employee` interface with two implementations...
... we had created an `EmployeeType` enum with two values `SALARIED` and `FREELANCER`.
Then one way to implement an operation that differentiates by type would be to switch over `employee.type()` and to write a `case` for each enum value.
We can use the fancy new arrow syntax but there doesn't seem to be a need for a switch expression and so it's a statement.

```java
public interface Employee {

	// [...]

	EmployeeType type();

	enum EmployeeType {
		SALARIED, FREELANCER
	}

}


public void pay(Employee employee) {
	switch (employee.type()) {
		case SALARIED -> paySalary(employee);
		case FREELANCER -> payInvoice(employee);
	}
}
```

Unfortunately, a switch-over-enum statement doesn't need to cover all cases either and so we get the same behavior as with the if-else-if chain where a new enum value is silently ignored.
We can add a default branch that at least throws an exception but we would still rely on tests to find errors before they occur in production.
Still the same maintainability problem, still needs improvement.

On the way there, let's combine the two approaches.
We're back to an interface with two implementations but now we're using [the type check from the extended `instanceof` in `switch`](https://openjdk.org/jeps/441) - this is only possible without additional command line flags since Java 21.

```java
public void pay(Employee employee) {
	switch (employee) {
		case Salaried salaried -> paySalary(salaried);
		case Freelancer freelancer -> payInvoice(freelancer);
		default -> throw new IllegalArgumentException();
	}
}
```

As you can probably tell by now, a line like `case Freelancer freelancer -> something` checks whether `employee` is an instance of `Freelancer` and, if so, executes the code on the right, where a variable of name `freelancer` and of type `Freelancer` is available.
At first, the only advantage of this is that we have the expressiveness of the switch that clearly communicates that we have one action per branch while not needing an additional enum to differentiate by type - the class information suffices.

The game changer is hidden in between the last `case` and the end of the switch.
See what happens when I remove the default branch:

```java
public void pay(Employee employee) {
	// compile error:
	//     "'switch' statement does not cover
	//       all possible input values"
	switch (employee) {
		case Salaried salaried -> paySalary(salaried);
		case Freelancer freelancer -> payInvoice(freelancer);
	}
}
```

We get a compile error!
That's because the compiler requires that a switch over a complex type covers all possible implementations.
As is that only forces us to include a default branch but now we'll fold in _another_ Java feature that you might already be using on JDK 17, although that would surprise me a bit because it didn't really get you anything.

### Sealed types

And that's [sealed types](https://openjdk.org/jeps/409)!
Regular types can be implemented by anybody who can get a hold of them and, in the case of a class, can reach the super constructor.
For simplicity's sake, let's stick to interfaces, though.
The only way to limit an interface's extensibility is via the its visibility - otherwise, everybody can implement it!
And that's fine for things like `Collection` or `List` but with core domain types that have a lot of logic attached to them, it's not really feasible to expect that simply adding an implementation, like a `Contractor` for our `Employee` just works and doesn't require any other changes in the system.
No, your code probably depends in you knowing every implementation of that interface.

And that's what sealed interfaces are for.
You can declare an interface like `Employee` _sealed_ and then _permit_ all possible implementations - in our case that's `Salaried` and `Freelancer`.

```java
public sealed interface Employee
	permits Salaried, Freelancer {

	// [...]

}
```

There are some requirements for the types that implement a sealed interface or extend a sealed class but I'll gloss over that here - there's [a link to a detailed explanation of sealed types](https://www.youtube.com/watch?v=652kheEraHQ) in the description.
What's important for us here, and really 80% of what sealed types are about, is that the compiler understands the limited extensibiliy.
For a `sealed interface Employee permits Salaried, Freelancer` it knows that when you have an instance of `Employee` it _must_ be either an instance of `Salaried` or of `Freelancer`.
And with this final ingredient, we get our compile-time verification of operations that need to differentiate by types.

### Put together

Because look what happens to our switch when we make `Employee` sealed:

```java
public void pay(Employee employee) {
	// switch is exhaustive ~> no compile error
	switch (employee) {
		case Salaried salaried -> paySalary(salaried);
		case Freelancer freelancer -> payInvoice(freelancer);
	}
}
```

The compile error is gone!
The compiler understands that we covered all possible subtypes of `Employee`, that's called "exhaustiveness" or "being exhaustive", and it stops bothering us.
But at the same time it's still watching us closely.
Because when we add a third implementation, we also need to add it to the `permits` clause and, bham, the compile error is back!

```java
public sealed interface Employee
	permits Salaried, Freelancer, Contractor {

	// [...]

}

public void pay(Employee employee) {
	// switch is no longer exhaustive ~> compile error
	switch (employee) {
		case Salaried salaried -> paySalary(salaried);
		case Freelancer freelancer -> payInvoice(freelancer);
	}
}
```

This is huge!
This is what the entire complexity of the visitor pattern was there for: to separate types from operations while making sure that adding a new type forces us to update all operations to handle it.
This way we get the same safety - all we have to do is make the type sealed.
And avoid default branches!
That's important, let's talk about that for a minute.

### Exhaustiveness

When switching over complex types, the compiler requires exhaustiveness.
The trivial way to achieve that is to add a default branch but the critical disadvantage of that is that if we add another implementation of the sealed type, the switch is still exhaustive and we _don't_ get a compile error and so we _don't_ have to update our operation for the new type and it silently falls into the default branch.
That may be the correct way to handle it, but it also might not be and it's really only the developer, us, who can make that decision.
So it's important to avoid an outright default branch and instead list all types explicitly.
We cannot combine multiple types into one branch and so, in the worst case, we may have to repeat the same behavior for a few different types.
If only there was a better way to handle this.

And that, my friends, is called _foreshadowing_.
I'm alluding to something that happens later in the video to build anticipation and add tension.
So you stick around for the important things that are coming instead of switching to cat videos.
Are those still a thing or am I dating myself?
Anyway, before we resolve this tension, let's talk about the term in the title of this video that I didn't even explain yet: pattern matching.

## Pattern matching

Remember the `instanceof` triad?
A check, a declaration, a cast?
If we generalize this to "a check, declarations, extractions", we get something much more powerful.
For example:

* "if the `Employee` is of type `Freelancer` declare a variable `Freelancer free` and assign the employee to it", or
* "if the `Freelancer` is composed of a name and an hourly rate larger than 250 EUR, create a variable `String name` and assign the freelancer's name to it, because we probably wanna fire them", or
* "if the `List<String>` is not empty, declare variables `String first` and `List<String> tail` and assign the first element of the list to `first` and the rest of the list to `tail`", or
* "if the `Map<Id, User>` contains an entry for a specific ID, declare a variable `User u` and assign the user associated with that variable"

Checking a variable for some property and then declaring new variables to capture that property is extremely common.
What you're doing here is matching a variable to a pattern and if it fits, extracting information according to that pattern.
So it should come at no surprise that this is what's called _pattern matching_.
The extended `instanceof` and its counterpart in switches are called type patterns but that's not the only pattern Java has on offer.
But before we get to the other one, let's zoom out a bit.
There's a bigger picture of what pattern matching means for Java and who better to explain it than Java Language Architect and player of long games Brian Goetz?

<!-- BRIAN -->

So, pattern matching is related to dynamic dispatch.
And, historically, Java's approach to dynamic dispatch is tied strictly to the class hierarchy.
So, we define a virtual method through an interface or a base class and then subclasses provide their own implementations, and the method invocation mechanic handles the dynamic dispatch.
And this is really powerful, but it's rigid.
Because in order to harness the power of this dynamic dispatch, we have to reflect the dispatch points as public API points, and reflect each dispatch option as a separate implementation of the type declaring the dispatch point.

This works great when the dynamic behavior is something that we really want as a first-class, public API point.
But sometimes we want to make dynamic, data-driven decisions without having to expose all of this in our APIs.

So, historically, the way we had to do this was with the visitor pattern, and this works but it really just moves the problem somewhere else.
So, visitor lets you take polymorphic operations out of the public eye/API for your domain model, but the flip side is that visitors are pretty intrusive and rigid in their own way.
So, pattern matching lets you construct your own data-driven dispatch in your implementation code, rather than in API code.
And this is more flexible, more concise, less intrusive, and can be used to yield benefits in several different ways.

Now, pattern matching wouldn't, and shouldn't, replace API-based polymorphism; it complements it.
Some polymorphic operations are essential to the domain and they make total sense to be part of your API, and we'll continue to use public API points for these.
Others don't really make sense to be part of your domain model and pattern matching lets us more easily move these to where they belong.
So pattern matching gives API designers a richer toolbox for exposing the right shape API.

Now, if we were to decide that a particular polymorphic operation belongs in the API, pattern matching still offers us some extra flexibility:
You can continue to use method overriding to implement the operation, but if you know all your subtypes (which is going to happen more frequently now that we have the ability to declare sealed class hierarchies), you can also write a single data-driven implementation using pattern matching.
And the clients won't be able to tell the difference.
So if you have pattern matching in the language, even if you're not going to use it to change the structures of your APIs, it still offers implementation flexibility for API developers.

And finally, pattern matching gives more flexibility to API clients because they can more easily and safely create new polymorphic behavior even if the underlying domain model hasn't exposed it directly.

So we should think of pattern matching as offering us another path to polymorphic dispatch, that can be used in different situations from ordinary virtual dispatch.
And if the data-oriented polymorphism of pattern matching is a better fit for your problem, you can use that, and otherwise we can continue to use the tried and true object oriented techniques.

## Data-oriented programming

### Intro

As Brian just explained, pattern matching can be used to implement polymorphism.
In an object-oriented approach, that can occasionally complement polymorphism by inheritance but we can take it much further and forego OOP for most of our domain and pick a much more functional approach.
But where functional programming places functions at the center with data representation a close second, what I'm talking about switches that around, no pun intended, and focuses on data first.
It's called _data-oriented programming_.

Data-oriented programming proposes the representation of outside data in your program not as objects that combine mutable state and operations and that data needs to be contorted to align with but instead represent it as closely as possible with simple, immutable types - we'll see in a second how to do that.
You'd apply data-oriented programming in situations where a system or subsystem is mostly focused on ferrying data back and forth between a few connectors to outside systems and that doesn't require the kind of modularization object-oriented design affords us.
That is more likely if the system or subsystems is somewhat small.
But how do you represent data as closely as possible?

### Ingredients

The ingredients are relatively simple.
The main one, and if you're on JDK 17, I'm sure you've already used it, are [records](https://openjdk.org/jeps/395).
Designed as transparent carriers of immutable data, they're perfect for this task.
(And thats no coincidence, by the way.)
You'll use them to create types that represent specific data as closely as possible so you get the most out of Java's type system.

So if your data contains salaried employees with a name and a pay grade as well as freelancers with a name and an hourly rate, don't try to find a smart way to combine that in one class.
Just create two records that fit the data exactly.
And put in the work to make them airtight.
You want to enforce all requirements for the data in the constructor or a factory method to make sure that only legal states are represented.
And by default, these types should be deeply immutable.
Record fields cannot be reassigned but if they reference a mutable type, say an `ArrayList`, the collection could still be changed by calling `add` or `clear` - you probably want to assign a `List.copyOf` to the field instead.

```java
public record Salaried(
		String name, PayGrade payGrade, List<LocalDate> holidays)
		implements Employee {

	public Salaried {
		Objects.requireNonNull(name);
		Objects.requireNonNull(payGrade);
		Objects.requireNonNull(holidays);
		holidays = List.copyOf(holidays);
	}

	public enum PayGrade {
		A, B, C
	}

}
```

Still, some data might have non-required fields.
We can argue whether to model them with `null` or give their component an `Optional` type (I'm clearly in the latter camp, by the way) but don't let this seduce you into modeling an "A or B" scenario as a single type with tons of non-required fields.

Instead, add the other ingredient: sealed types.
You'll use them whenever there are alternatives between different kinds of data.
So if your data contains contracts and each contract links to an employee that is either salaried or a freelancer, you'd create a sealed interface `Employee` that permits two implementations `Salaried` and `Freelancer`.

### Operations

That nails our types down, now let's talk about operations.
Unless they just combine data on the same type, like a first name and a last name to a full name, they should not be defined on these types.
Beyond that, you already know most of what you need to know about operations over these types from the first part of the video but since we're now dealing with records a lot, let's add the other kind of pattern that I alluded to earlier.
That would be [record patterns](https://openjdk.org/jeps/440).
Remember this example?

> If the `Freelancer` is composed of a name and an hourly rate larger than 250 EUR, create a variable `String name` and assign the freelancer's name to it

That's exactly what record patterns do!
The check is whether we indeed have an instance of the record, the declarations are one per component, and the extractions are assigning the component values to these variables.

With record patterns, the implementation of extracting the freelancer's hourly rate is a simple `case Freelancer(String name, double hourlyRate)` or `(var name, var hourlyRate)` if you prefer.
And if we want to add a condition, we use a so-called guarded pattern.
After any pattern, we can write `when` and then some boolean condition and of course the branch is only executed if the condition is true.

```java
public void pay(Employee employee) {
	switch (employee) {
		case Salaried(var name, var payGrade, var holidays)
			-> paySalary(payGrade);
		case Freelancer(var name, var hourlyRate) when hourlyRate > 250
			-> payInvoice(hourlyRate);
		case Freelancer(var name, var hourlyRate)
			-> payInvoice(hourlyRate);
	}
}
```

The astute among you may wonder how this interacts with exhaustiveness.
Clearly a `case Freelancer when hourlyRate > 250` does not cover all freelancers.
Can you add a `case Freelancer when hourlyRate <= 250`?
Yes, absolutely, but it won't do what you hoped - the compile error would still be there.
The reason is... well, that Computer Science is very mean:
If you allow arbitrary checks after a `when`, it is categorically impossible that the compiler can figure out for all conditions whether all possibilities are covered.
You could limit the kind of conditions and then implement a checker for that and then make all that part of the Java specification, set in stone for eternity.

Or you just don't, treat any guarded pattern as inherently incomplete, and require an unguarded pattern for each type to achieve exhaustiveness.
So, in this case, just add a `case Freelancer` without any `when` after all the `case Freelancer when` and the compiler is happy.
Yes, you don't get to express the symmetry of _larger than_ vs _smaller than or equal to_ but unless you're like me, you're probably not gonna loose sleep over that.

### Principles

If you want to learn more about data-oriented programming, watch [Inside Java Newscast #29](inside-java-newscast-29) or read Brian's seminal article on the topic, both linked in the description.
For now, I want to leave you with the four principles he defined:

1. Model the data, the whole data, and nothing but the data - that's the part about creating types that match the shape and alternatives of the data closely as well as the part where you do not add operations as methods to the data but as functions operating on them.
2. Data is immutable - that were the records and the immutable copies in the constructor.
3. Validate at the boundary.
4. Make illegal states unrepresentable - both of which are covered by designing types correctly and rejecting illegal combinations of data in the constructor.

And that's it for data-oriented programming...

Ah right, phew, that was close!
You don't want to know what happens to YouTubers who foreshadow something but then don't follow up on it.
I left you hanging on how to combine multiple types into one branch with defaulty behavior.


## Unnamed patterns

<!-- ANGELOS -->

Hello, my name is Angelos Bimpoudis and I work for the Java Platform Group at Oracle.
There are numerous cases where we want to describe some functionality in code, while clearly expressing that some elements can be ignored.
Java 21 re-introduces the underscore character as a preview feature, to be used for ignoring pattern variables, whole patterns or other kinds of variables outside pattern matching.

Let's continue the employee management example and add an `Intern` record.
Imagine that we would like to write code that processes the first case but does not care about the other cases, as our abstract data type is today.
We can express this with `default`.

```java
Employee employee = // ...
switch (employee) {
    case Salaried s -> processSalary(s);
	// every new/additional `Employee`
	// will silently end up here:
    default -> stopProcessing();
}
```

That would indeed make the switch exhaustive, however there is a hidden caveat.
While this switch is now exhaustive it is not future proof.
If someone adds a new variant in the future, this snippet will never fail to compile or execute.

The compiler can do a better job of checking exhaustiveness without a default case.
If we want this switch to signal us back a missing case upon recompilation, there is indeed a better option.
We include the variants of `Freelancer` and `Intern`.

```java
Employee employee = // ...
switch (employee) {
    case Salaried s -> processSalary(s);
    case Freelancer f -> stopProcessing();
    case Intern i -> stopProcessing();
}
```

Notice that both `f` and `i`, in this case, are now unused pattern variables in our code.
We can replace both with underscore and make our intention that we do not care about variable names clearer.
Since those last two cases do not introduce any variables in the scope on the right-hand side of the cases, we can remove the duplication and write this more succinctly, in one line: a case with multiple patterns that none of them introduces pattern variables.

```java
Employee employee = // ...
switch (employee) {
    case Salaried s -> processSalary(s);
    case Freelancer _, Intern _ -> stopProcessing();
}
```

This version of the switch is decluttered and offers error reporting upon extension of the data type.

Unnamed pattern variables can be used in nested positions as well, for example when we deconstruct the `Salaried employees` in this example:

```java
Employee employee = // ...
switch (employee) {
    case Salaried(String _, PayGrade grade) -> processPayGrade(grade);
    case Freelancer _, Intern _ -> stopProcessing();
}
```

But also for whole nested patterns.
Here `_` in the first case is an unnamed pattern:

```java
Employee employee = // ...
switch (employee) {
    case Salaried(_, PayGrade grade) -> processPayGrade(grade);
    case Freelancer _, Intern _ -> stopProcessing();
}
```

There are other valid cases of unnamed variables, for example in try-with-resources when the resource name is not needed.

```java
try (var _ = ScopedContext.acquire()) {
    // ... no use of acquired resource ...
}
```

## Outro

Thanks Angelos, he's the owner of [JDK Enhancement Proposal 443](https://openjdk.org/jeps/443) which introduced unnamed patterns and variables as a preview feature in JDK 21.
I'll tell you more about that in our Road to Java 25 video series in two years.

Because we're done!
Not only with pattern matching and data-oriented programming, but with the road to Java 21.
From upgrade hurdles to virtual threads, from better tools and security to improved performance and APIs, and now pattern matching, we've covered everything new between Java 17 and 21.

We really enjoyed creating this series and everybody invested a lot of time and energy to make the best videos we could.
If you liked them and have the chance, leave a few nice words for Ana, Billy, and Jose in the comments here or under their videos - I'm sure they'll love to read them!
Another person who deserves praise is David Delabassee who created the intro, the thumbnails, and is generally the good spirit behind our YouTube channel - thank you, David!

All that said, I hope to see you again in the next weeks and months for our regular programming: JEP Cafes, Stack Walkers, Inside Java Newscasts and Podcasts, conference talks, and more - this is the best place on YouTube to learn deeply about Java.
Subscribe and I'll see you around.
So long...

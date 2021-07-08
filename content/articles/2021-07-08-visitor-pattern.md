---
title: "Visitor Pattern Considered Pointless - Use Pattern Switches Instead"
tags: [patterns, pattern-matching, sealed]
date: 2021-07-08
slug: java-visitor-pattern-pointless
description: "In modern Java, the visitor pattern is no longer needed. Using sealed types and switches with pattern matching achieves the same goals with less code and less complexity."
featuredImage: visitor-pattern-pointless
---

Whenever you're in a situation where [the visitor pattern](https://en.wikipedia.org/wiki/Visitor_pattern) would apply, you can now use modern Java language features instead.
Of course these features can be used beyond those circumstances, but in this post, I focus on that narrow topic: replacing the visitor pattern.
To that end, I give the briefest of introductions and an example before explaining how to achieve the same goals with simpler code and less of it.

<pullquote>I focus on that narrow topic: replacing the visitor pattern</pullquote>

If you don't want to enjoy the journey, check the table of contents on the left to skip to the juicy but that lays out the complete solution.


## The Visitor Pattern

[From Wikipedia](https://en.wikipedia.org/wiki/Visitor_pattern):

> [T]he visitor design pattern is a way of separating an algorithm from an object structure on which it operates.
> A practical result of this separation is the ability to add new operations to existing object structures without modifying the structures.

Not modifying the structure is the key motivation here.
If there are many or very different operations, implementing them on the involved types can easily overburden those with lots of unrelated functionality.
And it's of course only possible to change these types in the first place if they don't come from a dependency.

<pullquote>Key motivation: Not to modify the types</pullquote>

With the visitor pattern, each operation is implemented in a visitor that is then handed to the object structure, which passes its constituting objects to the visitor.
The structure is unaware of any specific visitor, so they can be freely created wherever an operation is needed.

Here's the example given on Wikipedia (slightly shortened):

```java
public class VisitorDemo {

    public static void main(final String[] args) {
        Car car = new Car();
        car.accept(new CarElementPrintVisitor());
    }

}

// supertype of all objects in the structure
interface CarElement {

    void accept(CarElementVisitor visitor);

}

// supertype of all operations
interface CarElementVisitor {

    void visit(Body body);
    void visit(Car car);
    void visit(Engine engine);

}

class Body implements CarElement {

  @Override
  public void accept(CarElementVisitor visitor) {
      visitor.visit(this);
  }

}

class Engine implements CarElement {

  @Override
  public void accept(CarElementVisitor visitor) {
      visitor.visit(this);
  }

}

class Car implements CarElement {

    private final List<CarElement> elements;

    public Car() {
        this.elements = List.of(new Body(), new Engine());
    }

    @Override
    public void accept(CarElementVisitor visitor) {
        for (CarElement element : elements) {
            element.accept(visitor);
        }
        visitor.visit(this);
    }

}

class CarElementPrintVisitor implements CarElementVisitor {

    @Override
    public void visit(Body body) {
        System.out.println("Visiting body");
    }

    @Override
    public void visit(Car car) {
        System.out.println("Visiting car");
    }

    @Override
    public void visit(Engine engine) {
        System.out.println("Visiting engine");
    }

}
```

There are a bunch of things I would've done differently (`Car extends CarElement`? Really?!), but for easier comparison I decided to stick closely to the original.

Plenty more has been written about the visitor pattern (use cases, prerequisites, implementation, limitations, etc.), so no need to repeat that here.
Let's just assume that we're in a situation where it makes sense to use the pattern.
Here's what to do instead.



## Using The Language

Modern Java offers better ways to achieve the visitor pattern's goals than the pattern does and makes it redundant.

### Defining Additional Operations

The visitor pattern's core mission is to allow the implementation of new functionality that is strongly related to a collection of types, but:

* without changing those types (beyond one-time setup)
* while keeping the resulting code maintainable

It achieves that by:

* allowing you to create a new visitor implementation for each operation (without touching the types it operates on)
* requiring each visitor to be able to handle all relevant classes (otherwise they don't compile)

Here's that part of the pattern:

```java
// When adding a new visited type, make it implement
// this interface. Only acceptable implementation
// of `accept` is `visitor.visit(this)`, which doesn't
// compile (yet)
// ~> follow the error
interface CarElement {

	void accept(CarElementVisitor visitor);

}

// To fix the compile error, add new method here,
// which leads to compile errors in each existing
// visitor.
// ~> good, makes sure you add new type everywhere
interface CarElementVisitor {

	void visit(Body body);
	void visit(Car car);
	void visit(Engine engine);

}

// When a new type is added, this class no longer compiles
// until the respective `visit` method was added here.
class CarElementPrintVisitor implements CarElementVisitor {

	@Override
	public void visit(Body body) {
		System.out.println("Visiting body");
	}

	@Override
	public void visit(Car car) {
		System.out.println("Visiting car");
	}

	@Override
	public void visit(Engine engine) {
		System.out.println("Visiting engine");
	}

}
```

Thanks to recent (and partially not yet finalized) additions to Java, we can now achieve those goals in a much simpler way:

1. create [a `sealed` interface](https://openjdk.java.net/jeps/409) for all types that are part of these operations
2. wherever a new operation is needed, use [type patterns](java-type-pattern-matching) [in `switch`](https://openjdk.java.net/jeps/406) to implement it (this is a [preview feature](enable-preview-language-features) in Java 17)

<pullquote>Sealed interface, `switch`, and pattern matching</pullquote>

```java
sealed interface CarElement
	permits Body, Engine, Car { }

final class Body implements CarElement { }

final class Engine implements CarElement { }

final class Car implements CarElement {

	// ...

}

// elsewhere, wherever you have a `CarElement`:
// one piece of code per operation - this one prints stuff
String message = switch (element) {
	case Body body -> "Visiting body";
	case Car car -> "Visiting car";
	case Engine engine -> "Visiting engine";
	// note lacking `default` branch - that's important!
};
System.out.println(message);
```

Let me walk you through it:

* `switch(element)` switches over `element`
* each `case` label tests whether that instance is of the specified type
	* if so, it creates a variable of that type with a new name (which is unused in my examples)
	* then the switch evaluates to the string on the right side of the arrow
* the switch must evaluate to a result, which is then assigned to `message`

The "must evaluate to a result" part works without a `default` branch because `CarElement` is sealed, which lets the compiler (and your colleagues) know that only the listed types directly implement it.
The compiler can apply that knowledge to the pattern switch and determine that the listed cases are exhaustive, i.e. all possible implementations are checked against.

So when you add a new type to the sealed interface, all pattern switches without `default` branch will suddenly be non-exhaustive and cause compile errors.
Like when adding a new `visit` method to the visitor interface, these compile errors are **good** - they lead you to where you need to change your code to handle the new case.
You should hence probably not add a `default` branch to such switches - if there are some types that you want to turn to no-ops, list them explicitly:

```java
String message = switch (element) {
	case Body body -> // do a thing
	case Car car -> // do the default thing
	case Engine engine -> // do the (same) default thing
};
```

(In case you've paid excellent attention to recent feature additions, you might be thinking that that's all fine and dandy, but only for `switch` expressions because for statements, exhaustiveness is not checked.
Fortunately, as [JEP 406](https://openjdk.java.net/jeps/406) proposes now, all pattern switches will have their completeness checked - regardless of their use as statement or expression.)

### Reusing Iteration Logic

The visitor pattern implements internal iteration.
That means instead of every user of the data structure implementing their own iteration (in user code outside of the data structure, hence _external_), they hand the action to be performed to the data structure, which then iterates over itself (this code is inside the structure, hence _internal_) and applies the action:

```java
class Car implements CarElement {

	private final List<CarElement> elements;

	// ...

	@Override
	public void accept(CarElementVisitor visitor) {
		for (CarElement element : elements) {
			element.accept(visitor);
		}
		visitor.visit(this);
	}

}

// elsewhere
Car car = // ...
CarElementVisitor visitor = // ...
car.accept(visitor);
```

That has the benefit of reusing the iteration logic, which is particularly interesting if it's not as trivial as a straight-up loop.
The downside is that it's hard to cover the many use cases for iteration: finding a result, computing new values and collecting them in a list, reducing values to a single result, etc.
I guess you see where this is going: Java streams already do all of that and more!
So instead of implementing an ad-hoc variant of `Stream::forEach`, why not use the real deal?

<pullquote>Use streams for internal iteration</pullquote>

```java
final class Car implements CarElement {

	private final List<CarElement> elements;

	// ...

	public Stream<CarElement> elements() {
		return Stream.concat(elements.stream(), Stream.of(this));
	}

}

// elsewhere
Car car = // ...
car.elements()
	// do stream things
```

This reuses a more powerful and well-understood API that makes every operation that doesn't boil down to `Stream::forEach` much easier!

<!--
## Reusing Domain Logic

The [Wikipedia article on the visitor pattern](https://en.wikipedia.org/wiki/Visitor_pattern) also says this:

> Consider the design of a 2D computer-aided design (CAD) system. At its core, there are several types to represent basic geometric shapes like circles, lines, and arcs.
> [...]
> A fundamental operation on this type hierarchy is saving a drawing to the system's native file format.
> [...]
> As this is done for each added different format, duplication between the [save] functions accumulates.
> For example, saving a circle shape in a raster format requires very similar code no matter what specific raster form is used, and is different from other primitive shapes.
> The case for other primitive shapes like lines and polygons is similar.

This seems to describe a situation where there's duplication between different operations (here: save functions) and even though neither this section nor the following sentences seem to describe how the visitor pattern prevents that, I don't know why else that would be mentioned.
Unless I missed it, the Gang of Four book doesn't describe the benefit of preventing duplication either.

But maybe I missed something, so in case the visitors are good at deduplicating code, then the only ways I see how they can achieve that is composition or inheritance.
The approach I described can only do one of those, but gladly it's the correct one for reusing code. 😁

(In case you're not in on the joke, nowadays the motto for reusing code is _composition over inheritance_, i.e. sharing code as functions or objects instead of calling methods in the super class.)
-->


## Modern Java Solution

Put together, here's the complete solution:

```java
public class VisitorDemo {

    public static void main(final String[] args) {
        Car car = new Car();
        print(car);
    }

	private static void print(Car car) {
		car.elements()
			.map(element -> switch (element) {
				case Body body -> "Visiting body";
				case Car car_ -> "Visiting car";
				case Engine engine -> "Visiting engine";
			})
			.forEach(System.out::println);
	}

}

// supertype of all objects in the structure
sealed interface CarElement
		permits Body, Engine, Car { }

class Body implements CarElement { }

class Engine implements CarElement { }

class Car implements CarElement {

    private final List<CarElement> elements;

    public Car() {
        this.elements = List.of(new Body(), new Engine());
    }

	public Stream<CarElement> elements() {
		return Stream.concat(elements.stream(), Stream.of(this));
	}

}
```

Same functionality, but half the lines of code and no indirection.
Not bad, ey?


## Benefits

As I see it, this approach has a bunch of benefits over the visitor pattern.

### Simpler

Overall, the entire solution is just much simpler.
No visitor interface, no requirement for visitor classes, no double dispatch, and no badly-named `visit` methods all over the place.

This not only makes it simpler to set up and extend, it also means that developers don't have to learn a specific pattern to recognize what's going on.
The reduced indirection means you can more readily understand the code just by reading it.
And it's also easier to retrofit:
Just make the common interface sealed and off you go.

### Easier Results

The visitor pattern requires implementing internal iteration, which, as I already pointed out, is only simple for the simple case.
By operating on a `Stream`, there's a plethora of readily available functionality that you can use to compute a result.
And unlike with the visitor pattern, you can do that without creating an instance, mutating state a whole lot, and then querying it:

```java
// visitor
Car car = // ...
PartCountingVisitor countingVisitor = new PartCountingVisitor();
car.accept(countingVisitor);
int partCount = countingVisitor.count();

// modern Java
int partCount = car.elements().count();
```

Ok, that was a bit of a cheap trick, but you get my point.

### More Flexible

At the moment, we only have [type patterns](java-type-pattern-matching), but very soon [we'll get more](https://openjdk.java.net/jeps/405) and we can use them to implement a more detailed handling of the visited element right then and there:

```java
switch (shape) {
	case Point(int x && x > 0, int y) p
		-> handleRightQuadrantsPoint(p);
	case Point(int x && x < 0, int y) p
		-> handleLeftQuadrantsPoint(p);
	case Point p -> handleYAxisPoint(p);
	// other cases ...
}
```

This gives us a chance to capture most or even all of the dispatch logic in one place as opposed to across multiple methods as would be the case in a visitor.
Even more interesting, we can split the dispatch by entirely different properties than just by type:

```java
switch (shape) {
	case ColoredPoint(Point p, Color c && c == RED) cp
		-> handleRedShape(p);
	case ColoredCircle(Circle ci, Color c && c == RED) cc
		-> handleRedShape(ci);
	// other cases ...
}
```


## Summary

Instead of the visitor pattern:

* make the interface for the structure's types `sealed`
* for operations, use pattern switches to determine the code path for each type
* avoid `default` branches to get compile errors in each operation when adding a new type

Modern Java for the win!

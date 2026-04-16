---
title: "You Must Avoid Final Field Mutation - Inside Java Newscast #110"
tags: [deprecation]
date: 2026-04-16
slug: inside-java-newscast-110
videoSlug: inside-java-newscast-110
description: "With JDK 26 / JEP 500 starting to prevent final field mutation through reflection, it is important that Java projects stop employing that practice."
featuredImage: inside-java-newscast-110
---

This is Nicolai Parlog.
I live at 308 Negra Arooyo Lane, Albuquerque, New Mexico, 87104.
To all law anforcement entities, this is not an admission of guilt.
I am talking to my community now.

<!-- Java logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're going to explore how you can keep your project from breaking bad due to the upcoming restriction of final field mutation.
This is of immediate importance if you have code that uses reflection like that, maybe for dependency injection or for deserialization.
If you don't, it will help you understand why some of your dependencies may change their approach and API in the future.
There's a bit more to cover here than fits into a Newscast and so I'll sometimes refer to an article that I've written on this and that either already is or otherwise will soon be published to inside.java - check the description for a link.
Ready?
Then let's dive right in!


## Final Field Mutation

Quick recap on what happened so far:
JDK 26 took first steps towards making final fields truly immutable by issuing warnings when they are mutated through the reflection API.
[JDK Enhancement Proposal 500](https://openjdk.org/jeps/500) and Inside Java Newscast #101 explain in detail the rationale and consequences as well as how to use the new command line flags `--enable-final-field-mutation` and `--illegal-final-field-mutation`.

<contentvideo slug="inside-java-newscast-101"></contentvideo>

And while these options _do_ allow the mutation of final fields, this should be seen as a last resort.
Frameworks, libraries, and applications should move away from that practice and we're here to discuss how.
And that depends on the use case.
That could be:

* dependency injection
* serialization, which in this video I'll use as a general term for any mechanism that turns a Java instance into an external format and vice versa (that external format could be YAML, JSON, Protobuff, whatever)
* platform serialization, which I'll use to describe Java's onboard serialization mechanism that revolves around the `Serializable` interface.
* cloning
* and general hackery

Let's go over these one by one.


## Platform Serialization

We'll start with everybody's favorite punching bag, platform serialization.
(By the way, if you want to better understand _why_ everybody bullies serialization but also why it was so vital for Java's success back in the days, check out Billy's excellent [StackWalker episode on the topic](https://www.youtube.com/watch?v=2sxK-z84Oi4).)
Now, reflection is sometimes used during deserialization to mutate final fields.
There are a variety of reasons for that, all somewhat niche, but there are also a number of alternative approaches that you can choose from.

```java
// This is an example for reflective final field mutation,
//  _not_ for a good implementation of the described use case.
// Do _not_ draw any security implications from this code!
public final class Token implements Serializable {

	private static final long serialVersionUID = 7665514043582332374L;

	private final String userId;
	private final byte[] token;
	private transient final byte[] derivedKey;

	public Token(String userId, byte[] token) {
		// verifies and assigns fields and then derives `derivedKey`
		this.derivedKey = Kdf.derive(this.token);
	}

	// implements `readObject` to compute and assign a derived key
	private void readObject(ObjectInputStream ois)
			throws IOException, ClassNotFoundException {
		ois.defaultReadObject();

		byte[] derivedKey = Kdf.derive(this.token);
		// use of reflection to assign `derivedKey` to the field
		try {
			var dkField = Token.class.getDeclaredField("derivedKey");
			dkField.setAccessible(true);
			dkField.set(this, derivedKey);
		} catch (NoSuchFieldException | IllegalAccessException ex) {
			throw new InvalidObjectException(ex);
		}
	}

}
```

Some are pretty general and they revolve around the idea to replace serialization's extra-linguistic approach of creating a broken instance first and have us fix them later with a regular constructor call that avoids that situation and assigns final fields at the right time, namely during construction.
So here are these more general approaches:

* you can serialize a record instead of a class, because there platform deserialization does invokle the constructor
* you can implement `readResolve`, which lets you replace the deserialized instance with another one that you call the constructor for


```java
// This is an example for implementing `readResolve`,
//  _not_ for a good implementation of the described use case.
// Do _not_ draw any security implications from this code!
public final class Token implements Serializable {

	private static final long serialVersionUID = 7665514043582332374L;

	private final String userId;
	private final byte[] token;
	private transient final byte[] derivedKey;

	public Token(String userId, byte[] token) {
		// verifies and assigns fields and then derives `derivedKey`
		this.derivedKey = Kdf.derive(this.token);
	}

	// implements `readResolve` to create a new instance
	// with a correctly derived key
	private Object readResolve() throws ObjectStreamException {
		return new Token(this.userId, this.token);
	}

}
```

* you can employ the serialization proxy pattern, which also uses `readResolve`

If none of those work, there are more situational options for dealing with a final field whose value you want to override - see the article for a short list.


## Serialization

When we just now talked about platform serialization, we were the _user_ of that API and had to find options within its logic.
Now let's talk about the case where we're maintaining a project or maybe even just some custom code that turns Java objects into an external format like JSON or YAML.
That means now _we're_ the ones designing the logic within which our users have to find options that work for them.

### Require Broken Classes

The simplest approach for us would be to insist that only classes with a parameterless constructor and non-final fields could be serialized but that would force our users into creating effectively broken classes, so let's look for better options.

### Limit to Records

The next one up the complexity ladder would be to limit our functionality to serializing records - as transparent data carriers, they are a perfect fit for this use case.
Their defined protocol for construction and deconstruction and the fact that component order and names are part of their API allow for straightforward, lossless reconstruction of instances, usually without further user intervention like annotations.

### Use Records as Proxies

If that is too limiting, a higher degree of freedom can be achieved with a protocol that allows serialization of all classes by asking them to implement methods that condense an instance's state into a dedicated record instance and that recreate a class instance from such a proxy.
That approach:

* lets users assign all fields in a constructor
* would give them a lot of freedom 
* while still allowing us to lean on the power of records

And having an explicit external representation like that also makes it easier to deserialize across version boundaries when the class evolves.
As for how the to-proxy and from-proxy methods could be identified, I would recommend not to rely on magic names, like platform serialization does, but to create annotations that users apply to identify them.
Note that these methods don't need to be public and so they can stay out of the class' API.

```java
// IN THE SERIALIZATION LIBRARY

// marker interface to quickly identify 
// serializable instances
// (not strictly needed)
interface DataCarrier {
	// defines no methods, so that the 
	// serialization protocol doesn't 
	// have to be public API
}

// annotations to identify the serialization 
// methods (retention policy, attributes, etc.
// are missing)
@interface ToData { }
@interface FromData { }


// ON THE USER'S SIDE

// for some reason not a record
public class Person implements DataCarrier {

	private final String name;
	private final int age;

	// [constructor, methods, etc.]

	@ToData
	private PersonData toData() {
		return new PersonData(name, age);
	}

	@FromData
	private static Person fromData(PersonData data) {
		return new Person(data.name(), data.age());
	}

	private record PersonData(String name, int age) { }

}
```

### Hook Into Platform Serialization

Another option is to hook into Java's platform serialization mechanism by use of the class `ReflectionFactory`.
This API is a sharp tool with extra sharp edges, though, and not for the faint of heart, so I'll skip it here.
The article explains on a high level how to do this and also lists all the drawbacks - and there are quite a few.

### Embrace Constructors

The last approach I could come up with and the one that offers users the most freedom effectively recreates records' construction and deconstruction protocol but would work for all classes.
For serialization, you'd reflectively read all fields and for deserialization, you'd ask users to identify a constructor or static factory method that you call with the values you get from the external format.
Then all fields are assigned during construction, which allows the use of `final`.
There are a number of challenges, though:

* It is necessary to identify fields that should or should not be part of the serialized form.
* If the serialized form is order-dependent, the order must be defined by the user as it cannot be inferred from the fields.
* If the serialized form identifies values by name (like most text-based formats do), these can be derived from field names, but that then turns this implementation detail into part of the serialization protocol.
  Making these names configurable would probably be a good idea.
* If the serialized form does not guarantee a reliable order (also like most text-based formats) matching values to the constructor's or factory method's parameters requires additional configuration by the user.

Some of these issues could be solved by convention instead of configuration, but in my experience this often leads to hard-to-predict behavior that causes more issues than it solves.
Being explicit often beats being implicit.
So the flexibility of this approach comes with a cost.

If I were to write a serialization library today, I would start out with the limitation to records and soon after add the feature that arbitrary classes can be serialized as long as they use a record instance as proxy.
It would probably take quite a bit of convincing to allow more flexibility.


## Dependency Injection

In the past, dependency injection frameworks often required parameterless constructors, so they could create "empty" instances and then write the dependencies directly to the fields - this is called "field injection" and requires either non-final fields or the reflective mutation of final fields, neither of which is a particularly compelling option.
Thankfully, the ecosystem has largely moved on to constructor injection, where a regular constructor gets called, so that final fields can be assigned therein.
If you maintain code that in some way or another injects dependencies, you should probably use constructor injection by default, maybe even as the only option.


## Cloning

The last situation I want to look at in which final fields may need to be forcefully mutated is cloning.
Cloning happens inside a `clone` method and usually begins by calling `super.clone()`, which creates a shallow copy of the current instance.
But sometimes, this instance needs to be changed before it's ready for wider use, for example to replace a mutable collection with a copy, so the original instance and its clone don't share the same mutable collection.
Since none of this happens inside a constructor, if such fields are final, the reflection API seems like the way to go.


```java
class Person implements Cloneable {

	private final List<Address> addresses;

	public Person(List<Address> addresses) {
		this.addresses = new ArrayList<>(addresses);
	}

	@Override
	public Person clone() throws CloneNotSupportedException {
		try {
			Person clone = (Person) super.clone();

			// set mutable copy of address list
			Field field = Person.class
				.getDeclaredField("addresses");
			field.setAccessible(true);
			field.set(clone, new ArrayList<>(this.addresses));

			return clone;
		} catch (ReflectiveOperationException ex) {
			throw new IllegalStateException(ex);
		}
	}

}
```

But cloning gets no exception from the limitation of final field mutation and so the use of reflection should be avoided here as well.
Depending on the requirement that triggered its use, there may be specialized solutions.
In the case of defensive collection copies, for example, the class' constructor could be changed to create unmodifiable copies with `List`, `Set`, or `Map.copyOf` and then the cloned object can refer to the same collection instance without having to create a defensive copy in the first place.

```java
class Person implements Cloneable {

	private final List<Address> addresses;

	public Person(List<Address> addresses) {
		// assuming the collection doesn't
		// need to be immutable after all
		this.addresses = List.copyOf(addresses);
	}

	@Override
	public Person clone() throws CloneNotSupportedException {
		// the clone has the same `addresses` instance like the
		// original, but it's immutable, so it doesn't matter
		return (Person) super.clone();
	}

}
```

Such solutions do not generalize, though.
The better approach is to avoid cloning entirely (it has other downsides, too) and instead work with copy constructors or static factory methods, both of which can prepare arguments before assigning them to final fields, which removes the need to employ reflection for that.

```java
class Person {

	private final List<Address> addresses;

	public Person(List<Address> addresses) {
		this.addresses = new ArrayList<>(addresses);
	}

	public static Person copyOf(Person person) {
		return new Person(new ArrayList<>(this.addresses));
	}

}
```


## Embracing Constructors

Everything I said so far could be boiled down to one simple piece of advice: embrace constructors.
Every mechanism that creates instances, be it cloning, dependency injection, some kind of serialization, or whatever else, really, should absolutely boil down to constructor calls.
They work well with final fields, of course, but they're also the place where classes check their inputs and establish their invariants.
Sooner or later, every mechanism that sidesteps that causes problems.
Exhibits A and B: Serialization and Cloning.

But what about cases where you need to mutate a final field way after an instance was created?
Maybe to work around a bug or to configure some otherwise unconfigurable behavior in code that you do not control.
As I mentioned in the intro, the command line option `--enable-final-field-mutation` exists and this is what it's there for: the cases that have no other solution.
But beware that you're taking on technical debt and you should work hard to pay it back, maybe by contributing the bug fix or by discussing the configuration option with the project maintainers.
Because one way or another, you will have to repay the debt or your project will be breaking bad.

---
title: "Avoiding Final Field Mutation"
tags: [java-26, core-lang, migration, libraries]
date: 2026-04-27
slug: avoid-final-field-mutation
description: "Reflective mutation of final field mutation will soon be disabled by default and should be avoided if possible - here's how"
canonicalUrl: https://inside.java/2026/04/27/avoiding-final-field-mutation/
featuredImage: avoid-final-field-mutation
---

The Java language requires final fields to be assigned during object construction and forbids later reassignment, but the JDK nonetheless offers mechanisms that allow just that.
JDK 26 takes first steps towards making final fields truly immutable by issuing warnings when they are mutated through the reflection API.
[JEP 500](https://openjdk.org/jeps/500) explains in detail the rationale and consequences as well as how to use the new command line flags `--enable-final-field-mutation` and `--illegal-final-field-mutation`.
While they allow the mutation of final fields, this should be seen as a last resort, and projects should move away from that practice.

This article discusses common scenarios in which final fields are mutated through reflection and what alternatives exist for each of them.
Since these scenarios can appear in frameworks, libraries, and applications, this article addresses developers of all such projects.

Our guiding star will be the following statement from the [JEP on integrity by default](https://openjdk.org/jeps/8305968), which applies to more than just serialization:

> In general, it is a mistake for libraries to serialize and deserialize an object without the cooperation of the object's class.

**Note**:
This article uses _serialization_ as a general term for a mechanism that can turn a Java instance into an external format (e.g. JSON, YAML, or protobuf) and vice versa.
For Java's onboard mechanism that revolves around the `Serializable` interface and the `ObjectInputStream` and `ObjectOutputStream` classes, it uses the term _platform serialization_.


## Initializing Instances

Final fields are most often illegally mutated to initialize instances right after construction (as opposed to reassigning them later in an instance's lifetime).
This can happen during dependency injection, deserialization, cloning, or other initialization processes that need to create usable instances before handing them over to the user.
Some of those use cases are tightly coupled to where the fields' values come from (e.g. from a JSON string or some other serialized form) and we will make these connections in later sections.
Nonetheless, there are certain commonalities between these solutions that make it worthwhile to discuss the initialization of instances in isolation.

### Ignoring Constructors

It was common for some initialization mechanisms to construct "empty" objects with all-`null` fields and then assign their values after construction.
Java's own platform deserialization works this way (under the hood but also explicitly if `readObject` is implemented), Java Beans commonly follow this pattern, and so did dependency injection.

This construct-first-assign-later approach collides head-on with final fields, though, for which the Java language promises that they are assigned exactly once during construction (be it in a field initializer, the constructor, or an initializer block) and never modified after.
As a consequence, these processes had to resort to forceful assignment, be it via reflection with `setAccessible`, via `Unsafe`, or JNI, thus undermining the integrity of the keyword `final` with all the systemic downsides outlined in JEP 500.

But post-construction assignment (whether the fields are final or not) also has immediate negative consequences for the class itself as it makes it much harder to guarantee that the populated instances fulfill the class’s invariants.
These are usually established in the constructor but an initialization process that requires an "empty" constructor or even outright sidesteps it can create ill-formed instances that lead to misbehaving programs or even security vulnerabilities.

### Using Constructors

Fortunately, many initialization processes have moved away from this construct-first-assign-later approach.
Dependency injection frameworks, for example, now support and often default to "constructor injection", where the values are passed to a constructor that has the task to verify them and then assign them to fields.
This not only establishes the class's invariants, it also uses the intended language mechanism to assign final fields and thus solves the problems outlined earlier.

### Embracing Constructors

Given the benefits of fully initializing objects through a constructor call, this should not only be the default approach but, unless hard reasons make it unfeasible, _the only_ approach.
It is flexible, though, and can take various forms:

* If records are used, there is one canonical constructor.
* If classes are used, the initialization process can require a single constructor to take that role.
* The process can require the user to identify a dedicated constructor or static factory method (e.g. by annotation).
* Such a constructor or method doesn't have to be public and can thus be kept out of the type's public API if that's preferable.

A challenge with using constructors or factory methods is getting the argument order right.
By default, the bytecode does not contain parameter names, which makes it hard to order the arguments correctly without additional information.
That information could come from:

* the use of records, whose component names are part of their public API
* compilation with the option `-parameters`, which makes argument names available to the reflection API
* the annotation(s) that the user applies to identify the correct constructor or factory method

Note that neither the reflection API nor even the bytecode is guaranteed to report or contain fields in the order they were declared in the source code, so do _not_ try to align field and parameter order.


## Platform Serialization

If your code contains `Serializable` classes, it may use reflection to mutate final fields during deserialization.

In this example, the serializable class `Token` contains a field `derivedKey` that must not be reused across application runs and instead be derived with the current run's cryptography configuration.
It is hence `transient` and because `Token` should be immutable, it is also `final`:

```java
// This is an example for reflective final field mutation, _not_ for a good
// implementation of the described use case.
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
	private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
		// side note: before the following method call, this instance has all-null fields
		ois.defaultReadObject();

		byte[] derivedKey = Kdf.derive(this.token);
		// use of reflection to assign `derivedKey` to the field of the same name
		try {
			var derivedKeyField = Token.class.getDeclaredField("derivedKey");
			derivedKeyField.setAccessible(true);
			derivedKeyField.set(this, derivedKey);
		} catch (NoSuchFieldException | IllegalAccessException ex) {
			throw new InvalidObjectException("Failed to set `derivedKey`", ex);
		}
	}

}
```

There are several options to avoid final field mutation in a situation like this.
A number of them follow the guideline to embrace regular constructor invocation:

* use a record instead of a class (more on that below)
* use `readResolve` instead of `readObject`
* employ the [serialization proxy pattern](https://nipafx.dev/java-serialization-proxy-pattern/) (which also uses `readResolve`)

Some other options revolve around the field itself:

* remove the field and compute the value on demand instead of on deserialization
* remove the field and store the value in an external data structure
* make the field non-final

Any of these will remove the need to mutate an otherwise final field.


## Serialization

If you maintain a custom serialization process, e.g. as the maintainer of a library that turns Java objects into JSON, YAML, etc., there are several routes you can take to avoid final field mutation.
The one that requires the fewest changes on your end is to instruct users to avoid final fields in serializable classes but given their benefits you may prefer to give your users more options.

### Limit to Records

A straightforward step is to limit serialization to records - as transparent data carriers, they are a perfect fit for this use case.
Their defined protocol for (de)construction allows for straightforward lossless reconstruction of instances, usually without further user intervention like annotations.

### Use Records as Proxies

If that is too limiting, a higher degree of freedom can be achieved with a protocol that asks instances to condense their state into a dedicated record instance and to rehydrate from such a proxy.
This is akin to the aforementioned serialization proxy pattern and, likewise, these methods don't have be public, although relying on "magic names" (like platform serialization does) is not ideal - using an annotation to identify the to-proxy and from-proxy methods would be the more legible approach.
Here's an example what that could look like:

```java
// IN THE SERIALIZATION LIBRARY

// marker interface to quickly identify serializable instances
// (not strictly needed)
interface DataCarrier {
	// defines no methods, so that the serialization protocol
	// doesn't have to be public API
}

// annotations to identify the serialization methods
// (retention policy, possible attributes, etc. are missing)
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

Having an explicit external representation like this also makes it straightforward to operate across version boundaries.
If the `Person` class evolves and requires a new serialization format, `toData` can return an instance of the new class `PersonDataV2` but in addition to the new method `fromData(PersonDataV2)` the old method `fromData(PersonData)` can remain.
If deserialization is still possible, it could still function properly, otherwise it could create a specific error message.

### Limit to `Serializable`

Platform serialization is able to write to final fields of `Serializable` instances and will remain so for the foreseeable future (I'm not aware of any plans to change that).
And it offers hooks for external libraries to make use of that capability!
This way, it’s possible to turn objects into field values and suitable values into objects, both via their class' serialization protocol.
That means your (general) serialization library can instruct users to make their classes (platform) serializable and then you can hook into the process to read and write values to and from (final) fields.

Java makes the methods associated with platform serialization available via [sun.reflect.ReflectionFactory](https://github.com/openjdk/jdk/blob/master/src/jdk.unsupported/share/classes/sun/reflect/ReflectionFactory.java), which is considered a [critical internal API](https://openjdk.org/jeps/260#Critical-internal-APIs-not-encapsulated-in-JDK-9).
Those are available in the JDK-specific module _jdk.unsupported_ and not encapsulated because no supported replacements exist.
`ReflectionFactory`'s functionality can only be applied to classes that implement `Serializable`.

A word of warning:
This API is a sharp tool with extra sharp edges and not for the faint of heart.
Explaining it in full is beyond the scope of this article.

Here is an example for how to use `ReflectionFactory` to turn a pair of `name` and `age` (which could've been read from any external representation) into an instance of `Person`.
First, the class `Person`, which is similar to above, but `Serializable`:

```java
class Person implements Serializable {

	private static final long serialVersionUID = 8127572164613693569L;

	private final String name;
	private final int age;

	public Person(String name, int age) {
		this.name = Objects.requireNonNull(name);
		if (age < 0)
			throw new IllegalArgumentException("Age must be 0 or larger");
		this.age = age;
	}

	@Override
	public String toString() {
		return "Person{name='" + name + "', age=" + age + "}";
	}

}
```

Because platform serialization deals with input/output streams, an `ObjectInputStream` is required that is populated with the values that should be assigned to the fields.
One way to provide such a stream is to create a custom implementation that reads values from a `Map`:

```java
static class MapObjectInputStream extends ObjectInputStream {

	private final Iterator<Map<String, Object>> objects;

	MapObjectInputStream(List<Map<String, Object>> objects) throws IOException {
		// create immutable copies of the list and maps
		this.objects = objects.stream()
			.map(Map::copyOf)
			.toList()
			.iterator();
		super();
	}

	@Override
	public ObjectInputStream.GetField readFields() throws IOException {
		if (objects.hasNext()) {
			return new MapGetField(objects.next());
		} else {
			throw new IOException("No more objects");
		}
	}

};

static class MapGetField extends ObjectInputStream.GetField {

	private final Map<String, Object> values;

	MapGetField(Map<String, Object> values) {
		this.values = values;
	}

	@Override
	public ObjectStreamClass getObjectStreamClass() {
		throw new UnsupportedOperationException();
	}

	@Override
	public boolean defaulted(String name) {
		return !values.containsKey(name);
	}

	@Override
	public boolean get(String name, boolean bln) {
		return (boolean) values.getOrDefault(name, bln);
	}

	@Override
	public byte get(String name, byte b) {
		return (byte) values.getOrDefault(name, b);
	}

	@Override
	public char get(String name, char c) {
		return (char) values.getOrDefault(name, c);
	}

	@Override
	public short get(String name, short s) {
		return (short) values.getOrDefault(name, s);
	}

	@Override
	public int get(String name, int i) {
		return (int) values.getOrDefault(name, i);
	}

	@Override
	public long get(String name, long l) {
		return (long) values.getOrDefault(name, l);
	}

	@Override
	public float get(String name, float f) {
		return (float) values.getOrDefault(name, f);
	}

	@Override
	public double get(String name, double d) {
		return (double) values.getOrDefault(name, d);
	}

	@Override
	public Object get(String name, Object o) {
		return values.getOrDefault(name, o);
	}

}
```

The following [compact source file](https://openjdk.org/jeps/512) uses the prior classes and `ReflectionFactory` to:

* create an "empty" instance of `Person` (despite the class not having a parameterless constructor)
* populate it with the legal name `"John Doe"` and illegal age `-5` (because the method handle returned by `defaultReadObjectForSerialization` does not go through the constructor and thus applies no checks)
* override those values with the legal pair `"Jane Doe"`/`23` (by invoking the same method handle again)

```java
import module jdk.unsupported;

void main() throws Throwable {
	ReflectionFactory factory = ReflectionFactory.getReflectionFactory();
	@SuppressWarnings("unchecked")
	Constructor<Person> personConstructor = (Constructor<Person>) factory.newConstructorForSerialization(Person.class);
	MethodHandle personReader = factory.defaultReadObjectForSerialization(Person.class);

	var person = personConstructor.newInstance();
	IO.println(person);

	var inputStream = new MapObjectInputStream(List.of(
		Map.of(
			"name", "John Doe",
			"age", -5),
		Map.of(
			"name", "Jane Doe",
			"age", 23)
	));

	personReader.invoke(person, inputStream);
	IO.println(person);

	personReader.invoke(person, inputStream);
	IO.println(person);
}
```

Platform serialization is an integral part of the JDK and should remain usable without warnings and limitations, so it gets an exception from the rules put forth by JEP 500, but the JDK does not want to disadvantage external serialization libraries and so this exception is extended to them.
Consequently, executing the code above issues neither warnings nor errors about final field mutation, regardless of what `--illegal-final-field-mutation` is set to (including `deny`).
While this may appear like a straightforward way to keep assigning to final fields without limitations (as long as the class is `Serializable`), this comes with the huge caveat that it adopts all the challenges of platform serialization:

* requires a full reimplementation of the protocol (e.g. with regards to `readObject` and `readResolve`), which is complex and hard to get right, particularly when it comes to security
* relies on the same extralinguistic mechanism that makes it hard for users to guarantee that instances are viable but makes it easy for (intentional or accidental) errors in values to lead to misbehaving instances
* proliferates the use of `Serializable` classes, which, due to the exception from final fields being truly final, will keep suffering from the lack of integrity that JEP 500 sets out to fix (with all the implications for maintainability, security, and performance)

Just like with platform serialization, the seeming simplicity of "just make the class `Serializable`" requires a lot of complexity elsewhere.
Worse, that complexity quickly bleeds into the classes themselves as soon as the serialized form does not map one to one to the fields (e.g. due to evolving the code but being bound to a fixed external form) or deserialization can't simply create instances (e.g. because invariants should be enforced).
The lesson to learn from platform serialization is that a more explicit protocol, even if it requires users to write a bit more code, fares better in the long run.

### Embrace Constructors

If none of these approaches cover all requirements, the most flexible one is to fully embrace constructors:
Read an instance's fields for serialization and let users identify constructors or static factory methods to be invoked during deserialization.
This approach requires additional configuration by the user and a more complex implementation, though:

* It is necessary to identify fields that should (not) be part of the serialized form.
* If the serialized form identifies values by name (like most text-based formats), these can be derived from field names, but that then turns this implementation detail into part of the serialization protocol.
  Making these names configurable is recommended.
* If the serialized form does not guarantee a reliable order (also like most text-based formats) matching values to the deserialization constructor's or method's parameters requires additional configuration by the user.
* If the serialized form is order-dependent, the order must be defined by the user as it cannot be inferred from the fields.

Note how records greatly simplify this because their components' order and names are part of their API and they are guaranteed to have a constructor that accepts one argument per component.


## Dependency Injection

As mentioned before, dependency injection frameworks often required parameterless constructors, so they could create "empty" instances and then write the dependencies directly to the fields - this is called "field injection" and requires either non-final fields or the reflective mutation of final fields.
The ecosystem has largely moved on to constructor injection, where a regular constructor gets called, so that final fields can be assigned therein.
If you maintain code that in some way or another injects dependencies, you should probably use constructor injection by default, maybe even as the only option.


## Cloning

In some classes that implement `Cloneable`, the `clone()` method needs to reassign fields.
Common reasons are defensive copies of mutable data structures like collections or the need for a deep copy (`Object.clone` only creates a shallow copy).
If those fields are final, they can't be reassigned after `Object.clone` returns, though, and so reflective mutation is often used.

In the following example, the list of addresses is mutable and must not be shared across `Person` instances and so `clone()` creates a copy that needs to be assigned to the final field `addresses`, for which it uses reflection:

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

			Field field = Person.class.getDeclaredField("addresses");
			field.setAccessible(true);
			field.set(clone, new ArrayList<>(this.addresses));

			return clone;
		} catch (ReflectiveOperationException ex) {
			throw new IllegalStateException(ex);
		}
	}

}
```

Cloning gets no exception from the limitation of final field mutation and so, like in other cases, the use of the reflection API should be avoided.
Depending on the requirement that triggered its use, there may be specialized solutions.
In the case of defensive collection copies, for example, the constructor could be changed to create unmodifiable copies with `List.copyOf`, `Set.copyOf`, or `Map.copyOf` and then the cloned object can refer to the same collection instance without having to create a defensive copy in the first place.

Such solutions don't generalize, though.
The better approach is to avoid cloning entirely (it has other downsides, too) and instead work with copy constructors or static factory/cloning methods, both of which can prepare arguments before assigning them to final fields, which removes the need to employ reflection for that.


## Non-Construction Cases

Mutating final fields outside of the creation of instances, particularly of classes other than the one containing the reflective code, should be an extreme exception.
Possible reasons could be to circumvent a bug in a dependency or to configure otherwise non-configurable behavior.
Such fixes/edits should be considered temporary, though, as any change in the dependency could let that code fail or, worse, trigger misbehavior.
It is highly recommended to work towards merging the fix/change into the dependency to make the mutating code superfluous and remove it.

Still, for emergencies like this, the reflection API's capability to mutate final fields remains but needs to be allowed by the application owner through command-line flags.
JDK 26 introduces two new options for that:

* `--enable-final-field-mutation` is a permanent option that allows specific modules to mutate final fields
* `--illegal-final-field-mutation` is a temporary option with values `allow`, `warn` (default on JDK 26), `debug`, and `deny` (future default) that manages how code without specific permission that tries to mutate final fields will be handled

[JEP 500](https://openjdk.org/jeps/500) as well as [Inside Java Newscast #101](https://www.youtube.com/watch?v=bdHkbEIdBAs) discuss the use of these options as well as their interaction with strong encapsulation in detail, which is particularly important for application maintainers.

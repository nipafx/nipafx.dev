---
title: "Java and AI? - Inside Java Newscast #72"
tags: [ai, java-next, project-valhalla, project-babylon, project-panama]
date: 2024-07-04
slug: inside-java-newscast-72
videoSlug: inside-java-newscast-72
description: "AI development can be split into three categories: developing an ML model (where Java isn't competitive and is unlikely to become top of the class any time soon), developing an AI-centered product (where Java is well-positioned and will become stringer soon; but does this category matter in the long run?) and adding AI-based features to larger projects (where Java is already very good and will only become stronger thanks to Valhalla's value types, Panama's FFM and vector APIs, and Babylon's code reflection)."
featuredImage: inside-java-newscast-72-b
---

"AI in Java is bad" is a commonly held opinion out there that I, without knowing much about this space, grudgingly accepted.
But, being a Java fanboy I was annoyed by that and I was waiting for Valhalla, Panama, and Babylon to make sufficient progress, so I could make a video about how AI in Java may suck now, but will be _so good_ in the future.
But that's not this video!
When I recently started looking into the topic, I realized that "AI in Java is bad" is a pretty myopic view that, if it's correct at all, really only applies to this very moment in AI development and that Java is already well-positioned for the future of AI.
And _on top_ of that come Valhalla, Panama, and Babylon.
Let me explain.

<!-- Logo -->

Welcome everyone to the Inside Java Newscast, where we cover recent developments in the OpenJDK community.
I'm Nicolai Parlog, Java Developer Advocate at Oracle, and today we're gonna look at Java and AI.
A quick note before we start:
I know that artificial intelligence is more than just machine learning, but since the current AI wave is basically exclusively ML-based, I'll use the terms interchangeably in this video.
Ready?
Then let's dive right in!


## Three Kinds of AI

I want to split AI development into three categories.

The first one is _developing_ a machine learning model.
Collecting data, preparing it for learning, developing and training the model, evaluating and iterating on it - all the "original" machine learning tasks.
The output is a trained model that can classify inputs, generate images or texts, deny people life choices for inscrutable reasons, start nuclear war, etc.

Then there's _executing_ a machine learning model based on some inputs.
Note that trained models can be exported and imported by different languages, so this can be done on an entirely different platform than was used to train the model.
And thanks to [a distinction MKBHD made me aware of](https://www.youtube.com/watch?v=sDIi95CqTiM), I want to split execution into two categories.

One (and the second overall category) is development of a _product_ centered around such an ML model, like ChatGPT or the Humane AI pin.
This is mostly regular greenfield software development, except that requirements for running these models, like availability of ML libraries or ease of pushing computations onto the GPUs, dominate the overall requirements.

The other (and third) category is integration of a machine learning model as a _feature_ into larger, often pre-existing products.
Think of auto-tagging and searching in Google Photos, auto-subtitling in PowerPoint, and pretty much everything Apple has just presented at WWDC.
Here, AI is just one of many requirements, one of many forces acting on the project and in the case of brownfield development (what a word), these forces and the path of least resistance are mostly known and running the model must fit in with the existing architecture.

Let's look at each of these three categories separately and see how suitable Java is for them and what features may improve it.
We'll start with the last one and work our way backwards from there.


## AI Features in Java

The easiest case for AI in Java is when model execution needs to be added to an existing Java project.
Of course, in many situations you could create a new service in an arbitrary language, and incorporate that in your project via a REST API or as foreign code, but, realistically, you'd probably try to avoid that due to the developmental and operational complexity.
In this scenario, Java doesn't need to be the best ecosystem for executing the model, it just needs to be better than using a different one minus the additional effort of having it as a separate service and platform.

And similar logic applies when creating a new project where AI is just one of many features.
Java may not be the best ecosystem just for model execution but it is really strong and often top of its class in many other important development aspects: strong typing, good abstractions and core library, memory safety, performance, observability, security, cloud support, web server and framework choice, 3rd party library choice in general, development speed, developer base, stability, and the list goes on and on.

All that puts Java high up on the list for projects that include AI-based features assuming its support for model execution is sufficiently good.
So how good is it?
On the library and runtime front, Java offers a number of strong options:
[TornadoVM](https://www.tornadovm.org/), [ONNX Runtime](https://onnxruntime.ai/), [DJL](https://djl.ai/), [Tribuo](https://tribuo.org/), [LangChain4j](https://docs.langchain4j.dev/), just to name a few.
Many already support multi-CPU, GPU, and even FPGA-accelerated computation and, where applicable, we can expect their integration with native libraries to improve due to the recent finalization of the foreign-function-and-memory API.

And some OpenJDK projects are working on features that will further improve Java's capabilities in this space, potentially dramatically, and particularly when it comes to executing models in pure Java:

* [Project Valhalla](https://openjdk.org/projects/valhalla/) aims to give us the capability to define types that "code like a class, work like an int", which is relevant here because models like to use primitives like half-floats that Java currently doesn't support.
  Beyond that, Valhalla will allow us to write performant code that doesn't have to sacrifice good design and maintainability, which is essential for every software project that will run in production for anything longer than a few months.
  And another idea Valhalla might, might (!), MIGHT (!) explore is limited operator overloading, which may allow us to define, for example, multiplication for custom scalar... scalars?
  Scalars? Sc... tensors and sca, scalars.
  That's what you get for studying math in German. Skalare.
  Anyway... for custom scalars and tensors.
* Then there's [Panama](https://openjdk.org/projects/panama/)'s [vector API](https://openjdk.org/jeps/469), which can speed up CPU-based computations dramatically.
* And finally, and most directly aimed at AI, there's [Project Babylon](https://openjdk.org/projects/babylon/).
  Its goal is to allow Java code to parse other Java code and derive new code that could either be a different Java program or any kind of foreign code, in this context specifically, code that can be executed by a GPU.
  I strongly recommend [Inside Java Newscast #58](https://www.youtube.com/watch?v=q8pxRkdKeR0) for a primer on Project Babylon.
  As part of his work on the project, its lead [Paul Sandoz explored how to implement Triton](https://openjdk.org/projects/babylon/articles/triton) (that's a domain-specific Python platform for GPU computation) in pure Java and got really good results.

<contentvideo slug="inside-java-newscast-58"></contentvideo>

So the Java ecosystem for executing ML models is already pretty strong and Valhalla's value types, Panama's FFM and vector APIs, and Babylon's code reflection will only strengthen it further, whether by better integrating with native code or by enabling pure Java implementations with similar performance, giving projects the benefit of using just one stack for the entire system or service.

Of course even if we ignore the rest of the application and focus on just running a model, the code that does that consists of more than calling `predictor.predict`.
Input data needs to be prepared before it can be thrown at the model and, likewise, its output needs to be interpreted and transformed into something the user can understand.
This is likely to be a considerable portion of the overall code for model execution and Java's strengths apply here as well, particularly its good performance characteristics and its recently improved support for designing data-centric applications.
So, yeah, I'm not worried about Java when it comes to projects using AI as a feature.


## AI Products in Java

Most of what we just discussed also applies to developing an AI-centered product in Java.
But of course, the larger the AI portion, the more strengths and weaknesses in that area dominate the overall evaluation of which platform to use.
At this moment, is Java the best for just running an ML model?
No.
Is it the best for developing an AI-centric product once we factor in the surrounding requirements we talked about in the previous section?
Maybe, it's definitely up there.
Will it be the best once all the projects I mentioned earlier bear fruit?
I think it can be, yes.

But here's a more interesting question:
Does it matter?
I really liked MKBHD's opinion on this and, by the way, the [link to his video](https://www.youtube.com/watch?v=sDIi95CqTiM) as well to everything else I mention here is of course in the description.
He makes a good argument for "AI as a product" being mostly a fad.
For AI becoming mostly "just" a feature in all kinds of other applications.
So as it looks now, I don't think this category is particularly important.


## AI Development in Java

Which leaves us with the last category: developing machine learning models in Java and his is a tough one.
It needs everything we described so far and then some.

AI development is often done by people who don't see themselves as being primarily a software developer and so they value different things about a platform than other developers might:

* ease of learning the language
* example code bases are always very important
* how quick you get to the first usable results
* simplicity over choice
* and also (occasionally or maybe even often) simplicity over robustness

If certain language features only become beneficial when you maintain a project of sufficient size for a sufficient time but appear to be in the way early on, enforcing their use can quickly be seen as a downside.
Looking at you, explicit static typing and checked exceptions.
Thanks to Project Amber's on-ramp efforts, Java made and will keep making significant progress in this area, but it will never be a scripting language.

More importantly, though, elegant model development requires a number of specific language features and libraries:

* a type system that can easily handle heterogenous data
* some degree of operator overloading is super helpful
* ease of use when working with mathematical functions (for example for differentiation)
* libraries that were designed to classify and analyze large data sets
* and really good and easy-to-use visualization tools

And Python is and will probably remain king here.
The language is well-suited to these kinds of applications and thanks to that has been the platform of choice for data scientists for about two decades now, which gives it a big leg up on libraries and frameworks in that space.

So Java isn't competitive when it comes to developing machine learning models and isn't top-of-the-class in creating AI-centered products and this lead to the general opinion that "AI in Java is bad".
But this is due to our current place in the AI timeline and overlooks the already dawning reality that a big chunk of AI related development work will be its integration into other projects and there Java is already very competitive and will only become stronger in the coming years, thanks to projects like Valhalla, Panama, and Babylon.

If you want to follow that development along, make sure to subscribe if you haven't yet, as we will cover every new Java feature as it hatches.
And if you enjoyed this video, you can do me a favor and leave a like, which also helps putting it in front of more developers.
I'll see you again in two weeks.
So long...

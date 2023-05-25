---
title: "Data-Oriented Programming in Java (21)"
tags: [pattern-matching, sealed, project-amber]
date: 2022-09-27
slug: talk-java-pattern-matching
description: "Data-oriented programming models data as data: records for entities and sealed types for alternatives. Combined with pattern matching we can define operations on the data without overloading it with functionality."
featuredImage: java-dop
slides: https://slides.nipafx.dev/patterns
videoSlug: java-dop-voxxed-bucharest-2023
---

In data-oriented programming (DOP), we model data as data and polymorphic behavior with pattern matching.
This talk will introduce the concept of DOP and its four principles:

* model the data, the whole data, and nothing but the data
* data is immutable
* validate at the boundary
* make illegal states unrepresentable

We'll also explore how to use pattern matching as a safe, powerful, and maintainable mechanism for ad-hoc polymorphism on such data that lets us define operations without overloading the types with functionality.
The talk ends with a juxtaposition to OOP, so you not only learn how to employ DOP but also when (not).

<!--
# Daten-orientierte Programmierung in Java (21)

In Daten-orientierter Programmierung (DOP) modellieren wir Daten als Daten und implementieren polymorphes Verhalten mit Pattern Matching. Dieser Vortrag führt das Konzept von DOP und seine vier Leitprinzipien ein:

* Modelliere die Daten, die ganzen Daten und nichts als die Daten
* Daten sind unveränderlich
* Validiere an der Grenze
* Mache illegale Zustände unrepräsentierbar

Wir werden außerdem erkunden wie Pattern Matching als sicherer, mächtiger und wartbarer Mechanismus für ad-hoc Polymorphismus eingesetzt werden kann und uns erlaubt vielfältige Operationen auf diesen Typen zu implementieren ohne sie mit Funktionalität zu überladen. Der Vortrag endet mit einer Gegenüberstellung mit Objekt-orientierter Programmierung, so dass wir nicht nur sehen wie man DOP einsetzt sondern auch wann (nicht).
-->

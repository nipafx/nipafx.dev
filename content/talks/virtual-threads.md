---
title: "Scaling Simply with Virtual Threads"
tags: [project-loom, java-21]
date: 2023-05-24
slug: talk-virtual-threads
description: "Virtual threads combine the simplicity of blocking code with the resource efficiency and scalability of reactive programming and in this talk you're going to learn how they do that and how you can use them in your project"
featuredImage: virtual-threads-loom
slides: https://slides.nipafx.dev/virtual-threads
---

When every request coming into a system runs in its own thread but keeps blocking it for outgoing requests to the file system, databases, or other services, the number of threads the system supports quickly becomes the limiting factor for scaling up throughput.
Reactive programming solves this problem by only occupying platform threads when they are actually needed, thus offering better scalability, but comes at a cost: developing, maintaining, debugging, observing, and benchmarking code becomes more challenging.

Virtual threads combine the simplicity of blocking code with the resource efficiency and scalability of reactive programming and in this talk you're going to learn how they do that and how you can use them in your project.

<!--
# Einfach Skalieren mit Virtuellen Threads

Wenn jeder Request an ein Web Backend seinen eigenen Thread bekommt, diesen dann aber für Anfragen an das Dateisystem, Datenbanken oder andere Services blockt, wird die Anzahl der Threads, die das System erlaubt, schnell der limitierende Faktor bei der Skalierung des Durchsatzes.
Reaktive Programmierung löst das System, indem sie nur dann Plattform-Threads besetzt, wenn diese auch benötigt werden - also nicht beim Warten.
Das verbessert die Skalierbarkeit (teilweise deutlich), aber ist nicht umsonst: Entwicklung, Wartung, Debugging, Monitoring und Optimierung werden herausfordernder.

Virtuelle Threads vereinen die Einfachheit von blockendem Code mit der Ressourceneffizienz und Skalierbarkeit von reaktiver Programmierung und in diesem Talk werden wir uns anschauen wie sie das schaffen und wie du sie in deinem Projekt nutzen kannst.
-->

import React from "react"

import stub from "../infra/stubs"

import PostLayout from "../layout/post"
import PostContent from "../components/postContent"
import SiteLayout from "../layout/site"

import * as style from "./25h-java.module.css"

const Java25hPage = () => {
	const { meta, header, content } = stub(`25h-java`)

	return (
		<SiteLayout className="event" meta={meta}>
			<PostLayout {...header}>
				<PostContent {...content} />
				<Schedule />
			</PostLayout>
		</SiteLayout>
	)
}

const Schedule = () => (
	<div className={style.schedule}>
		{entry(
			new Date(2020, 4, 23, 6),
			new Date(2020, 4, 23, 7),
			"overflow",
			"Java 9-14 on StackOverflow",
			"We warm up with 9-14 questions."
		)}
		{entry(
			new Date(2020, 4, 23, 7),
			new Date(2020, 4, 23, 8),
			"birthday",
			"Birthday 🥳 Cake 🎂 Java Q&A",
			"Java's official birthday begins!"
		)}
		{entry(
			new Date(2020, 4, 23, 8),
			new Date(2020, 4, 23, 9),
			"stream",
			"Stream Exception Handling",
			"Let's explore and discuss."
		)}
		{entry(
			new Date(2020, 4, 23, 9),
			new Date(2020, 4, 23, 11),
			"kevlin",
			"Kevlin Henney",
			"We discuss a few of the 97 things Java devs should know. Then we draw from Kevlin's extensive experience in software to learn about Java's place in history."
		)}
		{entry(
			new Date(2020, 4, 23, 11),
			new Date(2020, 4, 23, 13),
			"jms",
			"The Java Module System",
			"First a quick ride through the module system basics before we take a closer look at jlink and services."
		)}
		{entry(
			new Date(2020, 4, 23, 13),
			new Date(2020, 4, 23, 15),
			"trisha",
			"Trisha Gee",
			"What does it take to have a career as a software developer? Which skills do you need and what should you look out for?"
		)}
		{entry(
			new Date(2020, 4, 23, 15),
			new Date(2020, 4, 23, 17),
			"junit",
			"JUnit 5 Extension",
			"Maybe the coolest aspect of JUnit 5 is its extensibility. I show you theory and practice of writing your own extensions."
		)}
		{entry(
			new Date(2020, 4, 23, 17),
			new Date(2020, 4, 23, 18),
			"next",
			"Java Releases & Distributions",
			"Releases, licenses, support, ..."
		)}
		{entry(
			new Date(2020, 4, 23, 18),
			new Date(2020, 4, 23, 19),
			"martijn",
			"Martijn Verburg",
			"What AdoptOpenJDK can do for us."
		)}
		{entry(
			new Date(2020, 4, 23, 19),
			new Date(2020, 4, 23, 20),
			"projects",
			"Amber, Valhalla, Loom, Leyden",
			"What are they about?"
		)}
		{entry(
			new Date(2020, 4, 23, 20),
			new Date(2020, 4, 23, 22),
			"brian",
			"Brian Goetz",
			"Default mutability/nullability, serialization, primitives, ... appear anachronistic. But are they? Did Java need them to be successful? Brian is here to discuss."
		)}
		{entry(
			new Date(2020, 4, 23, 22),
			new Date(2020, 4, 23, 23, 30),
			"java9",
			"Going to Java 9",
			"How to upgrade, what to look forward to (besides modules) - in theory and practice."
		)}
		{entry(
			new Date(2020, 4, 23, 23, 30),
			new Date(2020, 4, 24, 0),
			"christian",
			"Christian Stein",
			"A guide to Bach.java."
		)}
		{entry(
			new Date(2020, 4, 24, 0),
			new Date(2020, 4, 24, 2),
			"java1011",
			"Going to Java 10 and Java 11",
			"Java 10 and 11 come with a bunch of API and JVM improvements that we can take a look at. Once again, we will apply some of those in practice."
		)}
		{entry(
			new Date(2020, 4, 24, 2),
			new Date(2020, 4, 24, 4),
			"venkat",
			"Venkat Subramaniam",
			"Venkat is a true polyglot programmer and will help us place Java into the larger software development landscape."
		)}
		{entry(
			new Date(2020, 4, 24, 4),
			new Date(2020, 4, 24, 5),
			"var",
			"Fun with var",
			"Intersection types? Traits? Yes!"
		)}
		{entry(
			new Date(2020, 4, 24, 5),
			new Date(2020, 4, 24, 6),
			"java1214",
			"Going to Java 12 to Java 14",
			"Cool features in theory and practice."
		)}
		{entry(
			new Date(2020, 4, 24, 6),
			new Date(2020, 4, 24, 7),
			"sharat",
			"SharatChander",
			"Hanging out, discussing community."
		)}
	</div>
)

const entry = (startDate, endDate, area, topic, description) => {
	return (
		<div className={style.entry} style={{ gridArea: area }}>
			<p className={style.date}>
				{/* <span className={style.day}>{day(startDate)}</span> */}
				<span className={style.startTime}>{time(startDate)}</span>
				<span className={style.endTime}>{time(endDate, true)}</span>
			</p>
			<h3 className={style.topic}>{topic}</h3>
			<p className={style.description}>{description}</p>
		</div>
	)
}

const day = date => {
	switch (date.getDate()) {
		case 1:
			return `1st`
		case 2:
			return `2nd`
		case 3:
			return `3rd`
		case 21:
			return `21st`
		case 22:
			return `22nd`
		case 23:
			return `23rd`
		case 31:
			return `31st`
		default:
			return date.getDate() + "th"
	}
}

const time = (date, showUtc) => {
	let minutes = date.getMinutes()
	if (minutes < 10) minutes = "0" + minutes
	return date.getHours() + ":" + minutes + (showUtc ? " UTC" : "")
}

export default Java25hPage

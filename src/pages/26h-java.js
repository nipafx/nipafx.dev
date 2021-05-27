import React from "react"

import stub from "../infra/stubs"
import { classNames } from "../infra/functions"

import PostLayout from "../layout/post"
import PostContent from "../components/postContent"
import SiteLayout from "../layout/site"
import MarkdownAsHtml from "../infra/markdownAsHtml"

import * as style from "./26h-java.module.css"
import * as layout from "../layout/container.module.css"

const Java26hPage = () => {
	const { meta, header, content } = stub(`26h-java`)

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
	<div className={layout.container}>
		<div {...classNames(style.schedule, layout.siteHeader)}>
			{entry(
				"overflow",
				new Date(2021, 4, 29, 6),
				new Date(2021, 4, 29, 7),
				"nipafx",
				"Java 11-16 // StackOverflow"
			)}
			{entry(
				"pioneer",
				new Date(2021, 4, 29, 7),
				new Date(2021, 4, 29, 13),
				"nipafx",
				"JUnit Pioneer // hack.commit.push",
				"Pioneer participates in [hack.commit.push](https://paris2021.hack-commit-pu.sh/) and Nicolai will stream his end of it."
			)}
			{entry(
				"quarkus",
				new Date(2021, 4, 29, 13),
				new Date(2021, 4, 29, 14),
				"sebi",
				"Discovering Quarkus"
			)}
			{entry(
				"jbang",
				new Date(2021, 4, 29, 14),
				new Date(2021, 4, 29, 15),
				"sebi",
				"Exploring JBang"
			)}
			{entry(
				"pacman",
				new Date(2021, 4, 29, 15),
				new Date(2021, 4, 29, 16),
				"sebi",
				"Developing Pacman",
				"Sebastian has a Pacman clone with a Java backend and cool Kafka stuff that he'll be working on."
			)}
			{entry(
				"ama",
				new Date(2021, 4, 29, 16),
				new Date(2021, 4, 29, 17),
				"nipafx",
				"Java AMA"
			)}
			{entry(
				"ron",
				new Date(2021, 4, 29, 17),
				new Date(2021, 4, 29, 18),
				"nipafx",
				"Ron Pressler // State of Loom",
				"Ron Pressler, Lead of [Project Loom](https://wiki.openjdk.java.net/display/loom/Main), will be here to talk about the project."
			)}
			{entry(
				"maurizio",
				new Date(2021, 4, 29, 18),
				new Date(2021, 4, 29, 19),
				"nipafx",
				"Maurizio Cimadamore // State of Panama",
				"Maurizio Cimadamore, Lead of [Project Panama](https://openjdk.java.net/projects/panama/), will be there to talk about the project."
			)}
			{entry(
				"brian",
				new Date(2021, 4, 29, 19),
				new Date(2021, 4, 29, 20),
				"nipafx",
				"Brian Goetz // State of Amber & Valhalla",
				"Brian Goetz, Lead of Projects [Amber](https://openjdk.java.net/projects/amber/) and [Valhalla](https://openjdk.java.net/projects/valhalla/), will be there to talk about the projects."
			)}
			{entry(
				"late",
				new Date(2021, 4, 29, 20),
				new Date(2021, 4, 29, 21),
				"nipafx",
				"Exploring Java 17",
				"Java 17 is entering the home stretch - let's look over the list of targeted JEPs."
			)}
			{entry(
				"pratik",
				new Date(2021, 4, 29, 21),
				new Date(2021, 4, 30, 22),
				"billy",
				"Pratik Patel // Java on Cloud",
				"Pratik Patel is a technologist/futureist, former Lead Java Developer Advocate at IBM, Java Champion, and community organizer."
			)}
			{entry(
				"josh",
				new Date(2021, 4, 29, 22),
				new Date(2021, 4, 30, 23),
				"billy",
				"Josh Long // Spring Native",
				"Josh is a Spring Developer Advocate, Java Champion, author, podcaster, screencaster... just all the things and more."
			)}
			{entry(
				"billy",
				new Date(2021, 4, 29, 23),
				new Date(2021, 4, 30, 0),
				"billy",
				"Java, Java, Java",
				"Billy does some live-coding."
			)}
			{entry(
				"ted",
				new Date(2021, 4, 30, 0),
				new Date(2021, 4, 30, 5),
				"ted",
				"Remote Mob Registration",
				"Ted will work on his _Remote Mob Registration System_, built with Java 16, Spring Boot 2.5, and a Thymeleaf-based front-end. It goes without saying that it was lovingly TDD'd."
			)}
			{entry(
				"just",
				new Date(2021, 4, 30, 5),
				new Date(2021, 4, 30, 8),
				"nipafx",
				"Why don't they just...?!",
				"Nicolai needs to turn a bunch of blog posts and notes into [a talk](/talk-just) that he'll give just a few days later, so out of desperation, he works on it during the live stream. 🤦 It's a fun talk, though, about why Java doesn't have immutable collections, a truly monadic `Optional`, `?.` for null-safe member selection, and more."
			)}
		</div>
	</div>
)

const entry = (area, startDate, endDate, streamer, topic, description) => {
	const { text, url } = streamerLink(streamer)
	return (
		<div {...classNames(style.entry, style[streamer])} style={{ gridArea: area }}>
			<p className={style.date}>
				<span className={style.startTime}>{time(startDate)}</span>
				<span className={style.endTime}>{time(endDate, true)}</span>
			</p>
			<h3 className={style.topic}>{topic}</h3>
			<p className={style.description}>
				{description && <MarkdownAsHtml>{description}</MarkdownAsHtml>}
			</p>
			<a className={style.link} href={url}>
				{text}
			</a>
		</div>
	)
}

const streamerLink = streamer => {
	switch (streamer) {
		case "sebi":
			return {
				text: "on Sebastian's YouTube",
				url: "https://www.youtube.com/user/sebi2706",
			}
		case "billy":
			return {
				text: "on KCJUG's YouTube",
				url: "https://www.youtube.com/watch?v=4e2wwQgFc2E",
			}
		case "ted":
			return {
				text: "on Ted's Twitch",
				url: "https://www.twitch.tv/jitterted",
			}
		default:
			return {
				text: "on Nicolai's Twitch",
				url: "https://twitch.tv/nipafx",
			}
	}
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

export default Java26hPage

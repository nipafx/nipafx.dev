import React from "react"

import { DateTime } from "luxon"

import { ordinalDay } from "../infra/functions"

import EventList from "./eventList"
import { H2, H3 } from "./headings"
import Link from "./link"

import style from "./presentationList.module.css"
import layout from "../layout/container.module.css"

import data from "../../content/meta/presentations.json"

const PresentationList = ({ slug }) => {
	const presentations = extractPresentationsForTalk(slug)
	return (
		<React.Fragment>
			{presentations.upcoming.length > 0 && (
				<React.Fragment>
					<H2 id="upcoming">Upcoming Presentations</H2>
					<p>{upcomingText(presentations.upcoming)}</p>
					<EventList
						events={prepareEvents(presentations.upcoming)}
						className={layout.main}
					>
						{presentations.upcoming.map(present)}
					</EventList>
				</React.Fragment>
			)}
			{presentations.pastByYear.length > 0 && (
				<React.Fragment>
					<H2 id="past">Past Presentations</H2>
					<p>{pastText(presentations.pastByYear)}</p>
					{presentations.pastByYear.map(pres => (
						<React.Fragment key={pres.year}>
							<H3 id={pres.year}>{pres.year}</H3>
							<EventList
								events={prepareEvents(pres.presentations)}
								className={layout.main}
							>
								{pres.presentations.map(present)}
							</EventList>
						</React.Fragment>
					))}
				</React.Fragment>
			)}
		</React.Fragment>
	)
}

const extractPresentationsForTalk = slug => {
	const presentations = extractPresentations().filter(presentation => presentation.slug === slug)
	const today = DateTime.local()
	const pastByYear = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016]
		.map(year => {
			return {
				year,
				presentations: presentations
					.filter(pres => pres.time.year === year)
					.filter(pres => pres.time < today)
					.sort(
						// pres2 - pres1 to get most recent presentation ("largest" date) first
						(pres1, pres2) => pres2.time - pres1.time
					),
			}
		})
		.filter(pres => pres.presentations.length > 0)
	const upcoming = presentations
		.filter(pres => pres.time >= today)
		.sort((pres1, pres2) => pres1.time - pres2.time)

	return { pastByYear, upcoming }
}

const extractPresentations = () => {
	return data.events.flatMap(event =>
		event.presentations.map(presentation => {
			return {
				slug: presentation.talk,
				title: presentation.title,
				announcement: extractAnnouncement(
					presentation.announcement,
					presentation.program,
					presentation.programEntry
				),
				time: parseTime(presentation.time),
				location: extractLocation(presentation.location, presentation.locationText),
				slidesUrl: presentation.slides,
				videoUrl: presentation.video,
				misc: presentation.misc,
				event: event.event,
			}
		})
	)
}

const extractAnnouncement = (announcement, program, programEntry) => {
	if (announcement)
		return {
			text: "announcement",
			url: announcement,
		}
	if (program)
		return {
			text: "program",
			url: program,
		}
	if (programEntry)
		return {
			text: "program entry",
			url: programEntry,
		}
}

const parseTime = timeString =>
	DateTime.fromFormat(timeString, "dd.MM.yyyy HHmm z", { setZone: true })

const extractLocation = (location, locationText) => {
	if (!location && !locationText) return undefined
	return {
		text: location && location.text ? location.text : locationText,
		url: location ? location.url : null,
	}
}

const upcomingText = upcoming => {
	const intro =
		upcoming.length === 1
			? `In the coming months, I'll present this talk at ${upcoming[0].event.name}.`
			: upcoming.length === 2
			? `In the coming months, I'll present this talk at ${upcoming[0].event.name} and ${upcoming[1].event.name}.`
			: `In the coming months, I'll present this talk at ${upcoming[0].event.name} and a few other conferences.`
	return `${intro} If you're there as well, I'd love to meet you - I'm always up for a chat. 😁 Just flag me down when you see me.`
}

const pastText = pastByYear => {
	const numberOfPresentations = pastByYear
		.map(pres => pres.presentations.length)
		.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
	const intro =
		numberOfPresentations === 1
			? `I gave this talk once before.`
			: numberOfPresentations === 2
			? `I gave this talk twice before.`
			: `I gave this talk a few times before.`
	return `${intro} See below for links to slides (as they were at that very event), videos, and other information.`
}

const prepareEvents = presentations =>
	presentations.map(pres => {
		return {
			name: pres.event.showName ? pres.event.name : undefined,
			url: pres.event.url,
			image: pres.event.image,
		}
	})

const present = presentation => {
	return (
		<dl key="coordinates" className={style.coordinates}>
			{presentLocation(
				presentation.event.name,
				presentation.event.url,
				presentation.location
			)}
			{presentation.time && presentDate(presentation.time)}
			{(presentation.announcement || presentation.slidesUrl || presentation.videoUrl) &&
				presentLinks(
					presentation.announcement,
					presentation.slidesUrl,
					presentation.videoUrl
				)}
			{presentation.misc && presentMisc(presentation.misc)}
		</dl>
	)
}

const presentLocation = (name, url, location) => {
	return (
		<React.Fragment>
			<dt>Where?</dt>
			<dd>
				<Link to={url}>{name}</Link>
				{location && (
					<React.Fragment>
						<br />
						<Link to={location.url}>{location.text}</Link>
					</React.Fragment>
				)}
			</dd>
		</React.Fragment>
	)
}

const presentDate = time => {
	const day = `${time.toFormat("EEE, MMMM")} ${ordinalDay(time.day)}, ${time.toFormat("yyyy")}`
	return (
		<React.Fragment>
			<dt>When?</dt>
			<dd>
				<span>{day}</span>
				<br />
				<span>{time.toFormat("HH:mm z")}</span>
			</dd>
		</React.Fragment>
	)
}

const presentLinks = (announcement, slidesUrl, videoUrl) => {
	return (
		<React.Fragment>
			<dt>What?</dt>
			<dd className={style.else}>
				{announcement && (
					<span>
						<Link to={announcement.url}>{announcement.text}</Link>
					</span>
				)}
				{slidesUrl && (
					<span>
						<Link to={slidesUrl}>slides</Link>
					</span>
				)}
				{videoUrl && (
					<span>
						<Link to={videoUrl}>video</Link>
					</span>
				)}
			</dd>
		</React.Fragment>
	)
}

const presentMisc = misc => {
	return (
		<React.Fragment>
			<dt>What else?</dt>
			<dd className={style.else}>
				{misc.map(({ text, url }) => (
					<span>
						<Link to={url}>{text}</Link>
					</span>
				))}
			</dd>
		</React.Fragment>
	)
}

export default PresentationList

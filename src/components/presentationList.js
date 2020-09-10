import React from "react"

import { DateTime } from "luxon"

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
				location: presentation.location,
				slidesUrl: presentation.slides,
				videoUrl: presentation.video,
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
		<dl className={style.coordinates}>
			{presentation.time && presentDate(presentation.time)}
			{presentation.location && presentLocation(presentation.location)}
			{(presentation.announcement || presentation.slidesUrl || presentation.videoUrl) &&
				presentMisc(
					presentation.announcement,
					presentation.slidesUrl,
					presentation.videoUrl
				)}
		</dl>
	)
}

const presentDate = time => {
	return (
		<React.Fragment>
			<dt>When?</dt>
			<dd>
				<span>{time.toFormat("EEE, MMMM d, yyyy")}</span>
				<br />
				<span>{time.toFormat("HH:mm z")}</span>
			</dd>
		</React.Fragment>
	)
}

const presentLocation = location => {
	const text = location.text || location
	const url = location.url
	return (
		<React.Fragment>
			<dt>Where?</dt>
			<dd>{url ? <Link to={url}>{text}</Link> : text}</dd>
		</React.Fragment>
	)
}

const presentMisc = (announcement, slidesUrl, videoUrl) => {
	return (
		<React.Fragment>
			<dt>What else?</dt>
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

export default PresentationList

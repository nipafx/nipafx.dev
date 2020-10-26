import React from "react"

import { DateTime } from "luxon"

import { classNames } from "../infra/functions"

import Image from "./image"
import Link from "./link"
import MarkdownAsHtml from "../infra/markdownAsHtml"

import style from "./event.module.css"

import presentationData from "../../content/meta/presentations.json"
import sessionData from "../../content/meta/sessions.json"

const Event = ({ event, presentDate, className }) => {
	const { url, image, title, description, location } = event
	return (
		<div {...classNames(style.card, className)}>
			{presentDate && <span className={style.date}>{presentDate(event)}</span>}
			{title && (
				<h3 className={style.title}>
					<MarkdownAsHtml>{title}</MarkdownAsHtml>
				</h3>
			)}
			{description && (
				<MarkdownAsHtml className={style.description}>{description}</MarkdownAsHtml>
			)}
			<span className={style.filler} />
			{location && <MarkdownAsHtml className={style.location}>{location}</MarkdownAsHtml>}
			{image && (
				<Link to={url} className={style.link}>
					<div className={style.cover}>
						<Image id={image} type="eventCard" className={style.logo} />
					</div>
				</Link>
			)}
		</div>
	)
}

/*
 * TALKS / PRESENTATIONS
 */

export const getPresentationsByYear = slug => {
	const presentations = getPresentations(slug)
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

const getPresentations = slug => {
	let presentations = presentationData.events.flatMap(event =>
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

	if (slug) presentations = presentations.filter(presentation => presentation.slug === slug)

	return presentations
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

/*
 * COURSES / SESSIONS
 */

export const getSessionsByYear = slug => {
	const sessions = extractSessions().filter(session => session.courses.includes(slug))
	const today = DateTime.local()
	const pastByYear = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016]
		.map(year => {
			return {
				year,
				sessions: sessions
					.filter(session => session.dates.from.year === year)
					.filter(session => session.dates.from < today)
					.sort(
						// pres2 - pres1 to get most recent session ("largest" date) first
						(session1, session2) => session2.dates.from - session1.dates.from
					),
			}
		})
		.filter(sess => sess.sessions.length > 0)
	const upcoming = sessions
		.filter(session => session.dates.from >= today)
		.sort((session1, session2) => session1.dates.from - session2.dates.from)

	return { pastByYear, upcoming }
}

const extractSessions = () => {
	return sessionData.sessions.map(session => {
		const dates = {
			from: DateTime.fromFormat(session.dates.from, "dd.MM.yyyy"),
			to: DateTime.fromFormat(session.dates.to, "dd.MM.yyyy"),
		}
		const location = session.location
			? {
					text: session.location.text ?? session.location,
					url: session.location.url,
			  }
			: null
		// for unknown reasons (Gatsby caching?) this parsing does not behave well
		// when `session.dates` is overridden with the parsed dates,
		// so I create a new object instead
		return { ...session, dates, location }
	})
}

export default Event

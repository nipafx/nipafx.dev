import React from "react"

import { DateTime } from "luxon"

import { classNames } from "../infra/functions"

import Image from "./image"
import Link from "./link"
import MarkdownAsHtml from "../infra/markdownAsHtml"

import * as style from "./event.module.css"

import presentationData from "../../content/meta/presentations.json"
import sessionData from "../../content/meta/sessions.json"

const Event = ({ event, presentDate, className }) => {
	const { title, description, host, location } = event
	return (
		<div itemScope itemType="https://schema.org/Event" {...classNames(style.card, className)}>
			{presentDate && <span className={style.date}>{presentDate(event)}</span>}
			{title && (
				<span key="title" {...classNames("h3", style.title)}>
					<MarkdownAsHtml itemProp="name">{title}</MarkdownAsHtml>
				</span>
			)}
			{presentDescription(description)}
			<span className={style.filler} />
			{presentLocation(host, location)}
			{host.image && (
				<Link key="image" to={host.url} className={style.link}>
					<div className={style.cover}>
						<Image id={host.image} type="eventCard" className={style.logo} />
					</div>
				</Link>
			)}
		</div>
	)
}

const presentDescription = description => {
	if (!description || !description.length) return null
	return (
		<div key="description" className={style.description}>
			{description.map(d => (
				<span key={d.url}>
					<Link to={d.url}>{d.text}</Link>
				</span>
			))}
		</div>
	)
}

const presentLocation = (host, location) => {
	// this implies that unknown locations are considered online events;
	// that's just a guess, but for offline events, I usually know the location
	const physical = location && !location.url
	const attendanceMode = physical
		? "https://schema.org/OfflineEventAttendanceMode"
		: "https://schema.org/OnlineEventAttendanceMode"
	const locationType = physical
		? "https://schema.org/Place"
		: "https://schema.org/VirtualLocation"

	return (
		<React.Fragment>
			<div
				key="location"
				itemScope
				itemProp="location"
				itemType={locationType}
				className={style.location}
			>
				<Link to={host.url}>at {host.name}</Link>
				{location && (
					<React.Fragment>
						<br />
						<Link to={location.url}>{location.text}</Link>
					</React.Fragment>
				)}
				{physical ? (
					<span itemScope itemProp="address" itemType="https://schema.org/PostalAddress">
						<meta itemProp="name" content={location.text} />
					</span>
				) : (
					// use host URL as fallback for virtual events without location URL
					<meta itemProp="url" content={location?.url ?? host.url} />
				)}
			</div>
			<meta itemProp="eventAttendanceMode" content={attendanceMode} />
			<span itemScope itemProp="organizer" itemType="https://schema.org/Organization">
				<meta itemProp="name" content={host.name} />
				<meta itemProp="url" content={host.url} />
			</span>
			<span itemScope itemProp="performer" itemType="https://schema.org/Person">
				<meta itemProp="name" content="Nicolai Parlog (nipafx)" />
				<meta itemProp="url" content="https://nipafx.dev" />
			</span>
		</React.Fragment>
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
		const location =
			session.location ?? session.locationText
				? {
						text: session.locationText,
				  }
				: null
		// for unknown reasons (Gatsby caching?) this parsing does not behave well
		// when `session.dates` is overridden with the parsed dates,
		// so I create a new object instead
		return { ...session, dates, location }
	})
}

export default Event

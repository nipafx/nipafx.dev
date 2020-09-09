import React from "react"

import { DateTime } from "luxon"

import EventList from "./eventList"
import Link from "./link"

import style from "./sessionList.module.css"
import layout from "../layout/container.module.css"

import data from "../../content/meta/sessions.json"

const SessionList = ({ slug }) => {
	const sessions = extractSessionsForCourse(slug)
	console.log(sessions)
	return (
		<React.Fragment>
			<h2>Upcoming Public Sessions</h2>
			<p>{upcomingText(sessions.upcoming)}</p>
			<EventList events={prepareEvents(sessions.upcoming)} className={layout.main}>
				{sessions.upcoming.map(present)}
			</EventList>
			<h2>Past Public Sessions</h2>
			{sessions.pastByYear.map(sess => (
				<React.Fragment key={sess.year}>
					<h3>{sess.year}</h3>
					<EventList events={prepareEvents(sess.sessions)} className={layout.main}>
						{sess.sessions.map(present)}
					</EventList>
				</React.Fragment>
			))}
		</React.Fragment>
	)
}

const extractSessionsForCourse = slug => {
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
	return data.sessions.map(session => {
		const dates = {
			from: DateTime.fromFormat(session.dates.from, "dd.MM.yyyy"),
			to: DateTime.fromFormat(session.dates.to, "dd.MM.yyyy"),
		}
		// for unknown reasons (Gatsby caching?) this parsing does not behave well
		// when `session.dates` is overridden with the parsed dates,
		// so I create a new object instead
		return { ...session, dates }
	})
}

const upcomingText = upcoming => {
	const intro = `While I mostly provide these courses in-house, there's the occasional public session that everybody can attend.`
	if (upcoming.length === 0)
		return (
			<span>
				{intro} None are planned now, but if you{" "}
				<Link to="mailto:nicolai@nipafx.dev">get in touch</Link>, I'll let you know when
				that changes.
			</span>
		)

	const announcement =
		upcoming.length === 1
			? `In the coming months, I'll deliver this course at ${upcoming[0].event.name}.`
			: upcoming.length === 2
			? `In the coming months, I'll deliver this course at ${upcoming[0].event.name} and ${upcoming[1].event.name}.`
			: `In the coming months, I'll deliver this course at ${upcoming[0].event.name} and on a few other occasionans.`
	return `${intro} ${announcement} Check out the link${
		upcoming.length < 2 ? "" : "s"
	} below if you want to participate.`
}

const prepareEvents = sessions =>
	sessions.map(session => {
		return {
			name: session.event.showName ? session.event.name : undefined,
			url: session.announcement,
			image: session.event.image,
		}
	})

const present = session => {
	return (
		<dl key="coordinates" className={style.coordinates}>
			{session.dates && presentDates(session.dates)}
			{session.location && presentLocation(session.location)}
			{session.announcement &&
				// don't show announcement and sign-up details for past sessions
				session.dates.from >= DateTime.local() &&
				presentAnnouncement(session.announcement)}
		</dl>
	)
}

const presentDates = dates => {
	return (
		<React.Fragment>
			<dt>When?</dt>
			<dd>
				<span>{dates.from.toFormat("EEE, MMMM d")} to</span>
				<br />
				<span>{dates.to.toFormat("EEE, MMMM d, yyyy")}</span>
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

const presentAnnouncement = announcement => {
	return (
		<React.Fragment>
			<dt>What else?</dt>
			<dd>
				Check <Link to={announcement}>the event page</Link> for prices, exact content, and
				details on how to sign up.
			</dd>
		</React.Fragment>
	)
}

export default SessionList

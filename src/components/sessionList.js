import React from "react"

import { DateTime } from "luxon"

import { ordinalDay } from "../infra/functions"

import EventList from "./eventList"
import { H2, H3 } from "./headings"
import Link from "./link"

import style from "./sessionList.module.css"
import layout from "../layout/container.module.css"

import data from "../../content/meta/sessions.json"

const SessionList = ({ slug }) => {
	const sessions = extractSessionsForCourse(slug)
	return (
		<React.Fragment>
			<H2 id="upcoming">Upcoming Public Sessions</H2>
			<p>{upcomingText(sessions.upcoming)}</p>
			<EventList events={prepareEvents(sessions.upcoming)} className={layout.main}>
				{sessions.upcoming.map(present)}
			</EventList>
			{sessions.pastByYear.length > 0 && (
				<React.Fragment>
					<H2 id="past">Past Public Sessions</H2>
					{sessions.pastByYear.map(sess => (
						<React.Fragment key={sess.year}>
							<H3 id={sess.year}>{sess.year}</H3>
							<EventList
								events={prepareEvents(sess.sessions)}
								className={layout.main}
							>
								{sess.sessions.map(present)}
							</EventList>
						</React.Fragment>
					))}
				</React.Fragment>
			)}
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

const upcomingText = upcoming => {
	const intro = `While I mostly provide these courses in-house, there's the occasional public session that everybody can attend.`
	if (upcoming.length === 0)
		return (
			<span>
				{intro} None are planned now, but if you <Link to="contact">get in touch</Link>,
				I'll let you know when that changes.
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
			{presentLocation(session.event.name, session.announcement, session.location)}
			{session.dates && presentDates(session.dates)}
			{session.announcement &&
				// don't show announcement and sign-up details for past sessions
				session.dates.from >= DateTime.local() &&
				presentAnnouncement(session.announcement)}
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

const presentDates = dates => {
	const fromDay = `${dates.from.toFormat("EEE, MMMM")} ${ordinalDay(dates.from.day)} to`
	// prettier-ignore
	const toDay = `${dates.to.toFormat("EEE, MMMM")} ${ordinalDay(dates.to.day)}, ${dates.to.toFormat("yyyy")}`
	return (
		<React.Fragment>
			<dt>When?</dt>
			<dd>
				<span>{fromDay}</span>
				<br />
				<span>{toDay}</span>
			</dd>
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

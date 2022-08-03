import React from "react"

import { DateTime } from "luxon"

import { getSessionsByYear } from "./event"
import { ordinalDay } from "../infra/functions"

import EventList from "./eventList"
import { H2, H3 } from "./headings"
import Link from "./link"

import * as style from "./sessionList.module.css"
import * as layout from "../layout/container.module.css"

const SessionList = ({ slug }) => {
	const sessions = getSessionsByYear(slug)
	return (
		<React.Fragment>
			<H2 id="upcoming">Upcoming Public Sessions</H2>
			<p>{upcomingText(sessions.upcoming)}</p>
			<EventList
				events={prepareSessions(sessions.upcoming)}
				className={layout.main}
				presentDate={presentDates}
			/>
			{sessions.pastByYear.length > 0 && (
				<React.Fragment>
					<H2 id="past">Past Public Sessions</H2>
					{sessions.pastByYear.map(sess => (
						<React.Fragment key={sess.year}>
							<H3 id={sess.year}>{sess.year}</H3>
							<EventList
								events={prepareSessions(sess.sessions)}
								presentDate={presentDates}
								className={layout.main}
							/>
						</React.Fragment>
					))}
				</React.Fragment>
			)}
		</React.Fragment>
	)
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
			: `In the coming months, I'll deliver this course at ${upcoming[0].event.name} and on a few other occasions.`
	return `${intro} ${announcement} Check out the link${
		upcoming.length < 2 ? "" : "s"
	} below if you want to participate.`
}

const prepareSessions = sessions =>
	sessions.map(session => ({
		title: session.title,
		slug: session.slug,
		description: prepareDescription(session),
		host: session.event,
		url: session.announcement,
		location: session.location,
		dates: session.dates,
		reactKey: session.dates.from.toUTC().toISO() + "-" + session.dates.to.toUTC().toISO(),
	}))

const prepareDescription = ({ announcement, dates }) => {
	// don't show announcement and sign-up details for past sessions
	return announcement && dates.from >= DateTime.local()
		? [
				{
					url: announcement,
					text:
						"Check the event page for prices, exact content, and details on how to sign up.",
				},
		  ]
		: []
}

const presentDates = ({ dates }) => {
	return (
		<span>
			<span>{dates.from.toFormat("EEE")}, </span>
			<span className={style.day}>
				{dates.from.toFormat("MMMM")} {ordinalDay(dates.from.day)}
			</span>
			<span> to</span>
			<br />
			<span>{dates.to.toFormat("EEE")}, </span>
			<span className={style.day}>
				{dates.to.toFormat("MMMM")} {ordinalDay(dates.to.day)}
			</span>
			<span>, {dates.to.toFormat("yyyy")}</span>
			<meta
				itemProp="startDate"
				content={dates.from.toISO({ suppressSeconds: true, suppressMilliseconds: true })}
			/>
			<meta
				itemProp="endDate"
				content={dates.to.toISO({ suppressSeconds: true, suppressMilliseconds: true })}
			/>
		</span>
	)
}

export const createTableOfContentEntries = slug => {
	const toc = [
		{
			title: "Upcoming Public Sessions",
			anchor: "upcoming",
		},
	]
	const sessions = getSessionsByYear(slug)
	if (sessions.pastByYear.length > 0) {
		const years = sessions.pastByYear.map(({ year }) => {
			return {
				title: year,
				anchor: year,
			}
		})
		toc.push({
			title: "Past Public Sessions",
			anchor: "past",
			children: years,
		})
	}
	return toc
}

export default SessionList

import React, { useEffect } from "react"
import { graphql } from "gatsby"

import { DateTime } from "luxon"

import { arrayTo, classNames, ordinalDay } from "../infra/functions"

import SiteLayout from "../layout/site"
import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { PageHeader } from "../components/header"
import MarkdownAsHtml from "../infra/markdownAsHtml"
import Link from "../components/link"

import layout from "../layout/container.module.css"
import style from "./schedule.module.css"

import presentations from "../../content/meta/presentations.json"
import sessions from "../../content/meta/sessions.json"
import streams from "../../content/meta/streams.json"

const SchedulePage = ({ data }) => {
	useEffect(() => {
		if (window.location.hash !== `#fullscreen`) return

		document.querySelector(`header`).style.display = `none`
		document.querySelector(`footer`).style.display = `none`
		document.getElementById(PROGRESS_BAR_REFERENCE).classList.add(style.fullscreen)
		document
			.querySelectorAll(`.${style.monthSchedule}`)
			.forEach(element => element.classList.add(layout.fullWidth))
		return () => {
			document.querySelector(`header`).style.display = null
			document.querySelector(`footer`).style.display = null
			document.getElementById(PROGRESS_BAR_REFERENCE).classList.remove(style.fullscreen)
			document
				.querySelectorAll(`.${style.monthSchedule}`)
				.forEach(element => element.classList.remove(layout.fullWidth))
		}
	})

	const meta = {
		title: "Schedule",
		slug: "schedule",
		description: "My live streams, talks, courses, etc in the coming months.",
	}
	const eventsByMonth = getEventsByMonth(data.courses.nodes, data.talks.nodes)
	const description = `I regularly [stream on Twitch](https://twitch.tn/nipafx), [speak at conferences](/talks) and occasionally give of [my courses](/courses) in a public forum. Here's the schedule for the coming months.`
	const noEvents = `Looks like nothing's planned at the moment. 🏝️🍹`
	return (
		<SiteLayout className="page" meta={meta}>
			<main>
				<section id={PROGRESS_BAR_REFERENCE}>
					<div className={style.header}>
						<PageHeader title="Schedule" date={new Date()} description={description} />
					</div>
					<div className={layout.container}>
						{eventsByMonth.length === 0 ? (
							<p className={layout.header}>{noEvents}</p>
						) : (
							eventsByMonth.map(showMonth)
						)}
					</div>
				</section>
			</main>
		</SiteLayout>
	)
}

const showMonth = events => {
	const month = events[0].startTime.toFormat("LLLL yyyy")
	return (
		<div key={month} className={style.monthSchedule}>
			<h2 className={style.month}>{month}</h2>
			<div className={style.schedule} style={gridStyleForMonthWith(events)}>
				{events.map(showEvent)}
			</div>
		</div>
	)
}

const gridStyleForMonthWith = events => {
	const weekdaysWithEvents = events
		.flatMap(event =>
			event.days
				? event.days.map(day => event.startTime.set({ day })).map(day => day.weekday)
				: [event.startTime.weekday]
		)
		.sort()
		.filter((value, index, self) => index === 0 || value !== self[index - 1])
	const gridTemplateColumns = arrayTo(7)
		// Luxon's weekdays are 1-indexed
		.map(day => (weekdaysWithEvents.includes(day + 1) ? `1fr` : `0`))
		.join(` `)

	const weekdayOfFirstOfMonth = events[0].startTime.set({ day: 1 }).weekday
	const daysInMonth = events[0].startTime.daysInMonth
	const calendarDays = Math.ceil((weekdayOfFirstOfMonth + daysInMonth - 1) / 7) * 7
	const calendar = arrayTo(calendarDays)
		// array is zero-based, but grid areas are one-based
		// e.g. weekdayOfFirstOfMonth = 3 (Wednesday): 0->0, 1->0, 2->1
		.map(day => Math.max(0, day - weekdayOfFirstOfMonth + 2))
		.map(day => (day <= daysInMonth ? day : 0))
	// events on the same day need to end up in different cells, so duplicate each "week line"
	const gridTemplateRows = arrayTo((calendarDays / 7) * 2).map(index => {
		const week = Math.floor(index / 2)
		const days = calendar.slice(week * 7, (week + 1) * 7)
		return days.map(day => (day === 0 ? `.` : `d${day}s${(index % 2) + 1}`))
	})

	return {
		gridTemplateColumns,
		gridTemplateAreas: `'${gridTemplateRows.map(row => row.join(` `)).join(`' '`)}'`,
	}
}

const showEvent = event => {
	const classes = [event.type, style.event]
	if (event.days) classes.push(style.multiDay)
	if (event.slot) classes.push(style[`slot${event.slot}`])

	const startDay = event.days ? event.days[0] : event.startTime.day
	const startSlot = event.slot || 1
	const endDay = event.days ? event.days[event.days.length - 1] : event.startTime.day
	const endSlot = event.slot || 2
	const gridArea = `d${startDay}s${startSlot}-start / d${startDay}s${startSlot}-start / d${endDay}s${endSlot}-end / d${endDay}s${endSlot}-end`

	return (
		<div key={event.startTime} {...classNames(...classes)} style={{ gridArea }}>
			<span className={style.date}>{showDatesForEvent(event)}</span>
			<h3 className={style.title}>
				<MarkdownAsHtml>{event.title}</MarkdownAsHtml>
			</h3>
			<p className={style.description}>
				<MarkdownAsHtml>{event.description}</MarkdownAsHtml>
			</p>
			<span className={style.details}>{showDetailsForEvent(event)}</span>
		</div>
	)
}

const showDatesForEvent = event => {
	if (event.days) {
		const startDate = event.startTime.set({ day: event.days[0] })
		const endDate = event.startTime.set({ day: event.days[event.days.length - 1] })
		return (
			<React.Fragment>
				<span className={style.weekday}>{startDate.toFormat("EEE")}</span>
				<span className={style.day}>{ordinalDay(startDate.day)}</span>
				{` to `}
				<span className={style.weekday}>{endDate.toFormat("EEE")}</span>
				<span className={style.day}>{ordinalDay(endDate.day)}</span>
			</React.Fragment>
		)
	} else
		return (
			<React.Fragment>
				<span className={style.weekday}>{event.startTime.toFormat("EEE")}</span>
				<span className={style.day}>{ordinalDay(event.startTime.day)}</span>
				<span className={style.time}>
					{event.startTime.toUTC().toFormat("HH:mm")} UTC
				</span>
			</React.Fragment>
		)
}

const showDetailsForEvent = event => {
	switch (event.type) {
		case "stream":
			return <Link to="https://twitch.tv/nipafx">on Twitch</Link>
		case "course":
		case "talk":
			return event.host.url ? (
				<Link to={event.host.url}>at {event.host.name}</Link>
			) : (
				event.host.name
			)
	}
}

export default SchedulePage

/*
 * GET DATA
 */

// returns [ [... events from one month...] [... events from later month...] ]
const getEventsByMonth = (courses, talks) => {
	const firstOfCurrentMonth = DateTime.utc().set({
		day: 1,
		hour: 0,
		minute: 0,
		second: 0,
		millisecond: 0,
	})
	const entries = [...getPresentations(talks), ...getSessions(courses), ...getStreams()]
		// to see the entire year
		// .filter(event => event.startTime.year === DateTime.utc().year)
		.filter(event => event.startTime > firstOfCurrentMonth)
		.sort((event1, event2) => event1.startTime - event2.startTime)
	if (entries.length === 0) return []

	return aggregateByMonths(entries).map(detectSlots)
}

const getPresentations = talks => {
	return presentations.events.flatMap(event =>
		event.presentations.map(presentation => {
			return {
				type: "talk",
				title: presentation.title,
				description: talks.find(talk => talk.slug === presentation.talk).description,
				startTime: DateTime.fromFormat(presentation.time, "dd.MM.yyyy HHmm z", {
					setZone: true,
				}),
				host: {
					name: event.event.name,
					url:
						presentation.announcement ||
						presentation.program ||
						presentation.programEntry ||
						event.event.url,
				},
			}
		})
	)
}

const getSessions = courses => {
	return sessions.sessions.map(session => {
		const times = {
			start: DateTime.fromFormat(session.dates.from, "dd.MM.yyyy"),
			end: DateTime.fromFormat(session.dates.to, "dd.MM.yyyy"),
		}
		const days = arrayTo(times.end.day - times.start.day + 1).map(day => day + times.start.day)

		return {
			type: "course",
			title: session.title,
			description:
				session.description ||
				courses.find(course => course.slug === session.courses[0]).description,
			startTime: DateTime.fromFormat(session.dates.from, "dd.MM.yyyy"),
			days,
			host: {
				name: session.event.name,
				url: session.announcement,
			},
		}
	})
}

const getStreams = () => {
	return streams.streams.map(stream => {
		return {
			type: "stream",
			title: stream.title,
			description: stream.description,
			startTime: DateTime.fromFormat(stream.time, "dd.MM.yyyy HHmm", {
				zone: "UTC",
				setZone: true,
			}),
		}
	})
}

const aggregateByMonths = events => {
	const aggregated = [[events[0]]]
	for (let i = 1; i < events.length; i++) {
		const previous = events[i - 1]
		const current = events[i]
		const sameMonth =
			current.startTime.year === previous.startTime.year &&
			current.startTime.month === previous.startTime.month
		if (sameMonth) aggregated[aggregated.length - 1].push(current)
		else aggregated.push([current])
	}
	return aggregated
}

// WARNING: This does not work if a multi-day event collides with other events on 2+ days
const detectSlots = events => {
	const daysOf = event => events.days || [event.startTime.day]
	const intersect = (event1, event2) => daysOf(event1).find(day => daysOf(event2).includes(day))

	const processed = []
	for (let i = 0; i < events.length; i++) {
		const event = events[i]
		if (i > 0 && intersect(processed[i - 1], event))
			// continue existing collision with next slot
			processed.push({ ...event, slot: processed[i - 1].slot + 1 })
		else if (i < events.length - 1 && intersect(event, events[i + 1]))
			// start new collision
			processed.push({ ...event, slot: 1 })
		// no collision
		else processed.push(event)
	}

	return processed
}

export const query = graphql`
	query {
		courses: allCourse {
			nodes {
				slug
				description
			}
		}
		talks: allTalk {
			nodes {
				slug
				description
			}
		}
	}
`

import React, { useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"

import { DateTime } from "luxon"

import { arrayTo, classNames, ordinalDay } from "../infra/functions"

import MarkdownAsHtml from "../infra/markdownAsHtml"
import Link from "../components/link"

import style from "./calendar.module.css"

import layout from "../layout/container.module.css"
import presentations from "../../content/meta/presentations.json"
import sessions from "../../content/meta/sessions.json"
import streams from "../../content/meta/streams.json"

const Calendar = ({ type, time, order, limit, display, fullscreen }) => {
	if (fullscreen) {
		useEffect(() => {
			if (window.location.hash !== `#fullscreen`) return

			document
				.querySelectorAll(`.${style.month}`)
				.forEach(element => element.classList.add(style.fullscreen, layout.fullWidth))
			return () => {
				document
					.querySelectorAll(`.${style.month}`)
					.forEach(element =>
						element.classList.remove(style.fullscreen, layout.fullWidth)
					)
			}
		})
	}

	const noEvents = `Looks like nothing's planned at the moment. 🏝️🍹`
	const events = getEvents(type, time, order, limit)
	return (
		<React.Fragment>
			{events.length === 0 ? (
				<p className={layout.header}>{noEvents}</p>
			) : (
				showEvents(display, events)
			)}
		</React.Fragment>
	)
}

const showEvents = (display, events) => {
	switch (display) {
		case "monthGrid":
			const eventsByMonth = organizeEventsByMonth(events)
			return eventsByMonth.map(showMonth)
		case "list":
			return showAllEvents(events)
		default:
			throw new Error("Unknown display: " + display)
	}
}

const showAllEvents = events => {
	return (
		<div className={style.allEventContainer}>
			{events.map(event => showEvent(event, false))}
		</div>
	)
}

const showMonth = events => {
	const month = events[0].startTime.toFormat("LLLL yyyy")
	return (
		<div key={month} className={style.month}>
			<h2 className={style.monthTitle}>{month}</h2>
			<div className={style.schedule} style={gridStyleForMonthWith(events)}>
				{events.map(event => showEvent(event, true))}
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

const showEvent = (event, inMonth) => {
	const classes = [event.type, style.event]
	if (event.days) classes.push(style.multiDay)
	if (event.slot) classes.push(style[`slot${event.slot}`])
	const gridArea = inMonth ? gridAreaForEvent(event) : undefined

	return (
		<div key={event.startTime} {...classNames(classes)} style={{ gridArea }}>
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

const gridAreaForEvent = event => {
	const startDay = event.days ? event.days[0] : event.startTime.day
	const startSlot = event.slot || 1
	const endDay = event.days ? event.days[event.days.length - 1] : event.startTime.day
	const endSlot = event.slot || 2
	return `d${startDay}s${startSlot}-start / d${startDay}s${startSlot}-start / d${endDay}s${endSlot}-end / d${endDay}s${endSlot}-end`
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
				<span className={style.time}>{event.startTime.toUTC().toFormat("HH:mm")} UTC</span>
			</React.Fragment>
		)
}

const showDetailsForEvent = event => {
	switch (event.type) {
		case "stream":
			return <Link to="https://twitch.tv/nipafx">on Twitch</Link>
		case "course":
		case "talk":
			return <Link to={event.host.url}>at {event.host.name}</Link>
	}
}

export default Calendar

/*
 * PREPARE DATA
 */

const getEvents = (type, time, order, limit) => {
	return getEntries(type)
		.filter(event => !event.draft)
		.filter(timeFilter(time))
		.sort(sortOrder(order))
		.slice(0, limit)
}

const getEntries = type => {
	const { courses, talks } = getData()
	const entries = []

	const presentations = !type || type.includes(`talks`)
	const sessions = !type || type.includes(`courses`)
	const streams = !type || type.includes(`streams`)

	if (presentations) entries.push(...getPresentations(talks))
	if (sessions) entries.push(...getSessions(courses))
	if (streams) entries.push(...getStreams(talks))

	return entries
}

const timeFilter = time => {
	if (!time) return event => true

	switch (time) {
		case "upcoming":
			const thisMorning = DateTime.utc().set({
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0,
			})
			return event => event.startTime > thisMorning
		case "upcomingMonths":
			const firstOfCurrentMonth = DateTime.utc().set({
				day: 1,
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0,
			})
			return event => event.startTime > firstOfCurrentMonth
		case "upcomingYears":
			return event => event.startTime.year >= DateTime.utc().year
		default:
			throw new Error("Unknown time filter: " + time)
	}
}

const sortOrder = order => {
	if (!order) return (event1, event2) => 0

	switch (order) {
		case "asc":
			return (event1, event2) => event1.startTime - event2.startTime
		case "desc":
			return (event1, event2) => event2.startTime - event1.startTime
		default:
			throw new Error("Unknown order: " + order)
	}
}

// returns [ [... events from one month...] [... events from later month...] ]
const organizeEventsByMonth = entries => {
	if (entries.length === 0) return []

	return aggregateByMonths(entries).map(detectSlots)
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

/*
 * GET DATA
 */

const getData = () => {
	const { courses, talks } = useStaticQuery(graphql`
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
	`)
	return { courses: courses.nodes, talks: talks.nodes }
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
				draft: presentation.draft,
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
			draft: session.draft,
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
			draft: stream.draft,
		}
	})
}

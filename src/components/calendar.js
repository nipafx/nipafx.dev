import React, { useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"

import { arrayTo, classNames, ordinalDay } from "../infra/functions"
import { getEvents } from "../infra/events"

import MarkdownAsHtml from "../infra/markdownAsHtml"
import Link from "../components/link"

import * as style from "./calendar.module.css"
import * as layout from "../layout/container.module.css"

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
	const events = getEvents(type, time, order, limit, getData())
	printEvents(events)
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

const printEvents = events => {
	const message = events
		.map(event => event.startTime.hasTime
			? event.startTime.instant.toUTC().toFormat("dd.MM./HHmm") + " " + event.title
			: event.startTime.instant.toUTC().toFormat("dd.MM.") + " " + event.title)
		.join(" — ")
	// this message is perfect for, say, Moobot
	console.log("All times UTC (https://time.is/UTC): " + message)
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
	const month = events[0].startTime.instant.toFormat("LLLL yyyy")
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
				? event.days.map(day => event.startTime.instant.set({ day })).map(day => day.weekday)
				: [event.startTime.instant.weekday]
		)
		.sort()
		.filter((value, index, self) => index === 0 || value !== self[index - 1])
	const gridTemplateColumns = arrayTo(7)
		// Luxon's weekdays are 1-indexed
		.map(day => (weekdaysWithEvents.includes(day + 1) ? `1fr` : `0`))
		.join(` `)

	const weekdayOfFirstOfMonth = events[0].startTime.instant.set({ day: 1 }).weekday
	const daysInMonth = events[0].startTime.instant.daysInMonth
	const calendarDays = Math.ceil((weekdayOfFirstOfMonth + daysInMonth - 1) / 7) * 7
	const calendar = arrayTo(calendarDays)
		// array is zero-based, but grid areas are one-based
		// e.g. weekdayOfFirstOfMonth = 3 (Wednesday): 0->0, 1->0, 2->1
		.map(day => Math.max(0, day - weekdayOfFirstOfMonth + 2))
		.map(day => (day <= daysInMonth ? day : 0))
	// events on the same day need to end up in different cells, so have each "week line" several times
	const gridTemplateRows = arrayTo((calendarDays / 7) * 3).map(index => {
		const week = Math.floor(index / 3)
		const days = calendar.slice(week * 7, (week + 1) * 7)
		return days.map(day => (day === 0 ? `.` : `d${day}s${(index % 3) + 1}`))
	})

	return {
		gridTemplateColumns,
		gridTemplateAreas: `'${gridTemplateRows.map(row => row.join(` `)).join(`' '`)}'`,
	}
}

const showEvent = (event, inMonth) => {
	const classes = [event.type, style.event]
	if (event.days) classes.push(style.multiDay)
	if (event.slot) {
		classes.push(style[`slot${event.slot}`])
		classes.push(style[`slotMax${event.slots}`])
	}
	const gridArea = inMonth ? gridAreaForEvent(event) : undefined

	return (
		<div
			key={event.startTime.instant}
			itemScope
			itemType="https://schema.org/Event"
			{...classNames(classes)}
			style={{ gridArea }}
		>
			<span className={style.date}>{showDatesForEvent(event)}</span>
			<h3 className={style.title}>
				<MarkdownAsHtml itemProp="name">{event.title}</MarkdownAsHtml>
			</h3>
			<p className={style.description}>
				<MarkdownAsHtml itemProp="description">{event.description}</MarkdownAsHtml>
			</p>
			{showLocationForEvent(event)}
		</div>
	)
}

const gridAreaForEvent = event => {
	const startDay = event.days ? event.days[0] : event.startTime.instant.day
	const startSlot = event.slot ?? 1
	const endDay = event.days ? event.days[event.days.length - 1] : event.startTime.instant.day
	const endSlot = event.slot ?? 3
	return `d${startDay}s${startSlot}-start / d${startDay}s${startSlot}-start / d${endDay}s${endSlot}-end / d${endDay}s${endSlot}-end`
}

const showDatesForEvent = event => {
	const structuredStartDate = (
		<meta
			itemProp="startDate"
			content={event.startTime.instant.toISO({
				suppressSeconds: true,
				suppressMilliseconds: true,
			})}
		/>
	)
	const status = <meta itemProp="eventStatus" content="http://schema.org/EventScheduled" />

	if (event.days) {
		const startDate = event.startTime.instant.set({ day: event.days[0] })
		const endDate = event.startTime.instant.set({ day: event.days[event.days.length - 1] })
		return (
			<React.Fragment>
				<span className={style.weekday}>{startDate.toFormat("EEE")}</span>
				<span className={style.day}>{ordinalDay(startDate.day)}</span>
				{` to `}
				<span className={style.weekday}>{endDate.toFormat("EEE")}</span>
				<span className={style.day}>{ordinalDay(endDate.day)}</span>
				{structuredStartDate}
				{status}
			</React.Fragment>
		)
	} else
		return (
			<React.Fragment>
				<span className={style.weekday}>{event.startTime.instant.toFormat("EEE")}</span>
				<span className={style.day}>{ordinalDay(event.startTime.instant.day)}</span>
				{event.startTime.hasTime && <span className={style.time}>{event.startTime.instant.toUTC().toFormat("HH:mm")} UTC</span>}
				{structuredStartDate}
				{status}
			</React.Fragment>
		)
}

const showLocationForEvent = event => {
	const location = {
		text: event.location.text,
	}
	let attendanceMode

	if (event.location.type === "physical") {
		// pick the most specific URL
		location.url = event.url || (event.host && event.host.url)
		location.type = "https://schema.org/Place"
		location.details = (
			<span itemScope itemProp="address" itemType="https://schema.org/PostalAddress">
				<meta itemProp="name" content={event.location.info} />
			</span>
		)
		attendanceMode = "https://schema.org/OfflineEventAttendanceMode"
	} else if (event.location.type === "virtual") {
		// pick the most specific URL
		location.url = event.location.info || event.url || (event.host && event.host.url)
		location.type = "https://schema.org/VirtualLocation"
		location.details = <meta itemProp="url" content={event.location.info} />
		attendanceMode = "https://schema.org/OnlineEventAttendanceMode"
	}

	const organizer = event.host && {
		type:
			event.host.type === "person"
				? "https://schema.org/Person"
				: // default to organization because it is more common
				  "https://schema.org/Organization",
		name: event.host.name,
		url: event.host.url,
	}

	return showLocation(location, attendanceMode, organizer)
}

const showLocation = (location, attendanceMode, organizer) => {
	const locationProp = location.type
		? {
				// itemScope must be truthy
				itemScope: "-",
				itemProp: "location",
				itemType: location.type,
		  }
		: {}
	return (
		<React.Fragment>
			<span {...locationProp} className={style.details}>
				<Link to={location.url}>{location.text}</Link>
				{location.details}
			</span>
			{attendanceMode && <meta itemProp="eventAttendanceMode" content={attendanceMode} />}
			{organizer && (
				<span itemScope itemProp="organizer" itemType={organizer.type}>
					<meta itemProp="name" content={organizer.name} />
					<meta itemProp="url" content={organizer.url} />
				</span>
			)}
			<span itemScope itemProp="performer" itemType="https://schema.org/Person">
				<meta itemProp="name" content="Nicolai Parlog (nipafx)" />
				<meta itemProp="url" content="https://nipafx.dev" />
			</span>
		</React.Fragment>
	)
}

export default Calendar

/*
 * PREPARE DATA
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
			current.startTime.instant.year === previous.startTime.instant.year &&
			current.startTime.instant.month === previous.startTime.instant.month
		if (sameMonth) aggregated[aggregated.length - 1].push(current)
		else aggregated.push([current])
	}
	return aggregated
}

// WARNING: This does not work if a multi-day event collides with other events on 2+ days
const detectSlots = events => {
	const daysOf = event => event.days ?? [event.startTime.instant.day]
	const intersect = (event1, event2) => daysOf(event1).find(day => daysOf(event2).includes(day))
	const pushToProcessed = (currentSlot, processed) => currentSlot.length === 1
		? processed.push(currentSlot[0])
		: currentSlot.forEach((event, index) => processed.push({ ...event, slot: index + 1, slots: currentSlot.length }))

	const processed = []
	let currentSlot = [ events[0] ]

	for (let i = 1; i < events.length; i++) {
		const event = events[i]
		if (intersect(currentSlot[0], event))
			currentSlot.push(event)
		else {
			pushToProcessed(currentSlot, processed)
			currentSlot = [ event ]
		}
	}

	pushToProcessed(currentSlot, processed)

	return processed
}

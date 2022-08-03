// uses `require` instead of `import` because it's called during RSS generation,
// which happens outside of ES modules
const { DateTime } = require("luxon")

const events = require("../../content/meta/events.json")
const presentations = require("../../content/meta/presentations.json")
const sessions = require("../../content/meta/sessions.json")
const streams = require("../../content/meta/streams.json")

exports.getEvents = (type, time, order, limit, descriptions) => {
	return getEntries(type, descriptions)
		.filter(event => !event.draft)
		.filter(timeFilter(time))
		.sort(sortOrder(order))
		.slice(0, limit)
}

const getEntries = (type, descriptions) => {
	const entries = []

	const events = !type || type.includes(`events`)
	const presentations = !type || type.includes(`talks`)
	const sessions = !type || type.includes(`courses`)
	const streams = !type || type.includes(`streams`)

	if (events) entries.push(...getEvents())
	if (presentations) entries.push(...getPresentations(descriptions?.talks))
	if (sessions) entries.push(...getSessions(descriptions?.courses))
	if (streams) entries.push(...getStreams())

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

const getPresentations = talks => {
	return presentations.events.flatMap(event =>
		event.presentations.map(pres => {
			return {
				type: "talk",
				title: pres.title,
				description: talks?.find(talk => talk.slug === pres.talk).description,
				url: pres.announcement || pres.program || pres.programEntry,
				startTime: DateTime.fromFormat(pres.time, "dd.MM.yyyy HHmm z", {
					setZone: true,
				}),
				host: {
					name: event.event.name,
					url: event.event.url,
				},
				location: {
					text: `at ${event.event.name}`,
					// type "physical" is default
					type: pres.location.type ?? "physical",
					info: pres.location.type === "virtual" ? pres.location.url : pres.location.text
				},
				draft: pres.draft,
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
		const days = [...Array(times.end.day - times.start.day + 1).keys()].map(
			day => day + times.start.day
		)

		return {
			type: "course",
			title: session.title,
			description:
				session.description ||
				courses?.find(course => course.slug === session.courses[0]).description,
			url: session.announcement,
			startTime: times.start,
			days,
			host: {
				name: session.event.name,
				url: session.event.url,
			},
			location: {
				type: session.locationText ? "physical" : session.location ? "virtual" : null,
				text: `at ${session.event.name}`,
				info: session.locationText || (session.location && session.location.url),
			},
			draft: session.draft,
		}
	})
}

const getEvents = () => {
	return events.events.map(event => {
		return {
			type: "event",
			title: event.title,
			description: event.description,
			url: event.url,
			startTime: DateTime.fromFormat(event.time, "dd.MM.yyyy HHmm z", {
				setZone: true,
			}),
			location: event.location,
			draft: event.draft,
		}
	})
}

const getStreams = () => {
	return streams.streams.map(stream => {
		return {
			type: "stream",
			title: stream.title,
			description: stream.description,
			url: "https://twitch.tv/nipafx",
			startTime: DateTime.fromFormat(stream.time, "dd.MM.yyyy HHmm", {
				zone: "UTC",
				setZone: true,
			}),
			host: {
				type: "person",
				name: "Nicolai Parlog (nipafx)",
				url: "https://nipafx.dev",
			},
			location: {
				type: "virtual",
				text: "on Twitch",
				info: "https://twitch.tv/nipafx",
			},
			draft: stream.draft,
		}
	})
}

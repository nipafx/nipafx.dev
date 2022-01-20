const ical = require("ical-generator")

const { markdownToHtml } = require(`./markdownToHtml`)
const { getEvents } = require(`./events`)

const extractExtendedInformation = event => {
	switch (event.type) {
		case "course":
			return {
				organizer: "Nicolai Parlog <nicolai@nipafx.dev>",
				categories: [{ name: "COURSE" }],
				// it will usually be either location or url
				location: event.location.physical,
				url: event.location.virtual,
			}
		case "stream":
			return {
				organizer: "Nicolai Parlog <nicolai@nipafx.dev>",
				categories: [{ name: "STREAM" }],
				url: "https://twitch.tv/nipafx",
			}
		case "talk":
			return {
				organizer: "Nicolai Parlog <nicolai@nipafx.dev>",
				categories: [{ name: "TALK" }],
				// it will usually be either location or url
				location: event.location.physical,
				url: event.location.virtual,
			}
		default:
			return {}
	}
}

const createCalendarEvent = event => {
	const basicInformation = {
		start: event.startTime.toISO(),
		summary: event.title,
		description: event.description,
		htmlDescription: event.description
			? `<span>${markdownToHtml(event.description)}</span>`
			: null,
		status: "confirmed",
	}
	const extendedInformation = extractExtendedInformation(event)
	return { ...basicInformation, ...extendedInformation }
}

exports.createICalendar = (type, time, order, limit) => {
	const calendar = ical({
		domain: `nipafx.dev`,
		name: `Nicolai's stream/talk/course schedule`,
		url: `https://nipafx.dev/schedule.ics`,
		timezone: `Etc/UTC`,
		ttl: 60 * 60 * 24,
	})

	getEvents(type, time, order, limit)
		.map(createCalendarEvent)
		.forEach(event => calendar.createEvent(event))

	return calendar
}

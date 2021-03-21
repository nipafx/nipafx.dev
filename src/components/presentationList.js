import React from "react"

import { getPresentationsByYear } from "./event"
import { ordinalDay } from "../infra/functions"

import EventList from "./eventList"
import { H2, H3 } from "./headings"

import * as style from "./presentationList.module.css"
import * as layout from "../layout/container.module.css"

const PresentationList = ({ slug }) => {
	const presentations = getPresentationsByYear(slug)
	return (
		<React.Fragment>
			{presentations.upcoming.length > 0 && (
				<React.Fragment>
					<H2 id="upcoming">Upcoming Presentations</H2>
					<p>{upcomingText(presentations.upcoming, slug)}</p>
					<EventList
						events={preparePresentations(presentations.upcoming)}
						className={layout.main}
						presentDate={presentDate}
					/>
				</React.Fragment>
			)}
			{presentations.pastByYear.length > 0 && (
				<React.Fragment>
					<H2 id="past">Past Presentations</H2>
					<p>{pastText(presentations.pastByYear, slug)}</p>
					{presentations.pastByYear.map(presByYear => (
						<React.Fragment key={presByYear.year}>
							<H3 id={presByYear.year}>{presByYear.year}</H3>
							<EventList
								events={preparePresentations(presByYear.presentations)}
								className={layout.main}
								presentDate={presentDate}
							/>
						</React.Fragment>
					))}
				</React.Fragment>
			)}
		</React.Fragment>
	)
}

const upcomingText = (upcoming, specificTalk) => {
	const present = specificTalk ? "present this talk" : "be"
	const intro =
		upcoming.length === 1
			? `In the coming months, I'll ${present} at ${upcoming[0].event.name}.`
			: upcoming.length === 2
			? `In the coming months, I'll ${present} at ${upcoming[0].event.name} and ${upcoming[1].event.name}.`
			: `In the coming months, I'll ${present} at ${upcoming[0].event.name} and a few other conferences.`
	return `${intro} If you're there as well, I'd love to meet you - I'm always up for a chat. 😁 Just flag me down when you see me. (This includes chat rooms.)`
}

const pastText = (pastByYear, specificTalk) => {
	if (!specificTalk)
		return `I've been speaking at conferences for a few years now - prepare for a long list. 😉`

	const numberOfPresentations = pastByYear
		.map(pres => pres.presentations.length)
		.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
	const intro =
		numberOfPresentations === 1
			? `I gave this talk once before.`
			: numberOfPresentations === 2
			? `I gave this talk twice before.`
			: `I gave this talk a few times before.`
	return `${intro} See below for links to slides (as they were at that very event), videos, and other information.`
}

const preparePresentations = presentations =>
	presentations.map(presentation => {
		return {
			title: presentation.title,
			description: prepareDescription(presentation),
			host: presentation.event,
			location: presentation.location,
			time: presentation.time,
		}
	})

const prepareDescription = ({ announcement, slidesUrl, videoUrl, misc }) => {
	const description = []
	if (announcement) description.push({ text: announcement.text, url: announcement.url })
	if (slidesUrl) description.push({ text: `slides`, url: slidesUrl })
	if (videoUrl) description.push({ text: `video`, url: videoUrl })
	if (misc) description.push(...misc)
	return description
}

const presentDate = ({ time }) => {
	return (
		<span>
			<span>{time.toFormat("EEE")}, </span>
			<span className={style.day}>
				{time.toFormat("MMM")} {ordinalDay(time.day)}
			</span>
			<span>, {time.toFormat("HH:mm z")}</span>
			<meta
				itemProp="startDate"
				content={time.toISO({ suppressSeconds: true, suppressMilliseconds: true })}
			/>
			<meta itemProp="eventStatus" content="http://schema.org/EventScheduled" />
		</span>
	)
}

export const createTableOfContentEntries = slug => {
	const toc = []
	const presentations = getPresentationsByYear(slug)
	if (presentations.upcoming.length > 0)
		toc.push({
			title: "Upcoming Presentations",
			anchor: "upcoming",
		})
	if (presentations.pastByYear.length > 0) {
		const years = presentations.pastByYear.map(({ year }) => (
			{
				title: year,
				anchor: year,
			}
		))
		toc.push({
			title: "Past Presentations",
			anchor: "past",
			children: years,
		})
	}
	return toc
}

export default PresentationList

import React from "react"

import Event from "./event"
import Image from "./image"
import Link from "./link"

import { classNames } from "../infra/functions"

import * as style from "./eventList.module.css"

const EventList = ({ events, presentDate, className }) => {
	return (
		<div {...classNames(style.list, className)}>
			{events.map(event => (
				<Event key={event.reactKey} event={event} presentDate={presentDate} />
			))}
		</div>
	)
}

export default EventList

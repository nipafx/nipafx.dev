import React from "react"

import Image from "./image"
import Link from "./link"

import { classNames } from "../infra/functions"

import style from "./eventList.module.css"

const EventList = ({ events, className, children }) => {
	return (
		<div {...classNames(style.list, className)}>
			{children.map((child, index) => present(events[index], child))}
		</div>
	)
}

const present = (event, text) => {
	return (
		<div key={event.url} className={style.card}>
			<div>
				<Link to={event.url} className={style.eventLink}>
					{header(event)}
				</Link>
			</div>
			<div className={style.text}>{text}</div>
		</div>
	)
}

const header = event => (
	<div className={style.eventCover}>
		{event.image && <Image id={event.image} type="eventCard" className={style.eventLogo} />}
	</div>
)

export default EventList

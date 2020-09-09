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
		<div key={event.url}>
			<div>
				<Link to={event.url} className={style.eventLink}>
					<div className={style.eventCover}>
						<Image id={event.image} type="eventCard" />
						{event.name && (
							<h3 className={style.eventName}>
								<span>{event.name}</span>
							</h3>
						)}
					</div>
				</Link>
			</div>
			<div className={style.text}>{text}</div>
		</div>
	)
}

export default EventList

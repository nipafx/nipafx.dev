import React from "react"

import { classNames } from "../infra/functions"

import Calendar from "./calendar"

import layout from "../layout/container.module.css"
import style from "./wrapper.module.css"

const CalendarWrapper = props => {
	return (
		<div {...classNames(layout.wide, style.wrapper)}>
			<Calendar {...props} />
		</div>
	)
}

export default CalendarWrapper

import React from "react"

import { classNames } from "../infra/functions"

import Calendar from "./calendar"

import * as layout from "../layout/container.module.css"
import * as style from "./wrapper.module.css"

const CalendarWrapper = props => {
	return (
		<div {...classNames(layout.wide, style.wrapper)}>
			<Calendar {...props} />
		</div>
	)
}

export default CalendarWrapper

import React from "react"

import { classNames } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./table.module.css"

const Table = ({ children }) => (
	<div {...classNames(layout.mainOffCenter, style.container)}>
		<table {...classNames(style.table)}>{children}</table>
	</div>
)

export default Table

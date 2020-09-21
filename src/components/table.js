import React from "react"

import { classNames } from "../infra/functions"

import layout from "../layout/container.module.css"
import tableStyle from "./table.module.css"

const Table = ({ style, children }) => (
	<div {...classNames(layout.offWide, tableStyle.container)}>
		<table className={tableStyle.table} style={style}>{children}</table>
	</div>
)

export default Table

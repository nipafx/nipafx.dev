import React from "react"

import { classNames } from "../infra/functions"

import layout from "../layout/container.module.css"
import tableStyle from "./table.module.css"

const Table = ({ style, children }) => (
	<div {...classNames(layout.offWide, tableStyle.container)}>
		<table className={tableStyle.table} style={style}>
			{filterTree(children)}
		</table>
	</div>
)

const filterTree = nodes =>
	nodes
		// filter whitespace nodes to prevent the DOM validation error:
		// "Whitespace text nodes cannot appear as a child of <table>."
		// see #25 for details
		.filter(node => !node.match || !node.match(/^\s*$/))
		.map(node => {
			if (!node.props || !node.props.children) return node
			const filteredChildren = filterTree(node.props.children)
			return React.cloneElement(node, [], filteredChildren)
		})

export default Table

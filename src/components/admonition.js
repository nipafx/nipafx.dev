import React from "react"

import * as style from "./admonition.module.css"

const Admonition = ({ children, type, hint }) => {
	const text = typeText(type) + (hint ? ` (${hint})` : "") + ":"
	children = children.filter(child => child != "\n")
	if (children.length === 1)
		return (
			<div className={style.shortAdmonition}>
				<span className={style.type}>{text}</span> {children[0]}
				{children.slice(1)}
			</div>
		)
	else
		return (
			<div className={style.longAdmonition}>
				<div>
					<span className={style.type}>{text}</span> {children[0]}
				</div>
				{children.slice(1)}
			</div>
		)
}

const typeText = type => {
	switch (type) {
		case "caveat":
			return "Caveat"
		case "note":
			return "Note"
		case "update":
			return "Update"
		case "warning":
			return "Warning"
	}
}

export default Admonition

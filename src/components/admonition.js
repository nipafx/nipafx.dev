import React from "react"

import MarkdownAsHtml from "../infra/markdownAsHtml"

import style from "./admonition.module.css"

const Admonition = ({ children, type }) => {
	children = children.filter(child => child != "\n")
	if (children.length === 1)
		return (
			<div className={style.shortAdmonition}>
				<span className={style.type}>{typeText(type)}:</span> {children[1]}
				{children}
			</div>
		)
	else
		return (
			<div className={style.longAdmonition}>
				<div>
					<span className={style.type}>{typeText(type)}:</span> {children[1]}
				</div>
				{children}
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
	}
}

export default Admonition

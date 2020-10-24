import React from "react"

import { classNames } from "../infra/functions"

import style from "./externalLink.module.css"

const ExternalLink = ({ to, onClick, mark, className, children }) => {
	const classes = []
	if (className) classes.push(className)
	if (mark) classes.push(style.mark)

	return (
		<a {...classNames(classes)} rel="noopener noreferrer" href={to} onClick={onClick}>
			{children}
		</a>
	)
}

export default ExternalLink

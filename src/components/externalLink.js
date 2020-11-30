import React from "react"

import { classNames } from "../infra/functions"

import style from "./externalLink.module.css"

const ExternalLink = ({ to, dataChannel, dataTag, onClick, mark, className, children }) => {
	const classes = []
	if (className) classes.push(className)
	if (mark) classes.push(style.mark)

	return (
		<a
			href={to}
			data-channel={dataChannel}
			data-tag={dataTag}
			onClick={onClick}
			{...classNames(classes)}
		>
			{children}
		</a>
	)
}

export default ExternalLink

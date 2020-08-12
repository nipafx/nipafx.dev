import React from "react"

import { classNames } from "../infra/functions"

import Image from "./image"

import layout from "../layout/container.module.css"
import style from "./contentImage.module.css"

const ContentImage = ({ slug, options }) => {
	options = options || ""
	let type = "content"
	const divClasses = []
	const imageClasses = []

	if (options.includes("wide")) {
		divClasses.push(layout.wide)
		divClasses.push(style.margins)
	}
	if (options.includes("sidebar")) {
		divClasses.push(layout.sidebar)
		type = "sidebar"
	}
	if (options.includes("border")) divClasses.push(style.border)
	if (options.includes("bg")) imageClasses.push(style.bg)

	return (
		<div {...classNames(...divClasses)}>
			<Image id={slug} type={type} {...classNames(...imageClasses)} />
		</div>
	)
}

export default ContentImage

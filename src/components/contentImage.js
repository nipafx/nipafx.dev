import React from "react"

import { classNames } from "../infra/functions"

import Image from "./image"

import layout from "../layout/container.module.css"
import style from "./contentImage.module.css"

const ContentImage = ({ slug, options, className }) => {
	options = options || ""
	let type = "content"
	const divClasses = [className]
	const imageClasses = [style.image]

	// would be nice to add the two classes above
	// and remove them here if `narrow` is in the options,
	// but apparently JS is too cool for Array::remove 🙄
	if (!options.includes("narrow")) divClasses.push(layout.wide)
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

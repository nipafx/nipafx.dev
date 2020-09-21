import React from "react"

import { classNames } from "../infra/functions"

import Video from "./video"

import layout from "../layout/container.module.css"
import style from "./contentVideo.module.css"

const ContentVideo = ({ slug, options, className }) => {
	options = options || ""
	const classes = [className, style.video]

	// would be nice to add the two classes above
	// and remove them here if `narrow` is in the options,
	// but apparently JS is too cool for Array::remove 🙄
	if (!options.includes("narrow")) classes.push(layout.wide)

	return <Video slug={slug} {...classNames(...classes)} />
}

export default ContentVideo

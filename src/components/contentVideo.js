import React from "react"

import { classNames } from "../infra/functions"

import Image from "./image"
import Link from "./link"
import Play from "../images/youtube-play.svg"

import layout from "../layout/container.module.css"
import style from "./contentVideo.module.css"

import videoData from "../../content/meta/videos.json"

const ContentVideo = ({ slug, options }) => {
	options = options || ""
	const divClasses = [style.container]

	// would be nice to add the two classes above
	// and remove them here if `narrow` is in the options,
	// but apparently JS is too cool for Array::remove 🙄
	if (!options.includes("narrow")) {
		divClasses.push(layout.wide)
		divClasses.push(style.margins)
	}

	const video = videoData.videos.find(video => video.slug === slug)
	if (!exists(slug, video)) return null

	return (
		<div {...classNames(...divClasses)}>
			<Link to={video.url} className={style.link}>
				<Image id={video.thumbnail} type="videoThumbnail" className={style.thumbnail} />
				<Play className={style.button} />
				<p className={style.text}>{`Watch "${video.title}" on ${platform(video.url)}`}</p>
			</Link>
		</div>
	)
}

const exists = (id, video) => {
	if (video) return true

	const message = `Missing video information: ${id}`
	if (process.env.NODE_ENV === `production`) throw new Error(message)
	else console.warn(message)

	return false
}

const platform = url => {
	// this seems a bit fragile
	if (url.includes("youtube.com")) return "YouTube"
	if (url.includes("vimeo.com")) return "Vimeo"
	return "this weird video platform"
}

export default ContentVideo

import React from "react"

import { classNames } from "../infra/functions"

import Image from "./image"
import Link from "./link"
import Play from "../images/youtube-play.svg"

import style from "./video.module.css"

import videoData from "../../content/meta/videos.json"

const Video = ({ slug, className }) => {
	const video = videoData.videos.find(video => video.slug === slug)
	if (!exists(slug, video)) return null

	return (
		<div {...classNames(style.container, className)}>
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

export default Video

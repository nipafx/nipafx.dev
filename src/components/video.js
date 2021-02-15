import React, { useEffect, useState } from "react"

import { classNames, videoEmbedUrl } from "../infra/functions"

import Iframe from "./iframe"
import Image from "./image"
import Link from "./link"
import Play from "../images/youtube-play.svg"
import Plus from "../images/plus.svg"

import style from "./video.module.css"

import videoData from "../../content/meta/videos.json"

const COOKIE_NAME = "always_embed_videos"
const COOKIE_VALUE = "true"

const Video = ({ slug, className }) => {
	const video = videoData.videos.find(video => video.slug === slug)
	if (!exists(slug, video)) return null

	const [showIframe, setShowIframe] = useState(false)
	useEffect(() => {
		const hasEmbedCookie = document.cookie.includes(`${COOKIE_NAME}=${COOKIE_VALUE}`)
		if (hasEmbedCookie) setShowIframe(true)
	})

	const classes = [ className ]
	if (video.border) classes.push(style.border)
	if (!showIframe) classes.push(style.container)

	return showIframe ? (
		<Iframe title={video.title} src={videoEmbedUrl(video.url)} {...classNames(classes)}></Iframe>
	) : (
		<div {...classNames(classes)}>
			<Image id={video.thumbnail} type="videoThumbnail" className={style.thumbnail} />
			<div
				{...classNames(style.button, style.embed)}
				onClick={_ => embedVideos(setShowIframe)}
			>
				<Plus className={style.graphic} />
				<div className={style.text}>
					<p>{`Always embed videos`}</p>
					<p>
						(<span className={style.optional}>and give me a cookie to remember - </span>
						<Link to="privacy">privacy policy</Link>)
					</p>
				</div>
			</div>
			<Link to={video.url} {...classNames(style.button, style.link)}>
				<Play className={style.graphic} />
				<div className={style.text}>
					<p>{`Watch on ${platform(video.url)}`}</p>
				</div>
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

const embedVideos = setShowIframe => {
	document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE};path=/`
	setShowIframe(true)
}

export default Video

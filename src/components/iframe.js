import React from "react"

import { classNames } from "../infra/functions"

import style from "./iframe.module.css"

const Iframe = ({src, className}) => {
	return (
		<div {...classNames(style.container, className)}>
			<iframe
				className={style.iframe}
				src="https://slides.codefx.org/java-after-eight"
				frameBorder="0"
				allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			></iframe>
		</div>
	)
}

export default Iframe

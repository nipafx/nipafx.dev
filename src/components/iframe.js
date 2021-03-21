import React from "react"

import { classNames } from "../infra/functions"

import * as style from "./iframe.module.css"

const Iframe = ({ title, src, className }) => {
	return (
		<div {...classNames(style.container, className)}>
			<iframe
				className={style.iframe}
				title={title}
				src={src}
				frameBorder="0"
				allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			></iframe>
		</div>
	)
}

export default Iframe

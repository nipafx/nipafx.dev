import React from "react"

import { classNames } from "../infra/functions"

import Image from "./image"

import layout from "../layout/container.module.css"
import style from "./pullImage.module.css"

const PullImage = ({ slug }) => (
	<div {...classNames(layout.sidebar, style.pull)}>
		<Image id={slug} type="sidebar" {...classNames(style.image)} />
	</div>
)

export default PullImage

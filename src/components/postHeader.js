import React from "react"

import FormattedDate from "./formattedDate"

import { className } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./postHeader.module.css"

const PostHeader = ({ title, date }) => {
	return (
		<header {...className(layout.container)}>
			<div {...className(layout.header, style.date)}>
				<FormattedDate date={date} />
			</div>
			<h1 {...className(layout.header, style.title)}>{title}</h1>
			{/* TODO: tags */}
			{/* TODO: teaser */}
			{/* TODO: image */}
		</header>
	)
}

export default PostHeader

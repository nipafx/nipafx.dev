import React from "react"

import FormattedDate from "./formattedDate"
import Link from "./link"

import { className } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./postHeader.module.css"

const PostHeader = ({ title, tags, date }) => {
	return (
		<header {...className(layout.container)}>
			<div {...className(layout.header, style.date)}>
				<FormattedDate date={date} />
			</div>
			<h1 {...className(layout.header, style.title)}>{title}</h1>
			{showTags(tags)}
			{/* TODO: teaser */}
			{/* TODO: image */}
		</header>
	)
}

const showTags = tags => {
	if (tags && tags.length > 0)
		return (
			<ul {...className(style.tags)}>
				{tags.map(tag => (
					<li>
						<Link to={tag}>#{tag}</Link>
					</li>
				))}
			</ul>
		)
}

export default PostHeader

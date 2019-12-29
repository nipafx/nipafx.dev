import React from "react"

import FormattedDate from "./formattedDate"
import Tag from "./tag"

import { className } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./articleHeader.module.css"

const ArticleHeader = ({ title, tags, date }) => {
	return (
		<header {...className(layout.container)}>
			{showDate(date)}
			{showTitle(title)}
			{showTags(tags)}
			{/* TODO: teaser */}
			{/* TODO: image */}
		</header>
	)
}

const showDate = date =>
	date && (
		<div {...className(layout.header, style.date)}>
			<FormattedDate date={date} />
		</div>
	)

const showTitle = title => title && <h1 {...className(layout.header, style.title)}>{title}</h1>

const showTags = tags =>
	tags &&
	tags.length > 0 && (
		<ul {...className(style.tags)}>
			{tags.map(tag => (
				<li>
					<Tag tag={tag} link />
				</li>
			))}
		</ul>
	)

export default ArticleHeader

import React from "react"

import FormattedDate from "./formattedDate"
import Tag from "./tag"
import Image from "./image"

import { className } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./postHeader.module.css"

const PostHeader = ({ title, tags, date, featuredImage }) => {
	return (
		<header {...className(layout.container)}>
			{showDate(date)}
			{showTitle(title)}
			{showTags(tags)}
			{/* TODO: teaser */}
			{showImage(featuredImage)}
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
		<ul {...className(layout.header, style.tags)}>
			{tags.map(tag => (
				<li key={tag}>
					<Tag tag={tag} link />
				</li>
			))}
		</ul>
	)

const showImage = featuredImage =>
	featuredImage && (
		<Image
			id={featuredImage}
			type="post-title"
			{...className(layout.headerImage, style.image)}
		/>
	)

export default PostHeader

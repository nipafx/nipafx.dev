import React from "react"

import FormattedDate from "./formattedDate"
import Tag from "./tag"
import Image from "./image"

import { classNames } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./postHeader.module.css"

const PostHeader = ({ title, tags, date, featuredImage }) => {
	return (
		<header {...classNames(layout.container)}>
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
		<div {...classNames(layout.header, style.date)}>
			<FormattedDate date={date} />
		</div>
	)

const showTitle = title => title && <h1 {...classNames(layout.header, style.title)}>{title}</h1>

const showTags = tags =>
	tags &&
	tags.length > 0 && (
		<div {...classNames(layout.header, style.tags)}>
			{tags.map(tag => (
				<Tag key={tag} tag={tag} link />
			))}
		</div>
	)

const showImage = featuredImage =>
	featuredImage && (
		<Image
			id={featuredImage}
			type="postTitle"
			{...classNames(layout.headerImage, style.image)}
		/>
	)

export default PostHeader

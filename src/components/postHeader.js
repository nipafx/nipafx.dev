import React from "react"

import FormattedDate from "./formattedDate"
import { Tag, Channel } from "./tag"
import Image from "./image"

import MdAsHtml from "../infra/mdAsHtml"
import { classNames } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./postHeader.module.css"

const PostHeader = ({ title, date, channel, tags, featuredImage }) => {
	return (
		<header {...classNames(layout.container, style.header)}>
			{showDate(date)}
			{showTitle(title)}
			{showTags(channel, tags)}
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

const showTitle = title =>
	title && (
		<h1 {...classNames(layout.header, style.title)}>
			<MdAsHtml>{title}</MdAsHtml>
		</h1>
	)

const showTags = (channel, tags) => {
	const channelExists = channel
	const tagsExist = tags && tags.length > 0
	if (!channelExists && !tagsExist) return null
	return (
		<div {...classNames(layout.header, style.tags)}>
			{channelExists && <Channel key={channel} channel={channel} link className={style.channel} />}
			{tagsExist && tags.map(tag => <Tag key={tag} tag={tag} link />)}
		</div>
	)
}

const showImage = featuredImage =>
	featuredImage && (
		<Image
			id={featuredImage}
			type="postTitle"
			{...classNames(layout.headerImage, style.image)}
		/>
	)

export default PostHeader

import React from "react"

import FormattedDate from "./formattedDate"
import { Tag, Channel } from "./tag"
import Image from "./image"

import MarkdownAsHtml from "../infra/markdownAsHtml"
import { classNames } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./header.module.css"

const Header = ({ children, featuredImage }) => (
	<header {...classNames(layout.container, style.header)}>
		{children[0] && <div {...classNames(layout.header, style.firstLine)}>{children[0]}</div>}
		{children[1] && <h1 {...classNames(layout.header, style.title)}>{children[1]}</h1>}
		{children[2] && <div {...classNames(layout.header, style.tags)}>{children[2]}</div>}
		{children[3] && <div {...classNames(layout.header, style.intro)}><p>{children[3]}</p></div>}
		{featuredImage && (
			<Image
				id={featuredImage}
				type="postTitle"
				{...classNames(layout.headerImage, style.image)}
			/>
		)}
	</header>
)

//  INDEX HEADER

export const IndexHeader = () => (
	<Header>
		<span>
			Welcome to <span className={style.highlight}>nipafx.dev</span>. On here, it's:
		</span>
		<span>You. Me. Java.</span>
		{null}
		<span>
			Nice of you to stop by. I'm Nicolai (aka nipafx), a Java enthusiast with a
			passion for learning and sharing, online and offline. If you want to sharpen your Java
			skills, you've come to the right place.
		</span>
	</Header>
)

// POST HEADER

export const PostHeader = ({ title, date, channel, tags, intro, featuredImage }) => {
	return (
		<Header featuredImage={featuredImage}>
			<FormattedDate date={date} />
			<MarkdownAsHtml>{title}</MarkdownAsHtml>
			{showTags(channel, tags)}
			<MarkdownAsHtml>{intro}</MarkdownAsHtml>
		</Header>
	)
}

const showTags = (channel, tags) => {
	const channelExists = channel
	const tagsExist = tags && tags.length > 0
	if (!channelExists && !tagsExist) return null
	return (
		<React.Fragment>
			{channelExists && (
				<Channel
					key={channel}
					channel={channel}
					mode="forward"
					colorize
					className={style.channel}
				/>
			)}
			{tagsExist && tags.map(tag => <Tag key={tag} tag={tag} mode="forward" />)}
		</React.Fragment>
	)
}

// PAGE HEADER

export const PageHeader = ({ title, date, tags }) => {
	return (
		<Header>
			<FormattedDate date={date} />
			<MarkdownAsHtml>{title}</MarkdownAsHtml>
			{showTags("pages", tags)}
			{null /* TODO: teaser */}
		</Header>
	)
}

// CHANNEL HEADER

export const ChannelHeader = ({ channel }) => {
	return (
		<Header>
			<span>Everything in</span>
			<Channel channel={channel} plural />
			{null}
			{null /* TODO: description */}
		</Header>
	)
}

// TAG HEADER

export const TagHeader = ({ tag }) => {
	return (
		<Header>
			<span>Everything about</span>
			<Tag tag={tag} />
			{showTags(null, ["tags"])}
			{null /* TODO: description */}
		</Header>
	)
}

export const AllTagsHeader = () => {
	return (
		<Header>
			<span>All the</span>
			<Tag tag={"tags"} />
		</Header>
	)
}

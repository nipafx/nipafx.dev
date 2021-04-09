import React from "react"

import FormattedDate from "./formattedDate"
import { Tag, Channel } from "./taglet"
import Image from "./image"
import Video from "./video"

import { classNames } from "../infra/functions"

import * as layout from "../layout/container.module.css"
import * as style from "./header.module.css"

const Header = ({ children, featuredImage, featuredVideo }) => (
	<header {...classNames(layout.container, style.header)}>
		{children[0] && <div {...classNames(layout.header, style.firstLine)}>{children[0]}</div>}
		{children[1] && <h1 {...classNames(layout.header, style.title)}>{children[1]}</h1>}
		{children[2] && <div {...classNames(layout.header, style.taglets)}>{children[2]}</div>}
		{children[3] && <div {...classNames(layout.header, style.intro)}><p>{children[3]}</p></div>}
		{featuredImage && (
			<Image
				id={featuredImage}
				type="postTitle"
				className={layout.headerImage}
			/>
		)}
		{featuredVideo && <Video slug={featuredVideo} />}
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
			Nice of you to stop by. I'm nipafx, but you can call me Nicolai 😉, a Java enthusiast with
			a passion for learning and sharing, online and offline. If you want to sharpen your Java
			skills, you've come to the right place.
		</span>
	</Header>
)

// POST HEADER

export const PostHeader = ({ title, date, channel, tags, intro, featuredImage, featuredVideo }) => {
	return (
		<Header featuredImage={featuredImage} featuredVideo={featuredVideo}>
			<FormattedDate date={date} />
			<span dangerouslySetInnerHTML={{ __html: title }} />
			{showTags(channel, tags)}
			<span dangerouslySetInnerHTML={{ __html: intro }} />
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
				// without the useless <div>, channels and tag are not aligned
				<div>
					<Channel
						key={channel}
						channel={channel}
						mode="forward"
						colorize
						className={style.channel}
					/>
				</div>
			)}
			{channelExists && tagsExist && (
				// without the useless <div>, channels and tag are not aligned
				<div>
					<span key="separator" {...classNames("inlineSeparator", style.separator)}>
						{" "}
						//{" "}
					</span>
				</div>
			)}
			{tagsExist && (
				<div key="tags" className={style.tags}>
					{tags.map(tag => (
						<Tag key={tag} tag={tag} mode="forward" />
					))}
				</div>
			)}
		</React.Fragment>
	)
}

// PAGE HEADER

export const PageHeader = ({ title, date, tags, intro, featuredImage }) => {
	return (
		<Header featuredImage={featuredImage}>
			<FormattedDate date={date} />
			<span dangerouslySetInnerHTML={{ __html: title }} />
			{showTags("pages", tags)}
			<span dangerouslySetInnerHTML={{ __html: intro }} />
		</Header>
	)
}

// CHANNEL HEADER

export const ChannelHeader = ({ channel, description, featuredImage }) => {
	return (
		<Header featuredImage={featuredImage}>
			<span>Everything in</span>
			<Channel channel={channel} plural />
			{null}
			<span dangerouslySetInnerHTML={{ __html: description }} />
		</Header>
	)
}

// TAG HEADER

export const TagHeader = ({ tag, description, featuredImage }) => {
	return (
		<Header featuredImage={featuredImage}>
			<span>Everything about</span>
			<Tag tag={tag} />
			{null}
			{/* not all tags have a Markdown file and so not all tags have a description */}
			{description ? <span dangerouslySetInnerHTML={{ __html: description }} /> : null}
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

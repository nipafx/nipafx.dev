import React from "react"
import { Link as Internal } from "gatsby"

import ExternalLink from "./externalLink"
import { Channel, ChannelTag, Tag } from "./taglet"

const Link = ({ to, onClick, onIndexPage, markExternal, className, children }) => {
	className = className || ""

	const external =
		to.includes("://") || to.startsWith("//") || to.startsWith("mailto") || to === "feed.xml"
	if (external)
		return (
			<ExternalLink to={to} onClick={onClick} mark={markExternal} className={className}>
				{children}
			</ExternalLink>
		)

	const id = to.startsWith("#")
	if (id)
		return (
			<a href={to} className={className}>
				{children}
			</a>
		)

	if (to.startsWith("channel:")) {
		if (to.includes("/tag:")) {
			const tagStart = to.indexOf("/tag:")
			return (
				<ChannelTag
					channel={to.substring(8, tagStart)}
					tag={to.substring(tagStart + 5)}
					mode={onIndexPage ? "overlink" : "forward"}
					className={className}
				>
					{children}
				</ChannelTag>
			)
		} else
			return (
				<Channel
					channel={to.substring(8)}
					mode={onIndexPage ? "overlink" : "forward"}
					className={className}
				>
					{children}
				</Channel>
			)
	}
	if (to.startsWith("tag:"))
		return (
			<Tag
				tag={to.substring(4)}
				mode={onIndexPage ? "overlink" : "forward"}
				className={className}
			>
				{children}
			</Tag>
		)

	// if internal links don't start with "/", Gatsby emits a warning;
	// prevent that by prefixing internal links with a "/" if they lack one
	to = to.startsWith("/") ? to : `/${to}`
	return (
		<Internal to={to} className={className} onClick={onClick}>
			{children}
		</Internal>
	)
}

export default Link

import React from "react"
import { Link as InternalLink } from "gatsby"

import ExternalLink from "./externalLink"
import { Channel, ChannelTag, Tag } from "./taglet"

const Link = ({
	to,
	dataChannel,
	dataTag,
	onClick,
	onIndexPage,
	markExternal,
	className,
	children,
}) => {
	// this allows use of <Link> if URL is possibly null,
	// in which case the component becomes transparent
	if (!to)
		// if `children` are undefined, this can't return `undefined` or React is
		// very unhappy that the render method didn't return anything; null is ok, though :)
		return children ?? null

	className = className || ""

	const external =
		to.includes("://") || to.startsWith("//") || to.startsWith("mailto") || to === "feed.xml"
	if (external)
		return (
			<ExternalLink
				to={to}
				dataChannel={dataChannel}
				dataTag={dataTag}
				onClick={onClick}
				mark={markExternal}
				className={className}
			>
				{children}
			</ExternalLink>
		)

	const id = to.startsWith("#")
	if (id)
		return (
			<a href={to} data-channel={dataChannel} data-tag={dataTag} className={className}>
				{children}
			</a>
		)

	// I assume `channel:` and `tag:` links do not come with dataChannel and dataTag attributes,
	// so I don't forward it here to keep <ChannelTag>, <Channel>, <Tag> clean(er)
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
	// since trailing slash is the default, link to those pages directly
	// to prevent a redirect, but only if they don't contain a hash
	to = to.endsWith("/") || to.includes("#") ? to : `${to}/`
	return (
		<InternalLink
			to={to}
			data-channel={dataChannel}
			data-tag={dataTag}
			className={className}
			onClick={onClick}
		>
			{children}
		</InternalLink>
	)
}

export default Link

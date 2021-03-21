import React, { useEffect, useLayoutEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"

import { classNames, tagletsFromPath } from "../infra/functions"

import { Channel, Tag } from "./taglet"
import Nav from "./nav"

import * as style from "./postFilter.module.css"
import * as tagletStyle from "./taglet.module.css"
import Feedback from "./feedback"

const PostFilter = () => {
	const { channels, tags } = channelsAndTags()
	const selectedTaglets = tagletsFromPath()
	const channelTitle = selectedTaglets.isChannelSelected("all") ? "channels ◇" : "channels ◆"
	const tagTitle = selectedTaglets.isTagSelected("all") ? "tags ◇" : "tags ◆"
	return (
		<Nav
			title="Filter"
			longHeaders={["channels", "tags", "bugs & features"]}
			shortHeaders={[channelTitle, tagTitle, "bugs"]}
			open
			backToTop
		>
			<div className={style.entries}>
				<Channel
					key="all"
					channel="all"
					plural
					mode="uplink"
					className={
						selectedTaglets.isChannelSelected("all") ? tagletStyle.selected : null
					}
				/>
				<br />
				{channels.map(channel => {
					const classes = [
						channel,
						selectedTaglets.isChannelSelected(channel) ? tagletStyle.selected : null,
					]
					return (
						<Channel
							key={channel}
							channel={channel}
							plural
							mode="uplink"
							{...classNames(classes)}
						/>
					)
				})}
			</div>
			<div className={style.entries}>
				<Tag
					key="all"
					tag="all"
					mode="uplink"
					className={selectedTaglets.isTagSelected("all") ? tagletStyle.selected : null}
				/>
				<br />
				{tags.map(tag => (
					<Tag
						key={tag}
						tag={tag}
						mode="uplink"
						className={selectedTaglets.isTagSelected(tag) ? tagletStyle.selected : null}
					/>
				))}
			</div>
			<Feedback className={style.entries} />
		</Nav>
	)
}

const channelsAndTags = () => {
	const { channels, tags } = useStaticQuery(graphql`
		query {
			channels: allChannel(sort: { fields: internalName }) {
				nodes {
					internalName
				}
			}
			tags: allPost(sort: { fields: slug }) {
				group(field: tags) {
					slug: fieldValue
				}
			}
		}
	`)
	return {
		channels: channels.nodes
			.map(node => node.internalName)
			// remove courses (they are no longer posts)
			.filter(channel => channel !== "courses")
			// remove pages (for now?)
			.filter(channel => channel !== "pages"),
		tags: tags.group.map(group => group.slug),
	}
}

export default PostFilter

import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import { classNames } from "../infra/functions"

import { Channel, Tag } from "./tag"
import Nav from "./nav"

import style from "./postFilter.module.css"

const PostFilter = () => {
	const { channels, tags } = channelsAndTags()
	return (
		<Nav title="Filter" headers={["channels", "tags"]}>
			<div className={style.entries}>
				{channels.map(channel => (
					<Channel key={channel} channel={channel} link plural className={channel}/>
				))}
			</div>
			<div className={style.entries}>
				{tags.map(tag => (
					<Tag key={tag} tag={tag} link />
				))}
			</div>
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
		channels: channels.nodes.map(node => node.internalName),
		tags: tags.group.map(group => group.slug),
	}
}

export default PostFilter

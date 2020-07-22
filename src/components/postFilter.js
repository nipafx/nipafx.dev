import React, { useEffect, useLayoutEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"

import { tagletsFromPath } from "../infra/functions"

import { Channel, Tag } from "./tag"
import Nav from "./nav"

import style from "./postFilter.module.css"
import tagletStyle from "./tag.module.css"

const PostFilter = () => {
	const channelListId = "post-filter-channels-426396"
	const tagListId = "post-filter-tags-247802"
	useLayoutEffect(() => {
		const channelList = document.getElementById(channelListId)
		const tagList = document.getElementById(tagListId)
		highlightSelectedTaglets(channelList, tagList, tagletsFromPath())
	}, [])
	useEffect(() => {
		const channelList = document.getElementById(channelListId)
		const tagList = document.getElementById(tagListId)
		const pathChangeHandler = () =>
			highlightSelectedTaglets(channelList, tagList, tagletsFromPath())
		window.addEventListener("hashchange", pathChangeHandler, false)
		return () => {
			window.removeEventListener("hashchange", pathChangeHandler)
		}
	})

	const { channels, tags } = channelsAndTags()
	return (
		<Nav title="Filter" headers={["channels", "tags"]} open>
			<div id={channelListId} className={style.entries}>
				<Channel key="all" channel="all" plural mode="uplink" />
				<br />
				{channels.map(channel => (
					<Channel
						key={channel}
						channel={channel}
						plural
						mode="uplink"
						className={channel}
					/>
				))}
			</div>
			<div id={tagListId} className={style.entries}>
				<Tag key="all" tag="all" mode="uplink" />
				<br />
				{tags.map(tag => (
					<Tag key={tag} tag={tag} mode="uplink" />
				))}
			</div>
		</Nav>
	)
}

const highlightSelectedTaglets = (channelList, tagList, selectedTaglets) => {
	for (let channel = channelList.firstChild; channel !== null; channel = channel.nextSibling) {
		if (channel.dataset && channel.dataset.channel) {
			const selected = selectedTaglets.isChannelSelected(channel.dataset.channel)
			channel.classList.toggle(tagletStyle.selected, selected)
		}
	}

	for (let tag = tagList.firstChild; tag !== null; tag = tag.nextSibling) {
		if (tag.dataset && tag.dataset.tag) {
			const selected = selectedTaglets.isTagSelected(tag.dataset.tag)
			tag.classList.toggle(tagletStyle.selected, selected)
		}
	}
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

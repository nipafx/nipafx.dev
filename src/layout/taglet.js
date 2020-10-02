import React from "react"

import { classNames } from "../infra/functions"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { ChannelHeader, TagHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostList from "../components/postList"
import PostEnd from "../components/postEnd"

import layout from "./container.module.css"

const TagletLayout = ({ channel, tag, title, description, contentAst, toc, postSlugs }) => {
	const xor = channel ? !tag : tag
	if (!xor) throw new Error(`Specify either \`channel\` ("${channel}") or \`tag\` ("${tag}").`)
	const post = {
		title,
		slug: channel || tag,
		description,
		toc,
		htmlAst: contentAst,
	}
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				{channel ? (
					<ChannelHeader {...{ channel, description }} />
				) : (
					<TagHeader {...{ tag, description }} />
				)}
				<PostContent {...post} />
				<PostEnd type={channel ? "channel" : "tag"} />
			</section>
		</main>
	)
}

export default TagletLayout

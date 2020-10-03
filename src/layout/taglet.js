import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { ChannelHeader, TagHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const TagletLayout = ({ channel, tag, title, description, featuredImage, contentAst, toc, children }) => {
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
					<ChannelHeader {...{ channel, description, featuredImage }} />
				) : (
					<TagHeader {...{ tag, description, featuredImage }} />
				)}
				<PostContent {...post}>{children}</PostContent>
				<PostEnd type={channel ? "channel" : "tag"} />
			</section>
		</main>
	)
}

export default TagletLayout

import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import PostHeader from "../components/postHeader"
import { Channel, Tag } from "../components/tag"
import PostList from "../components/postList"
import RenderHtml from "../infra/renderHtml"
import PostEnd from "../components/postEnd"

import layout from "./container.module.css"

const TagLayout = ({ channel, tag, descriptionHtmlAst, postSlugs }) => {
	const xor = channel ? !tag : tag
	if (!xor) throw new Error("Use this layout with either `channel` or `tag`.")

	const title = channel ? <Channel channel={channel} plural /> : <Tag tag={tag} />
	const tags = channel ? null : ["tags"]
	const endType = channel ? "channel" : "tag"
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader title={title} tags={tags} />
				{showDescription(descriptionHtmlAst)}
				<PostList slugs={postSlugs} />
				<PostEnd type={endType}/>
			</section>
		</main>
	)
}

const showDescription = htmlAst =>
	htmlAst && (
		<div className={layout.container}>
			<RenderHtml htmlAst={htmlAst} />
		</div>
	)

export default TagLayout

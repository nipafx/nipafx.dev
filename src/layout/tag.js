import React from "react"

import { classNames } from  "../infra/functions"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import PostHeader from "../components/postHeader"
import { Channel, Tag } from "../components/tag"
import PostList from "../components/postList"
import RenderHtml from "../infra/renderHtml"
import PostEnd from "../components/postEnd"

import layout from "./container.module.css"
import style from "./tag.module.css"

const TagLayout = ({ channel, tag, descriptionHtmlAst, postSlugs }) => {
	const xor = channel ? !tag : tag
	if (!xor) throw new Error(`Specify either \`channel\` ("${channel}") or \`tag\` ("${tag}").`)

	const title = channel ? <Channel channel={channel} plural /> : <Tag tag={tag} />
	const tags = channel ? null : ["tags"]
	const endType = channel ? "channel" : "tag"

	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader title={title} tags={tags} />
				<div className={layout.container}>
					<div {...classNames(layout.mainCenter, style.description)}>
						{descriptionHtmlAst && <RenderHtml htmlAst={descriptionHtmlAst} />}
						<PostList slugs={postSlugs} />
					</div>
				</div>
				<PostEnd type={endType} />
			</section>
		</main>
	)
}

export default TagLayout

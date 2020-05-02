import React from "react"

import { classNames } from "../infra/functions"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { ChannelHeader, TagHeader } from "../components/header"
import PostList from "../components/postList"
import RenderHtml from "../infra/renderHtml"
import PostEnd from "../components/postEnd"

import layout from "./container.module.css"
import style from "./tag.module.css"

const TagLayout = ({ channel, tag, descriptionHtmlAst, postSlugs }) => {
	const xor = channel ? !tag : tag
	if (!xor) throw new Error(`Specify either \`channel\` ("${channel}") or \`tag\` ("${tag}").`)

	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				{channel ? <ChannelHeader channel={channel} /> : <TagHeader tag={tag} />}
				<div className={layout.container}>
					<div {...classNames(layout.mainCenter, style.description)}>
						{descriptionHtmlAst && <RenderHtml htmlAst={descriptionHtmlAst} />}
						<PostList slugs={postSlugs} />
					</div>
				</div>
				<PostEnd type={channel ? "channel" : "tag"} />
			</section>
		</main>
	)
}

export default TagLayout

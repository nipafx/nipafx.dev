import React from "react"

import { classNames } from "../infra/functions"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { ChannelHeader, TagHeader } from "../components/header"
import PostList from "../components/postList"
import RenderHtml from "../infra/renderHtml"
import PostEnd from "../components/postEnd"

import layout from "./container.module.css"
import style from "./taglet.module.css"

const TagletLayout = ({ channel, tag, description, content, postSlugs }) => {
	const xor = channel ? !tag : tag
	if (!xor) throw new Error(`Specify either \`channel\` ("${channel}") or \`tag\` ("${tag}").`)

	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				{channel ? <ChannelHeader {...{channel, description}} /> : <TagHeader {...{tag, description}} />}
				<div className={layout.container}>
					<div {...classNames(layout.siteHeader, style.description)}>
						{content && <RenderHtml htmlAst={content} />}
						<PostList slugs={postSlugs} />
					</div>
				</div>
				<PostEnd type={channel ? "channel" : "tag"} />
			</section>
		</main>
	)
}

export default TagletLayout

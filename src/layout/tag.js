import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import PostHeader from "../components/postHeader"
import { Tag } from "../components/tag"
import PostList from "../components/postList"
import RenderHtml from "../infra/renderHtml"
import PostEnd from "../components/postEnd"

import layout from "./container.module.css"

const TagLayout = ({ tag, descriptionHtmlAst, postSlugs }) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader title={<Tag tag={tag} />} tags={["tags"]} />
				{showDescription(descriptionHtmlAst)}
				<PostList slugs={postSlugs} />
				<PostEnd type="tag" />
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

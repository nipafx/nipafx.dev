import React from "react"

import PostHeader from "../components/postHeader"
import Tag from "../components/tag"
import PostList from "../components/postList"
import RenderHtml from "../infra/renderHtml"

import layout from "./container.module.css"

const TagLayout = ({ tag, descriptionHtmlAst, postSlugs }) => {
	return (
		<main>
			<section>
				{/* TODO. progress */}
				<PostHeader title={<Tag tag={tag} />} tags={["tags"]} />
				{showDescription(descriptionHtmlAst)}
				<PostList slugs={postSlugs} />
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

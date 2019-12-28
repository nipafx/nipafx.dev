import React from "react"

import ArticleHeader from "../components/articleHeader"
import Tag from "../components/tag"
import PostList from "../components/postList"
import RenderHtml from "../infra/renderHtml"

import layout from "./container.module.css"

const TagLayout = ({ tag, descriptionHtmlAst, postSlugs }) => {
	return (
		<main>
			<section>
				{/* TODO. progress */}
				<ArticleHeader title={<Tag tag={tag} />} tags={["tags"]} />
				{showDescription(descriptionHtmlAst)}
				<PostList postSlugs={postSlugs} />
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

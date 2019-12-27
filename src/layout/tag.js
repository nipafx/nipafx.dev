import React from "react"

import ArticleHeader from "../components/articleHeader"
import PostList from "../components/postList"
import RenderHtml from "../infra/renderHtml"

import layout from "./container.module.css"

const Tag = ({ title, descriptionHtmlAst, postSlugs }) => {
	return (
		<main>
			<section>
				{/* TODO. progress */}
				<ArticleHeader title={title} />
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

export default Tag

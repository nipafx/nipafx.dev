import React from "react"

import ArticleHeader from "../components/articleHeader"
import Link from "../components/link"
import RenderHtml from "../infra/renderHtml"

import layout from "./container.module.css"

const Tag = ({ title, descriptionHtmlAst, posts }) => {
	return (
		<main>
			<section>
				{/* TODO. progress */}
				<ArticleHeader title={title} />
				{showDescription(descriptionHtmlAst)}
				{showPosts(posts)}
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

const showPosts = posts =>
	posts.length > 0 && (
		<div className={layout.container}>
			<ul>
				{posts.map(post => (
					<li key={post.slug}>
						<Link to={post.slug}>{post.title}</Link>
					</li>
				))}
			</ul>
		</div>
	)

export default Tag

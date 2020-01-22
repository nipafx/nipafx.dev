import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import Meta from "../components/meta"
import PostHeader from "../components/postHeader"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const Article = ({
	title,
	slug,
	date,
	tags,
	description,
	searchKeywords,
	featuredImage,
	repo,
	toc,
	htmlAst,
}) => {
	return (
		<main>
			<Meta {...{ title, slug, description, searchKeywords }} />
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, date, tags, featuredImage }} />
				<PostContent {...{ title, repo, toc, htmlAst }} />
				<PostEnd type="article" />
			</section>
		</main>
	)
}

export default Article

import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { PostHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const ArticleLayout = ({ title, date, tags, intro, featuredImage, toc, series, source, htmlAst }) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, date, channel: "articles", tags, intro, featuredImage }} />
				<PostContent {...{ title, toc, series, source, htmlAst }} />
				<PostEnd type="article" />
			</section>
		</main>
	)
}

export default ArticleLayout

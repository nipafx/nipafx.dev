import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import PostHeader from "../components/postHeader"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const ArticleLayout = ({ title, date, tags, featuredImage, repo, toc, htmlAst }) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, date, channel: "articles", tags, featuredImage }} />
				<PostContent {...{ title, repo, toc, htmlAst }} />
				<PostEnd type="article" />
			</section>
		</main>
	)
}

export default ArticleLayout

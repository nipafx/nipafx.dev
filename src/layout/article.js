import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import PostHeader from "../components/postHeader"
import PostContent from "../components/postContent"

const Article = ({ title, date, tags, featuredImage, repo, toc, htmlAst }) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, date, tags, featuredImage }} />
				<PostContent {...{ title, repo, toc, htmlAst }} />
			</section>
		</main>
	)
}

export default Article

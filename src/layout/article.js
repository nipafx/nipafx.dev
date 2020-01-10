import React from "react"

import ProgressBar from "../components/progressBar"
import PostHeader from "../components/postHeader"
import PostContent from "../components/postContent"

const Article = ({ title, date, tags, featuredImage, repo, toc, htmlAst }) => {
	return (
		<main>
			<section id={ProgressBar.REFERENCE}>
				<PostHeader {...{ title, date, tags, featuredImage }} />
				<PostContent {...{title, repo, toc, htmlAst}} />
			</section>
		</main>
	)
}

export default Article

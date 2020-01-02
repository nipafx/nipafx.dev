import React from "react"

import ArticleHeader from "../components/articleHeader"
import PostContent from "../components/postContent"

const Post = ({ title, date, tags, featuredImage, htmlAst }) => {
	return (
		<main>
			<section>
				{/* TODO. progress */}
				<ArticleHeader {...{ title, date, tags, featuredImage }} />
				<PostContent htmlAst={htmlAst} />
			</section>
		</main>
	)
}

export default Post

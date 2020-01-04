import React from "react"

import PostHeader from "../components/postHeader"
import PostContent from "../components/postContent"

const Article = ({ title, date, tags, featuredImage, htmlAst }) => {
	return (
		<main>
			<section>
				{/* TODO. progress */}
				<PostHeader {...{ title, date, tags, featuredImage }} />
				<PostContent htmlAst={htmlAst} />
			</section>
		</main>
	)
}

export default Article

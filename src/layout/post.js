import React from "react"

import PostHeader from "../components/postHeader"
import PostContent from "../components/postContent"

const Post = ({ title, date, tags, htmlAst }) => {
	return (
		<main>
			<section>
				{/* TODO. progress */}
				<PostHeader {...{ title, date, tags }} />
				<PostContent htmlAst={htmlAst} />
			</section>
		</main>
	)
}

export default Post

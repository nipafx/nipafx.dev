import React from "react"

import PostHeader from "../components/postHeader"
import PostContent from "../components/postContent"

import layout from "./container.module.css"

const Post = ({ title, date, htmlAst }) => {
	return (
		<main>
			<section>
				{/* TODO. progress */}
				<PostHeader {...{ title, date }} />
				<PostContent {...{ htmlAst }} />
			</section>
		</main>
	)
}

export default Post

import React from "react"

import ProgressBar from "../components/progressBar"
import PostHeader from "../components/postHeader"
import PostContent from "../components/postContent"

const Post = ({ title, date, tags, url, htmlAst }) => {
	return (
		<main>
			<section id={ProgressBar.REFERENCE}>
				{/* TODO: progress */}
				<PostHeader {...{ title, date, tags }} />
				{/* TODO: embed video from frontmatter URL instead of showing content */}
				<PostContent htmlAst={htmlAst} />
			</section>
		</main>
	)
}

export default Post

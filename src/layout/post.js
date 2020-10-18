import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { PostHeader } from "../components/header"
import PostEnd from "../components/postEnd"

const PostLayout = ({ title, date, channel, tags, intro, featuredImage, children }) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, date, channel, tags, intro, featuredImage }} />
				{children}
				<PostEnd type="article" />
			</section>
		</main>
	)
}

export default PostLayout

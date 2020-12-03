import React from "react"

import { PROGRESS_BAR_REFERENCE_ID } from "../components/progressBar"
import { PostHeader } from "../components/header"
import PostEnd from "../components/postEnd"

const PostLayout = ({ title, date, channel, tags, intro, featuredImage, children }) => {
	return (
		<section id={PROGRESS_BAR_REFERENCE_ID}>
			<PostHeader {...{ title, date, channel, tags, intro, featuredImage }} />
			{children}
			<PostEnd type="article" />
		</section>
	)
}

export default PostLayout

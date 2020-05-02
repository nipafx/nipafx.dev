import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { PostHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const VideoLayout = ({ title, date, tags, htmlAst }) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, date, channel: "videos", tags }} />
				{/* TODO: embed video from frontmatter URL instead of showing content */}
				{/* TODO: show toc and repo */}
				<PostContent htmlAst={htmlAst} />
				<PostEnd type="video" />
			</section>
		</main>
	)
}

export default VideoLayout

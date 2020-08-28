import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { PostHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const VideoLayout = ({ title, slug, videoSlug, date, tags, description, intro, toc, source, htmlAst }) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, date, channel: "videos", tags, intro, featuredVideo: videoSlug }} />
				<PostContent {...{ title, slug, description, toc, source, htmlAst }} />
				<PostEnd type="video" />
			</section>
		</main>
	)
}

export default VideoLayout

import React from "react"

import { PROGRESS_BAR_REFERENCE_ID } from "../components/progressBar"
import { PostHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const VideoLayout = ({ title, slug, videoSlug, date, tags, description, intro, toc, source, htmlAst }) => {
	return (
		<section id={PROGRESS_BAR_REFERENCE_ID}>
			<PostHeader {...{ title, date, channel: "videos", tags, intro, featuredVideo: videoSlug }} />
			<PostContent {...{ title, slug, channel: "videos", description, toc, source, htmlAst }} />
			<PostEnd type="video" />
		</section>
	)
}

export default VideoLayout

import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import Meta from "../components/meta"
import PostHeader from "../components/postHeader"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const Video = ({ title, slug, date, tags, description, searchKeywords, url, htmlAst }) => {
	return (
		<main>
			<Meta {...{ title, slug, description, searchKeywords, videoUrl: url }} />
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, date, tags }} />
				{/* TODO: embed video from frontmatter URL instead of showing content */}
				{/* TODO. forward repo */}
				<PostContent htmlAst={htmlAst} />
				<PostEnd type="video" />
			</section>
		</main>
	)
}

export default Video

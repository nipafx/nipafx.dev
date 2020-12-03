import React from "react"

import { PROGRESS_BAR_REFERENCE_ID } from "../components/progressBar"
import { PostHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const ArticleLayout = ({ title, slug, date, tags, canonical, description, intro, featuredImage, toc, series, source, htmlAst }) => {
	return (
		<section id={PROGRESS_BAR_REFERENCE_ID}>
			<PostHeader {...{ title, date, channel: "articles", tags, intro, featuredImage }} />
			<PostContent {...{ title, slug, channel: "articles", description, toc, canonical, series, source, htmlAst }} />
			<PostEnd type="article" />
		</section>
	)
}

export default ArticleLayout

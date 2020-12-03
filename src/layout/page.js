import React from "react"

import { PROGRESS_BAR_REFERENCE_ID } from "../components/progressBar"
import { PageHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const PageLayout = ({ title, slug, date, tags, description, intro, featuredImage, toc, htmlAst }) => {
	return (
		<section id={PROGRESS_BAR_REFERENCE_ID}>
			<PageHeader {...{ title, date, tags, intro, featuredImage }} />
			<PostContent {...{ title, slug, channel: "pages", description, toc, htmlAst }} />
			<PostEnd type="page" />
		</section>
	)
}

export default PageLayout

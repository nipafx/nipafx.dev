import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { PageHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const PageLayout = ({ title, slug, date, tags, description, toc, htmlAst }) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PageHeader {...{ title, date, tags, description }} />
				<PostContent {...{ title, slug, channel: "pages", description, toc, htmlAst }} />
				<PostEnd type="page" />
			</section>
		</main>
	)
}

export default PageLayout

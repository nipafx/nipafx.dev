import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { PageHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const PageLayout = ({ title, slug, date, tags, description, featuredImage, toc, htmlAst, children }) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PageHeader {...{ title, date, tags, description, featuredImage }} />
				<PostContent {...{ title, slug, channel: "pages", description, toc, htmlAst }}>
					{children}
				</PostContent>
				<PostEnd type="page" />
			</section>
		</main>
	)
}

export default PageLayout

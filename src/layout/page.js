import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import PostHeader from "../components/postHeader"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const PageLayout = ({ title, date, tags, toc, htmlAst }) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, date, tags }} />
				<PostContent {...{ title, toc, htmlAst }} />
				<PostEnd type="page" />
			</section>
		</main>
	)
}

export default PageLayout

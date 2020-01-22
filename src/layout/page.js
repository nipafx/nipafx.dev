import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import Meta from "../components/meta"
import PostHeader from "../components/postHeader"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"

const Page = ({ title, slug, date, tags, description, searchKeywords, toc, htmlAst }) => {
	return (
		<main>
			<Meta {...{ title, slug, description, searchKeywords }} />
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, date, tags }} />
				<PostContent {...{ title, toc, htmlAst }} />
				<PostEnd type="page" />
			</section>
		</main>
	)
}

export default Page

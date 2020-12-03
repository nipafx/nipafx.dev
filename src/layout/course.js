import React from "react"

import { createTableOfContentEntries } from "../components/sessionList"
import { createTableOfContents } from "../infra/stubs"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { PostHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"
import SessionList from "../components/sessionList"

const CourseLayout = ({ title, slug, date, tags, description, intro, toc, featuredImage, htmlAst }) => {
	const sessionsToc = createTableOfContents(createTableOfContentEntries(slug))
	// both tocs contain a "<ul>" wrapper - remove "</ul>" from the first and "<ul>" from the second
	const fullToc = toc.substring(0, toc.length - 5) + sessionsToc.substring(4)
	return (
		<section id={PROGRESS_BAR_REFERENCE}>
			<PostHeader {...{ title, channel: "courses", date, tags, intro, featuredImage }} />
			<PostContent {...{ title, slug, channel: "courses", description, toc: fullToc, htmlAst }}>
				<SessionList slug={slug} />
			</PostContent>
			<PostEnd type="course" />
		</section>
	)
}

export default CourseLayout

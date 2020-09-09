import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { PostHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"
import SessionList from "../components/sessionList"

const CourseLayout = ({title, slug, date, tags, description, intro, featuredImage, slides, videoSlug, htmlAst}) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, channel: "courses", date, tags, intro, featuredImage }} />
				<PostContent {...{ title, slug, description, htmlAst }}>
					<SessionList slug={slug} />
				</PostContent>
				<PostEnd type="course" />
			</section>
		</main>
	)
}

export default CourseLayout

import React from "react"
import { graphql } from "gatsby"

import Site from "../layout/site"
import Video from "../layout/video"

export default ({ data }) => {
	const video = {
		title: data.video.title,
		date: data.video.date,
		tags: data.video.tags,
		url: data.video.url,
		htmlAst: data.video.content.htmlAst,
	}
	return (
		<Site altColor="youtube">
			<Video {...video} />
		</Site>
	)
}

export const query = graphql`
	query($slug: String!) {
		video: video(slug: { eq: $slug }) {
			title
			date
			tags
			url
			content {
				htmlAst
			}
		}
	}
`

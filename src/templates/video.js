import React from "react"
import { graphql } from "gatsby"

import Site from "../layout/site"
import Video from "../layout/video"

export default ({ data }) => {
	const video = {
		title: data.video.title,
		slug: data.video.slug,
		date: data.video.date,
		tags: data.video.tags,
		description: data.video.description,
		searchKeywords: data.video.searchKeywords,
		url: data.video.url,
		htmlAst: data.video.content.htmlAst,
	}
	return (
		<Site className="youtube">
			<Video {...video} />
		</Site>
	)
}

export const query = graphql`
	query($slug: String!) {
		video: video(slug: { eq: $slug }) {
			title
			slug
			date
			tags
			description
			searchKeywords
			url
			content {
				htmlAst
			}
		}
	}
`

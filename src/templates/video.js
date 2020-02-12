import React from "react"
import { graphql } from "gatsby"

import SiteLayout from "../layout/site"
import VideoLayout from "../layout/video"

export default ({ data }) => {
	const video = {
		title: data.video.title,
		date: data.video.date,
		tags: data.video.tags,
		htmlAst: data.video.content.htmlAst,
	}
	const meta = {
		title: data.video.title,
		slug: data.video.slug,
		description: data.video.description,
		searchKeywords: data.video.searchKeywords,
		videoUrl: data.video.url,
	}
	return (
		<SiteLayout className="youtube" meta={meta}>
			<VideoLayout {...video} />
		</SiteLayout>
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

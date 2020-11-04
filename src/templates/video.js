import React from "react"
import { graphql } from "gatsby"

import SiteLayout from "../layout/site"
import VideoLayout from "../layout/video"

import { detectSource, processTableOfContents } from "../infra/stubs"

import videoData from "../../content/meta/videos.json"

export default ({ data }) => {
	const video = {
		title: data.video.title,
		slug: data.video.slug,
		videoSlug: data.video.videoSlug,
		date: data.video.date,
		tags: data.video.tags,
		description: data.video.description,
		intro: data.video.intro ?? data.video.description,
		toc: processTableOfContents(data.video.content.tableOfContents),
		source: detectSource(data.video.repo, data.video.source),
		htmlAst: data.video.content.htmlAst,
	}
	const meta = {
		title: data.video.title,
		slug: data.video.slug,
		publicationDate: data.video.date,
		image: {
			slug: videoData.videos.find(video => video.slug === data.video.videoSlug).thumbnail,
			type: "videoThumbnail",
		},
		description: data.video.description,
		searchKeywords: data.video.searchKeywords,
		videoUrl: videoData.videos.find(video => video.slug === data.video.videoSlug).url,
		structuredDataType: "video",
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
			videoSlug
			date
			tags
			description
			intro
			searchKeywords
			repo {
				url
				title
				type
				description
				restrictive
			}
			source
			content {
				htmlAst
				tableOfContents(pathToSlugField: "frontmatter.slug")
			}
		}
	}
`

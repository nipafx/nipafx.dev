import React from "react"
import { graphql } from "gatsby"

import SiteLayout from "../layout/site"
import TalkLayout from "../layout/talk"

export default ({ data }) => {
	const talk = {
		title: data.talk.title,
		slug: data.talk.slug,
		date: data.talk.date,
		tags: data.talk.tags,
		description: data.talk.description,
		intro: data.talk.intro ?? data.talk.description,
		featuredImage: data.talk.featuredImage,
		slides: data.talk.slides,
		videoSlug: data.talk.videoSlug,
		htmlAst: data.talk.content.htmlAst,
	}
	const meta = {
		title: data.talk.title,
		slug: data.talk.slug,
		description: data.talk.description,
		searchKeywords: data.talk.searchKeywords,
	}
	return (
		<SiteLayout className="talk" meta={meta}>
			<TalkLayout {...talk} />
		</SiteLayout>
	)
}

export const query = graphql`
	query($slug: String!) {
		talk: talk(slug: { eq: $slug }) {
			title
			slug
			date
			tags
			description
			intro
			searchKeywords
			featuredImage
			slides
			videoSlug
			content {
				htmlAst
			}
		}
	}
`

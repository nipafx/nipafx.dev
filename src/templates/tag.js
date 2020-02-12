import React from "react"

import { graphql } from "gatsby"

import SiteLayout from "../layout/site"
import TagLayout from "../layout/tag"

const TagPage = ({ pageContext, data }) => {
	const tag = extractTag(pageContext.tag, data.tags.nodes)
	const postSlugs = extractSlugsWithoutSeries(tag, data.posts.nodes)
	const tagOptions = {
		tag: tag.slug,
		postSlugs,
	}
	if (tag.content) tagOptions.descriptionHtmlAst = tag.content.htmlAst
	const meta = {
		title: tag.title,
		slug: tag.slug,
		description: tag.description || "Articles about " + pageContext.tag,
		searchKeywords: pageContext.tag,
	}

	return (
		<SiteLayout className="site" meta={meta}>
			<TagLayout {...tagOptions} />
		</SiteLayout>
	)
}

const extractTag = (contextTag, dataTags) =>
	dataTags && dataTags.length > 0
		? dataTags[0]
		: {
				slug: contextTag,
		  }

const extractSlugsWithoutSeries = (tag, posts) => {
	const nonSeriesPosts = tag.series
		? posts.filter(post => !tag.series.includes(post.slug))
		: posts
	return nonSeriesPosts.map(post => post.slug)
}

export const pageQuery = graphql`
	query($tag: String) {
		tags: allTag(filter: { slug: { eq: $tag } }) {
			nodes {
				slug
				title
				description
				series
				content {
					htmlAst
				}
			}
		}
		posts: allPost(
			sort: { fields: [date], order: DESC }
			filter: { tags: { in: [$tag] } }
		) {
			nodes {
				slug
			}
		}
	}
`

export default TagPage

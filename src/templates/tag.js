import React from "react"

import { graphql } from "gatsby"

import { processTableOfContents } from "../infra/functions"

import SiteLayout from "../layout/site"
import TagletLayout from "../layout/taglet"

const TagPage = ({ pageContext, data }) => {
	// remember that there may be no data (i.e. no file in `content/tags`) for this tag
	const tag = extractTag(pageContext.tag, data.tags.nodes)
	const postSlugs = extractSlugsWithoutSeries(tag, data.posts.nodes)
	const tagOptions = {
		tag: tag.slug,
		title: tag.title || tag.slug,
		toc:
			tag.content && tag.content.tableOfContents
				? processTableOfContents(tag.content.tableOfContents)
				: undefined,
		postSlugs,
	}
	if (tag.description) tagOptions.description = tag.description
	if (tag.content) tagOptions.contentAst = tag.content.htmlAst
	const meta = {
		title: tag.title || tag.slug,
		slug: tag.slug,
		description: tag.description || "Articles about " + pageContext.tag,
		searchKeywords: pageContext.tag,
	}

	return (
		<SiteLayout className="list" meta={meta}>
			<TagletLayout {...tagOptions} />
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
		? posts.filter(
				post =>
					!tag.series
						.filter(post => post)
						.map(post => post.slug)
						.includes(post.slug)
		  )
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
				series {
					slug
				}
				content {
					htmlAst
					tableOfContents(pathToSlugField: "frontmatter.slug")
				}
			}
		}
		posts: allPost(sort: { fields: [date], order: DESC }, filter: { tags: { in: [$tag] } }) {
			nodes {
				slug
			}
		}
	}
`

export default TagPage

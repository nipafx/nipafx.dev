import React from "react"

import { graphql } from "gatsby"

import Site from "../layout/site"
import Tag from "../layout/tag"

export default ({ pageContext, data }) => {
	const tag = extractTag(pageContext.tag, data.tags.nodes)
	const posts = extractTagPostsWithoutSeries(tag, data.posts.nodes)
	const options = {
		title: tag.title + " Posts",
		posts,
	}
	if (tag.content) options.descriptionHtmlAst = tag.content.htmlAst
	return (
		<Site altColor="blog">
			<Tag {...options} />
		</Site>
	)
}

const extractTag = (contextTag, dataTags) =>
	dataTags && dataTags.length > 0
		? dataTags[0]
		: {
				slug: contextTag,
				// best effort to format the tag
				title: contextTag
					.split("-")
					.map(word => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" "),
		  }

const extractTagPostsWithoutSeries = (tag, posts) =>
	tag.series ? posts.filter(post => !tag.series.includes(post.slug)) : posts

export const pageQuery = graphql`
	query($tag: String) {
		tags: allTag(filter: { slug: { eq: $tag } }) {
			nodes {
				slug
				title
				series
				content {
					htmlAst
				}
			}
		}
		posts: allBlogPost(
			sort: { fields: [date], order: DESC }
			filter: { tags: { in: [$tag] } }
		) {
			nodes {
				slug
				title
			}
		}
	}
`

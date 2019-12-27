import React from "react"

import { graphql } from "gatsby"

import Link from "../components/link"
import RenderHtml from "../infra/renderHtml"

const Tag = ({ pageContext, data }) => {
	const tag = extractTag(pageContext.tag, data.tags.nodes)
	const posts = extractTagPostsWithoutSeries(tag, data.posts.nodes)
	return (
		<div>
			<h1>{tag.title} Posts</h1>
			<Link to="/tags">All tags</Link>
			{tag.content && <RenderHtml htmlAst={tag.content.htmlAst}></RenderHtml>}
			<ul>
				{posts.map(post => (
					<li key={post.slug}>
						<Link to={post.slug}>{post.title}</Link>
					</li>
				))}
			</ul>
		</div>
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

export default Tag

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

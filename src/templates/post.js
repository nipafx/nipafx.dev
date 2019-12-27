import React from "react"
import { graphql } from "gatsby"

import Site from "../layout/site"
import Post from "../layout/post"

export default ({ data }) => {
	const post = {
		title: data.post.title,
		date: data.post.date,
		tags: data.post.tags,
		htmlAst: data.post.content.htmlAst,
	}
	return (
		<Site altColor="blog">
			<Post {...post} />
		</Site>
	)
}

export const query = graphql`
	query($slug: String!) {
		post: blogPost(slug: { eq: $slug }) {
			title
			date
			tags
			content {
				htmlAst
			}
		}
	}
`

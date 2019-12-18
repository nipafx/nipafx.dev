import React from "react"
import { graphql } from "gatsby"

import Site from "../layout/site"
import Post from "../layout/post"

export default ({ data }) => {
	const post = {
		title: data.post.title,
		date: data.post.date,
		htmlAst: data.post.content.htmlAst,
	}
	return (
		<Site altColor="blog">
			<Post {...post} />
		</Site>
	)
}

export const query = graphql`
	query($id: String!) {
		post: blogPost(id: { eq: $id }) {
			title
			date
			content {
				htmlAst
			}
		}
	}
`

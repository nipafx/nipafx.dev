import React from "react"
import { graphql } from "gatsby"

import Site from "../layout/site"

export default ({ data }) => (
		<Site altColor="blog">
			<h1>{data.post.title}</h1>
			<div dangerouslySetInnerHTML={{ __html: data.post.content.html }} />
		</Site>
	)

export const query = graphql`
	query($id: String!) {
		post: blogPost(id: { eq: $id }) {
			title
			content {
				html
			}
		}
	}
`

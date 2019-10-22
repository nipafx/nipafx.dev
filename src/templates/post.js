import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
	console.log(data)
	return (
		<div>
			<h1>{data.post.title}</h1>
			<div dangerouslySetInnerHTML={{ __html: data.post.html }} />
		</div>
	)
}

export const query = graphql`
	query($id: String!) {
		post: blogPost(id: { eq: $id }) {
			title
			html
		}
	}
`

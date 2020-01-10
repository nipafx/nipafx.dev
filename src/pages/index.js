import React from "react"
import { graphql } from "gatsby"

import PostList from "../components/postList"
import Site from "../layout/site"

const IndexPage = ({ data }) => (
	<Site>
		<PostList slugs={data.posts.nodes.map(post => post.slug)} />
	</Site>
)

export const query = graphql`
	{
		posts: allPost(sort: { fields: [date], order: DESC }) {
			nodes {
				slug
			}
		}
	}
`

export default IndexPage

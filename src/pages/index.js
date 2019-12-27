import React from "react"
import { graphql } from "gatsby"

import PostList from "../components/postList"
import Site from "../layout/site"
import Cards from "../components/cards"

const IndexPage = ({ data }) => (
	<Site>
		<PostList postSlugs={data.posts.nodes.map(post => post.slug)} />
		<Cards />
	</Site>
)

export const query = graphql`
	{
		posts: allBlogPost(sort: { fields: [date], order: DESC }) {
			nodes {
				slug
			}
		}
	}
`

export default IndexPage

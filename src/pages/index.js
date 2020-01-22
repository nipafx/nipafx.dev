import React from "react"
import { graphql } from "gatsby"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import PostList from "../components/postList"
import Site from "../layout/site"

const IndexPage = ({ data }) => (
	<Site>
		<div id={PROGRESS_BAR_REFERENCE}>
			<PostList slugs={data.posts.nodes.map(post => post.slug)} />
		</div>
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

import React from "react"
import { graphql } from "gatsby"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import PostList from "../components/postList"
import Site from "../layout/site"

import layout from "../layout/container.module.css"

const IndexPage = ({ data }) => (
	<Site
		className="page"
		meta={{
			slug: "",
			searchKeywords: "Java",
		}}
	>
		<div id={PROGRESS_BAR_REFERENCE} className={layout.container}>
			<div className={layout.mainOffCenter}>
				<PostList slugs={data.posts.nodes.map(post => post.slug)} highlightFirst />
			</div>
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

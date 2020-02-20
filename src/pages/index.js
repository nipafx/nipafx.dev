import React from "react"
import { graphql } from "gatsby"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import PostFilter from "../components/postFilter"
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
		{/* to position nav menu at the bottom (at least in FF):
		 *   - change site.module.css to make inner div span all vertical space with flex and flex-grow
		 *   - add `style={{gridTemplateRows: "max-content 1fr"}}` to the following element
		 */}
		<div id={PROGRESS_BAR_REFERENCE} className={layout.container}>
			<PostFilter />
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

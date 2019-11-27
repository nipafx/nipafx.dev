import React from "react"
import { graphql } from "gatsby"
import { Link } from "gatsby"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import Layout from "../components/layout"
import Cards from "../components/cards"

const IndexPage = ({ data }) => (
	<Layout>
		<p>Hello, World (Blog)</p>
		<ul>
			{data.posts.nodes.map(node => (
				<li>
					<Link to={node.slug}>{node.title} <FontAwesomeIcon icon={["fas", "globe"]} /></Link>
				</li>
			))}
		</ul>
		<Cards />
	</Layout>
)

export const query = graphql`
	{
		posts: allBlogPost(sort: { fields: [date], order: DESC }) {
			nodes {
				slug
				title
			}
		}
	}
`

export default IndexPage

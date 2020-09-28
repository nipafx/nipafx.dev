import React from "react"
import { graphql } from "gatsby"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { IndexHeader } from "../components/header"
import PostFilter from "../components/postFilter"
import PostList from "../components/postList"
import Site from "../layout/site"

import layout from "../layout/container.module.css"

const IndexPage = ({ data }) => (
	<Site
		className="list"
		meta={{
			description: "A website to sharpen your Java skills - by Nicolai (aka nipafx), a Java enthusiast with a passion for learning and sharing, online and offline."
		}}
		onIndexPage
	>
		<IndexHeader />
		<div id={PROGRESS_BAR_REFERENCE} className={layout.container}>
			<PostFilter />
			<div className={layout.main}>
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

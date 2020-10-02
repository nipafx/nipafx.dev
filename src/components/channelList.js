import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import PostList from "./postList"

import layout from "../layout/container.module.css"

const ChannelList = ({ slug }) => {
	return (
		<div className={layout.wide}>
			<PostList slugs={getPostSlugs(slug)} />
		</div>
	)
}

const getPostSlugs = slug => {
	const { posts } = useStaticQuery(
		graphql`
			query {
				posts: allPost(sort: { fields: date, order: DESC }) {
					nodes {
						slug
						channel
					}
				}
			}
		`
	)
	// prettier-ignore
	return posts.nodes
		.filter(post => post.channel === slug)
		.map(post => post.slug)
}

export default ChannelList

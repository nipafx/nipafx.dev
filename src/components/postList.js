import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import Link from "./link"

import layout from "../layout/container.module.css"

const PostList = ({ slugs }) => {
	if (slugs.length === 0) return null

	const posts = getPosts(slugs)

	return (
		<div className={layout.container}>
			<ul>
				{posts.map(post => (
					<li key={post.slug}>
						<Link to={post.slug}>{post.title}</Link>
					</li>
				))}
			</ul>
		</div>
	)
}

const getPosts = slugs => {
	const { posts } = useStaticQuery(
		graphql`
			query {
				posts: allPost {
					nodes {
						slug
						title
					}
				}
			}
		`
	)
	return posts.nodes
		.filter(post => slugs.includes(post.slug))
		.sort((left, right) => slugs.indexOf(left.slug) - slugs.indexOf(right.slug))
}

export default PostList

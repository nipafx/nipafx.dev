import React from "react"
import { graphql } from "gatsby"
import { useStaticQuery } from "gatsby"

import Link from "./link"

import layout from "../layout/container.module.css"

const PostList = ({ postSlugs }) => {
	if (postSlugs.length === 0) return null

	const posts = getPosts(postSlugs)

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
				posts: allBlogPost {
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

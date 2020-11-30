import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import PostCard from "./postCard"

const PostCardWrapper = ({ slug, className }) => {
	const post = getPost(slug)
	return <PostCard {...post} className={className} />
}

const getPost = slug => {
	const { posts } = useStaticQuery(graphql`
		query {
			posts: allPost {
				nodes {
					title
					slug
					date
					channel
					tags
					description
					featuredImage {
						fluid(
							maxWidth: 800
							base64Width: 10
							srcSetBreakpoints: [800, 1600]
							toFormat: JPG
							jpegQuality: 40
						) {
							...GatsbyImageSharpFluid
						}
					}
				}
			}
		}
	`)
	return posts.nodes.find(node => node.slug === slug)
}

export default PostCardWrapper

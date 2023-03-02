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
						gatsbyImageData(
							width: 600,
							formats: [ JPG ]
							jpgOptions: { quality: 40})
					}
				}
			}
		}
	`)
	return posts.nodes.find(node => node.slug === slug)
}

export default PostCardWrapper

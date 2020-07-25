import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import PostList from "./postList"

const SeriesList = ({ slug }) => {
	return <PostList slugs={getPostSlugs(slug)} />
}

const getPostSlugs = slug => {
	const { tags } = useStaticQuery(
		graphql`
			query {
				tags: allTag {
					nodes {
						slug
						series {
							slug
						}
					}
				}
			}
		`
	)
	return tags.nodes.find(tag => tag.slug === slug).series.map(post => post.slug)
}

export default SeriesList

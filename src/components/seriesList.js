import React from "react"
import { graphql } from "gatsby"
import { useStaticQuery } from "gatsby"

import PostList from "./postList"

const SeriesList = ({ slug }) => {
	return <PostList postSlugs={getPostSlugs(slug)} />
}

const getPostSlugs = slug => {
	const { tags } = useStaticQuery(
		graphql`
			query {
				tags: allTag {
					nodes {
						slug
						series
					}
				}
			}
		`
	)
	return tags.nodes.filter(tag => tag.slug === slug)[0].series
}

export default SeriesList

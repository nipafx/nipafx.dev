import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import PostList from "./postList"

import layout from "../layout/container.module.css"

const SeriesList = ({ slug }) => {
	return (
		<div className={layout.wide}>
			<PostList slugs={getPostSlugs(slug)} />
		</div>
	)
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
	// prettier-ignore
	return tags.nodes
		.find(tag => tag.slug === slug)
		.series
		.filter(post => post)
		.map(post => post.slug)
}

export default SeriesList

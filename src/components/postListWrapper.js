import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import { classNames } from "../infra/functions"

import PostList from "./postList"

import style from "./wrapper.module.css"
import layout from "../layout/container.module.css"

const PostListWrapper = ({ kind, slug }) => {
	return <PostList slugs={getPostSlugs(kind, slug)} {...classNames(layout.wide, style.wrapper)} />
}

const getPostSlugs = (kind, slug) => {
	const { posts, tags } = useStaticQuery(
		graphql`
			query {
				posts: allPost(sort: { fields: date, order: DESC }) {
					nodes {
						slug
						channel
						tags
					}
				}
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
	// remember that "posts" (external) are "articles" (internal)!
	const internalSlug = slug === "posts" ? "articles" : slug
	switch (kind) {
		// prettier-ignore
		case "channel": return posts.nodes
			.filter(post => post.channel === internalSlug)
			.map(post => post.slug)
		// prettier-ignore
		case "series": return tags.nodes
			.find(tag => tag.slug === internalSlug)
			.series
			// a series can contain `null` to indicate it is ongoing
			.filter(post => post)
			.map(post => post.slug)
		case "tag":
			return extractPostsWithoutSeries(internalSlug, tags.nodes, posts.nodes)
		default:
			throw new Error("Unknown post list type: " + kind)
	}
}

const extractPostsWithoutSeries = (slug, tags, posts) => {
	const richTag = tags.find(tag => tag.slug === slug)
	const tagPosts = posts.filter(post => post.tags.includes(slug))
	const nonSeriesPosts =
		richTag && richTag.series
			? tagPosts.filter(post => !richTag.series.map(post => post.slug).includes(post.slug))
			: tagPosts
	return nonSeriesPosts.map(post => post.slug)
}

export default PostListWrapper

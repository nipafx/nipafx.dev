import React from "react"

import { classNames } from "../infra/functions"

import PostCard from "./postCard"

import style from "./postList.module.css"

const PostList = ({ slugs, highlightFirst }) => {
	if (slugs.length === 0) return null
	const classes = [style.container]
	if (highlightFirst) classes.push("highlight-first-post-card")
	return (
		<div {...classNames(...classes)}>
			{slugs.map(slug => (
				<PostCard key={slug} slug={slug} className={style.card} />
			))}
		</div>
	)
}

export default PostList

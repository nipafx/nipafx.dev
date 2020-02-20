import React, { useEffect } from "react"

import { classNames, tagletsFromHash } from "../infra/functions"

import PostCard from "./postCard"

import style from "./postList.module.css"

const PostList = ({ slugs, highlightFirst }) => {
	if (slugs.length === 0) return null

	const id = ("post-list-" + Math.random()).replace("0.", "")
	useEffect(() => {
		const postList = document.getElementById(id)
		const hashChangeHandler = () => showSelectedPosts(postList, tagletsFromHash())
		window.addEventListener("hashchange", hashChangeHandler, false)
		return () => {
			window.removeEventListener("hashchange", hashChangeHandler)
		}
	})

	const classes = [style.container]
	if (highlightFirst) classes.push("highlight-first-post-card")

	return (
		<div id={id} {...classNames(...classes)}>
			{slugs.map(slug => (
				<PostCard key={slug} slug={slug} className={style.card} />
			))}
		</div>
	)
}

const showSelectedPosts = (postList, selectedTaglets) => {
	hideAllPosts(postList)
	setTimeout(() => updateVisibility(postList, selectedTaglets), 250)
}

const hideAllPosts = postList => {
	for (let post = postList.firstChild; post !== null; post = post.nextSibling)
		post.classList.add(style.hidden)
}

const updateVisibility = (postList, selectedTaglets) => {
	for (let post = postList.firstChild; post !== null; post = post.nextSibling) {
		const visible =
			selectedTaglets.isChannelShown(post.dataset.channel) &&
			selectedTaglets.areTagsShown(post.dataset.tags.split(","))
		post.style.display = visible ? "" : "none"
		post.classList.remove(style.hidden)
	}
}

export default PostList

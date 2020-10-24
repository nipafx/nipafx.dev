import React, { useEffect, useLayoutEffect } from "react"

import { classNames, tagletsFromPath } from "../infra/functions"

import PostCard from "./postCard"

import style from "./postList.module.css"

const PostList = ({ slugs, highlightFirst, className }) => {
	if (slugs.length === 0) return null

	const id = "post-list-462383"
	useLayoutEffect(() => {
		const postList = document.getElementById(id)
		updateVisibility(postList, tagletsFromPath())
	}, [])
	useEffect(() => {
		const postList = document.getElementById(id)
		const pathChangeHandler = () => showSelectedPosts(postList, tagletsFromPath())
		window.addEventListener("hashchange", pathChangeHandler, false)
		return () => {
			window.removeEventListener("hashchange", pathChangeHandler)
		}
	})

	const classes = [style.container]
	if (className) classes.push(className)
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
		post.classList.toggle(style.removed, !visible)
		post.classList.remove(style.hidden)
	}
}

export default PostList

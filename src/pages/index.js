import React, { useEffect, useLayoutEffect } from "react"
import { graphql } from "gatsby"

import { classNames, tagletsFromPath } from "../infra/functions"

import Site from "../layout/site"
import { IndexHeader } from "../components/header"
import PostFilter from "../components/postFilter"
import PostCard from "../components/postCard"
import { PROGRESS_BAR_REFERENCE_ID } from "../components/progressBar"

import layout from "../layout/container.module.css"
import listStyle from "../components/postList.module.css"

// this page originally used <PostList> but it has a run time of O(n²),
// which may be the reason why the page is sluggish on mobile devices;
// the related GraphQL query is now issued here and the extracted
// <PostCard> is used directly - c.f. #18 and #106

const IndexPage = ({ data }) => {
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

	const posts = data.posts.nodes

	return (
		<Site
			className="list"
			meta={{
				description:
					"A website to sharpen your Java skills - by Nicolai (aka nipafx), a Java enthusiast with a passion for learning and sharing, online and offline.",
				publicationDate: new Date(),
			}}
			onIndexPage
		>
			<section id={PROGRESS_BAR_REFERENCE_ID}>
				<IndexHeader />
				<div className={layout.container}>
					<PostFilter />
					<div
						id={id}
						{...classNames(
							layout.main,
							listStyle.container,
							"highlight-first-post-card"
						)}
					>
						{posts.map(post => (
							<PostCard key={post.slug} {...post} className={listStyle.card} />
						))}
					</div>
				</div>
			</section>
		</Site>
	)
}

export const query = graphql`
	query {
		posts: allPost(sort: { fields: [date], order: DESC }) {
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
`

/*
 * RUN-TIME JS
 */

const showSelectedPosts = (postList, selectedTaglets) => {
	hideAllPosts(postList)
	setTimeout(() => updateVisibility(postList, selectedTaglets), 250)
}

const hideAllPosts = postList => {
	for (let post = postList.firstChild; post !== null; post = post.nextSibling)
		post.classList.add(listStyle.hidden)
}

const updateVisibility = (postList, selectedTaglets) => {
	for (let post = postList.firstChild; post !== null; post = post.nextSibling) {
		const visible =
			selectedTaglets.isChannelShown(post.dataset.channel) &&
			selectedTaglets.areTagsShown(post.dataset.tags.split(","))
		post.classList.toggle(listStyle.removed, !visible)
		post.classList.remove(listStyle.hidden)
	}
}

export default IndexPage

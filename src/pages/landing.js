import React, { useEffect, useLayoutEffect } from "react"
import { graphql } from "gatsby"
import BackgroundImage from "gatsby-background-image"

import { classNames, tagletsFromPath } from "../infra/functions"
import MarkdownAsHtml from "../infra/markdownAsHtml"

import Site from "../layout/site"
import FormattedDate from "../components/formattedDate"
import { IndexHeader } from "../components/header"
import Link from "../components/link"
import PostFilter from "../components/postFilter"
import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { Channel, Tag } from "../components/taglet"

import layout from "../layout/container.module.css"
import listStyle from "../components/postList.module.css"
import style from "../components/postCard.module.css"

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
			<IndexHeader />
			<div id={PROGRESS_BAR_REFERENCE} className={layout.container}>
				<PostFilter />
				<div
					id={id}
					{...classNames(layout.main, listStyle.container, "highlight-first-post-card")}
				>
					{posts.map(post => (
						<PostCard key={post.slug} post={post} />
					))}
				</div>
			</div>
		</Site>
	)
}

const PostCard = ({ post }) => {
	const { title, slug, date, channel, tags, description, featuredImage } = post
	return (
		<div
			data-channel={channel}
			data-tags={tags}
			{...classNames(style.card, channel, listStyle.card)}
		>
			<Link to={slug}>
				<ImageCard image={featuredImage}>
					<div className={style.content}>
						<div className={style.cover} />
						<div className={style.details}>
							<div className={style.top}>
								<span className={style.title}>
									<span>{title}</span>
								</span>
								<span className={style.channel}>
									<Channel channel={channel} colorize />
								</span>
								<span className={style.tags}>
									{tags.map(tag => (
										<Tag key={tag} tag={tag} />
									))}
								</span>
							</div>
							<p className={style.description}>
								<span>{description}</span>
								<span className={style.date}>
									<FormattedDate date={date} />
								</span>
							</p>
						</div>
					</div>
				</ImageCard>
			</Link>
		</div>
	)
}

const ImageCard = ({ image, children }) => {
	if (image)
		return (
			<BackgroundImage fluid={image.fluid} className={style.image}>
				{children}
			</BackgroundImage>
		)
	else return <div id={style.image}>{children}</div>
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

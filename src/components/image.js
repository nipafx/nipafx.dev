import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"

import { classNames } from "../infra/functions"

import Link from "./link"

import style from "./image.module.css"

const Image = ({ id, type, className }) => {
	const image = getImage(id, type)
	if (!exists(image, id, type)) return null

	return (
		<div {...classNames(className, style.container)}>
			{/* TODO: specify dimensions (see console warning) / add alt text */}
			<Img {...image.image} />
			{showCredits(type) && <Credits {...image.credits} />}
		</div>
	)
}

const Credits = credits => {
	if (!credits || (!credits.author && !credits.source && !credits.license)) return null

	return (
		<div className={style.credits}>
			{credits.source && (
				<span key="source">
					<Link to={credits.source.url}>source</Link>
				</span>
			)}
			{credits.author && (
				<span key="author">
					<Link to={credits.author.url}>
						{credits.author.name ? credits.author.name : "artist"}
					</Link>
					{credits.edited && (
						<span> (edited by me)</span>
					)}
				</span>
			)}
			{credits.license && (
				<span key="license">
					<Link to={credits.license.url}>
						{credits.license.name ? credits.license.name : "license"}
					</Link>
				</span>
			)}
		</div>
	)
}

const getImage = (id, type) => {
	const imageData = getImageData()
	const img = findImageInData(imageData, type, id)
	const image = img
		? isFixedType(type)
			? { fixed: img.fixed }
			: { fluid: img.fluid }
		: undefined
	const json = imageData.meta.nodes.find(node => node.slug === id)
	const credits = findCreditsInData(json)
	return {
		image,
		credits,
	}
}

const getImageData = () => {
	return useStaticQuery(
		graphql`
			query {
				articleTitle: allImageSharp(
					filter: { fields: { collection: { eq: "article-title-images" } } }
				) {
					nodes {
						fields {
							id
						}
						fluid(maxWidth: 1000, srcSetBreakpoints: [1000, 2000], jpegQuality: 80) {
							...GatsbyImageSharpFluid
						}
					}
				}
				pageTitle: allImageSharp(
					filter: { fields: { collection: { eq: "page-title-images" } } }
				) {
					nodes {
						fields {
							id
						}
						fluid(maxWidth: 1000, srcSetBreakpoints: [1000, 2000], jpegQuality: 80) {
							...GatsbyImageSharpFluid
						}
					}
				}
				videoTitle: allImageSharp(
					filter: { fields: { collection: { eq: "video-title-images" } } }
				) {
					nodes {
						fields {
							id
						}
						fluid(maxWidth: 1000, srcSetBreakpoints: [1000, 2000], jpegQuality: 80) {
							...GatsbyImageSharpFluid
						}
					}
				}
				videoThumbnail: allImageSharp(
					filter: { fields: { collection: { eq: "video-thumbnail-images" } } }
				) {
					nodes {
						fields {
							id
						}
						fluid(maxWidth: 1000, srcSetBreakpoints: [1000, 2000], jpegQuality: 80) {
							...GatsbyImageSharpFluid
						}
					}
				}
				content: allImageSharp(
					filter: { fields: { collection: { eq: "content-images" } } }
				) {
					nodes {
						fields {
							id
						}
						fluid(maxWidth: 800, srcSetBreakpoints: [300, 800]) {
							...GatsbyImageSharpFluid
						}
					}
				}
				meta: allImagesJson {
					nodes {
						slug
						credits {
							author {
								name
								url
							}
							source {
								url
							}
							license {
								name
								url
							}
						}
					}
				}
			}
		`
	)
}

const findImageInData = (imageData, type, id) => {
	switch (type) {
		case "postTitle":
		case "postCard":
			return (
				imageData.articleTitle.nodes.find(node => node.fields.id === id) ||
				imageData.pageTitle.nodes.find(node => node.fields.id === id) ||
				imageData.videoTitle.nodes.find(node => node.fields.id === id)
			)
		case "content":
		case "sidebar":
			return imageData.content.nodes.find(node => node.fields.id === id)
		case "videoThumbnail":
			return imageData.videoThumbnail.nodes.find(node => node.fields.id === id)
	}
}

const findCreditsInData = json => {
	if (!json || !json.credits) return undefined

	if (json.credits.author && json.credits.author.name === "me")
		return {
			author: {
				name: "me",
				url: "/nicolai-parlog",
			},
			license: {
				name: "CC-BY-NC 4.0",
				url: "https://creativecommons.org/licenses/by-nc/4.0/",
			},
		}

	return json.credits
}

const isFixedType = type => {
	switch (type) {
		case "postTitle":
		case "postCard":
		case "content":
		case "sidebar":
		case "videoThumbnail":
				return false
		default:
			throw new Error(`Unknown image type "${type}".`)
	}
}

const showCredits = type => {
	switch (type) {
		case "postTitle":
		case "content":
		case "sidebar":
			return true
		case "postCard":
		case "videoThumbnail":
			return false
		default:
			throw new Error(`Unknown image type "${type}".`)
	}
}

const exists = (image, id, type) => {
	if (image.image) return true

	const message = `Missing ${type} image: ${id}`
	if (process.env.NODE_ENV === `production`) throw new Error(message)
	else console.warn(message)

	return false
}

export default Image

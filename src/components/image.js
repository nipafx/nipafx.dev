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
			<Credits {...image.credits} />
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
	const credits = json ? json.credits : undefined
	return {
		image,
		credits,
	}
}

const getImageData = () => {
	// TODO: decide on duotone (in `fluid(...)`)
	//			duotone: { highlight: "#69ea7d", shadow: "#262429" }
	// neon green: #69ea7d
	// neon pink: #fe019a
	// bg: #262429
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
								name
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
			return (
				imageData.articleTitle.nodes.find(node => node.fields.id === id) ||
				imageData.pageTitle.nodes.find(node => node.fields.id === id) ||
				imageData.videoTitle.nodes.find(node => node.fields.id === id)
			)
		case "content":
		case "sidebar":
			return imageData.content.nodes.find(node => node.fields.id === id)
	}
}

const isFixedType = type => {
	switch (type) {
		case "postTitle":
		case "content":
		case "sidebar":
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

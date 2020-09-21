import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"

import { classNames } from "../infra/functions"

import Link from "./link"

import style from "./image.module.css"

import metaData from "../../images/images.json"

const Image = ({ id, type, className }) => {
	const image = getImage(id, type)
	if (!exists(image, id, type)) return null

	return (
		<div {...classNames(className, style.container)}>
			{/* TODO: specify dimensions (see console warning) / add alt text */}
			<Img {...image.image} />
			{showCredits(type) && credits(image.credits, type)}
		</div>
	)
}

const credits = (credits, type) => {
	if (!credits || (!credits.author && !credits.source && !credits.license)) return null
	const classes = [style.credits].concat(typeClasses(type))

	return (
		<div {...classNames(...classes)}>
			{credits.source && (
				<span key="source">
					{credits.source.url ? <Link to={credits.source.url}>source</Link> : source}
				</span>
			)}
			{credits.author && (
				<span key="author">
					{credits.author.url ? (
						<Link to={credits.author.url}>artist</Link>
					) : (
						credits.author.name
					)}
					{credits.edited && <span> (edited by me)</span>}
				</span>
			)}
			{credits.license &&
				(credits.license.url ? (
					<span key="license">
						<Link to={credits.license.url}>
							{credits.license.name ? credits.license.name : "license"}
						</Link>
					</span>
				) : (
					<span>{credits.license.name}</span>
				))}
		</div>
	)
}

const typeClasses = type => {
	switch (type) {
		case "content":
		case "sidebar":
			return [style.sideCredits]
		case "postTitle":
			return [style.topCredit]
		case "postCard":
		case "videoThumbnail":
		default:
			return []
	}
}

const getImage = (id, type) => {
	const imageData = getImageData()
	const img = findImageInData(imageData, type, id)
	const image = img
		? isFixedType(type)
			? { fixed: img.fixed }
			: { fluid: img.fluid }
		: undefined
	const json = metaData.find(node => node.slug === id)
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
				courseTitle: allImageSharp(
					filter: { fields: { collection: { eq: "course-title-images" } } }
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
				talkTitle: allImageSharp(
					filter: { fields: { collection: { eq: "talk-title-images" } } }
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
				eventLogos: allImageSharp(
					filter: { fields: { collection: { eq: "event-logos" } } }
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
				imageData.courseTitle.nodes.find(node => node.fields.id === id) ||
				imageData.pageTitle.nodes.find(node => node.fields.id === id) ||
				imageData.talkTitle.nodes.find(node => node.fields.id === id) ||
				imageData.videoTitle.nodes.find(node => node.fields.id === id)
			)
		case "eventCard":
			return imageData.eventLogos.nodes.find(node => node.fields.id === id)
		case "content":
		case "sidebar":
			return imageData.content.nodes.find(node => node.fields.id === id)
		case "videoThumbnail":
			return (
				imageData.videoThumbnail.nodes.find(node => node.fields.id === id) ||
				// a video post's title image and the video's thumbnail are often identical;
				// to reduce duplication of images, we fall through from the thumbnail folder to the video title image folder
				// (I would've preferred the other way around, but we don't know what kind of post [e.g. article vs video]
				// we're looking for a title image for)
				imageData.videoTitle.nodes.find(node => node.fields.id === id)
			)
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
		case "eventCard":
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
		case "eventCard":
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

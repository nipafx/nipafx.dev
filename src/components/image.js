import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"

import { classNames } from "../infra/functions"

import Link from "./link"

import style from "./image.module.css"

import metaData from "../../images/images.json"

const Image = ({ id, type, className }) => {
	const image = getImageWithCredits(id, type)

	return (
		<div {...classNames(className, style.container)}>
			<Img {...image.image} />
			{showCredits(type) && credits(image.credits, type)}
		</div>
	)
}

const credits = (credits, type) => {
	if (!credits || (!credits.author && !credits.source && !credits.license)) return null
	const classes = [style.credits].concat(typeClasses(type))
	const source = responsiveText("src", "source")
	const author = responsiveText(
		credits.author.name === "me" ? "me" : "dev",
		credits.author.name === "me" ? "me" : "artist"
	)
	const license = responsiveText("lic", "license")

	return (
		<div {...classNames(...classes)}>
			{credits.source && (
				<span key="source">
					<Link to={credits.source.url}>{source}</Link>
				</span>
			)}
			{credits.author && (
				<span key="author">
					<Link to={credits.author.url}>{author}</Link>
					{credits.edited && <span> (edited by me)</span>}
				</span>
			)}
			{credits.license && (
				<span key="license">
					<Link to={credits.license.url}>{license}</Link>
				</span>
			)}
		</div>
	)
}

const responsiveText = (short, long) => {
	return (
		<React.Fragment>
			<span className={style.short}>{short}</span>
			<span className={style.long}>{long}</span>
		</React.Fragment>
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

const getImageWithCredits = (id, type) => {
	const img = getImage(id, type)
	const image = isFixedType(type) ? { fixed: img.fixed } : { fluid: img.fluid }
	const json = metaData.find(node => node.slug === id)
	const credits = findCreditsInData(json)
	return {
		image,
		credits,
	}
}

export const getImagePath = (id, type) => {
	const img = getImage(id, type)
	return img[isFixedType(type) ? "fixed" : "fluid"].src
}

const getImage = (id, type) => {
	const imageData = getImageData()
	const image = findImageInData(imageData, type, id)
	if (!image) {
		const message = `Missing ${type} image: ${id}`
		throw new Error(message)
	}
	return image
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
						fluid(maxWidth: 1000, srcSetBreakpoints: [1000, 2000], jpegQuality: 60) {
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
						fluid(maxWidth: 1000, srcSetBreakpoints: [1000, 2000], jpegQuality: 60) {
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
						fluid(maxWidth: 1000, srcSetBreakpoints: [1000, 2000], jpegQuality: 60) {
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
						fluid(maxWidth: 1000, srcSetBreakpoints: [1000, 2000], jpegQuality: 60) {
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
						fluid(maxWidth: 1000, srcSetBreakpoints: [1000, 2000], jpegQuality: 60) {
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
						fluid(maxWidth: 1000, srcSetBreakpoints: [1000, 2000], jpegQuality: 60) {
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
						fluid(maxWidth: 800, srcSetBreakpoints: [800], jpegQuality: 60) {
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
						fluid(maxWidth: 800, srcSetBreakpoints: [800], jpegQuality: 60) {
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

export default Image

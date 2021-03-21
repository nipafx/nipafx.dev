import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

import { classNames } from "../infra/functions"

import Link from "./link"

import * as style from "./image.module.css"

import metaData from "../../images/images.json"

const Image = ({ id, type, className }) => {
	const image = getImage(id, type)

	return (
		<div {...classNames(className, style.container)}>
			<GatsbyImage image={image.data} alt={image.alt}/>
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
		<div {...classNames(classes)}>
			{credits.source && credits.source.url && (
				<span key="source">
					<Link to={credits.source.url}>{source}</Link>
				</span>
			)}
			{credits.author && credits.author.url && (
				<span key="author">
					<Link to={credits.author.url}>{author}</Link>
					{credits.edited && <span> (edited by me)</span>}
				</span>
			)}
			{credits.license && credits.license.url && (
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

export const getImageMeta = (id, type) => {
	const image = getImage(id, type)
	return {
		path: image.data.images.fallback.src,
		alt: image.alt
	}
}

const getImage = (id, type) => {
	const img = getImageData(id, type)
	const data = img.gatsbyImageData
	const json = metaData.find(image => image.slug === id)
	const alt = json?.alt || ""
	const credits = findCreditsInData(json)
	return {
		data,
		alt,
		credits,
	}
}

const getImageData = (id, type) => {
	const imagesData = getImagesData()
	const image = findImageInData(imagesData, type, id)
	if (!image) {
		const message = `Missing ${type} image: ${id}`
		throw new Error(message)
	}
	return image
}

const getImagesData = () => {
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
						gatsbyImageData(layout: FULL_WIDTH breakpoints: [1000, 2000] jpgOptions: { quality: 60 } placeholder: BLURRED)
					}
				}
				courseTitle: allImageSharp(
					filter: { fields: { collection: { eq: "course-title-images" } } }
				) {
					nodes {
						fields {
							id
						}
						gatsbyImageData(layout: FULL_WIDTH breakpoints: [1000, 2000] jpgOptions: { quality: 60 } placeholder: BLURRED)
					}
				}
				pageTitle: allImageSharp(
					filter: { fields: { collection: { eq: "page-title-images" } } }
				) {
					nodes {
						fields {
							id
						}
						gatsbyImageData(layout: FULL_WIDTH breakpoints: [1000, 2000] jpgOptions: { quality: 60 } placeholder: BLURRED)
					}
				}
				talkTitle: allImageSharp(
					filter: { fields: { collection: { eq: "talk-title-images" } } }
				) {
					nodes {
						fields {
							id
						}
						gatsbyImageData(layout: FULL_WIDTH breakpoints: [1000, 2000] jpgOptions: { quality: 60 } placeholder: BLURRED)
					}
				}
				videoTitle: allImageSharp(
					filter: { fields: { collection: { eq: "video-title-images" } } }
				) {
					nodes {
						fields {
							id
						}
						gatsbyImageData(layout: FULL_WIDTH breakpoints: [1000, 2000] jpgOptions: { quality: 60 } placeholder: BLURRED)
					}
				}
				videoThumbnail: allImageSharp(
					filter: { fields: { collection: { eq: "video-thumbnail-images" } } }
				) {
					nodes {
						fields {
							id
						}
						gatsbyImageData(layout: FULL_WIDTH breakpoints: [1000, 2000] jpgOptions: { quality: 60 } placeholder: BLURRED)
					}
				}
				content: allImageSharp(
					filter: { fields: { collection: { eq: "content-images" } } }
				) {
					nodes {
						fields {
							id
						}
						gatsbyImageData(layout: CONSTRAINED width: 800 jpgOptions: { quality: 60 } placeholder: BLURRED)
					}
				}
				eventLogos: allImageSharp(
					filter: { fields: { collection: { eq: "event-logos" } } }
				) {
					nodes {
						fields {
							id
						}
						gatsbyImageData(layout: FULL_WIDTH breakpoints: [800] jpgOptions: { quality: 60 } placeholder: BLURRED)
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

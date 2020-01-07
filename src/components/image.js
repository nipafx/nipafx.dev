import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"

import { className as classNames } from "../infra/functions"

import Link from "./link"

import style from "./image.module.css"

const Image = ({ id, type, className }) => {
	const image = getImage(type, id)
	if (!image.image) return null
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
		<ul className={style.credits}>
			{credits.source && (
				<li key="source">
					<Link to={credits.source.url}>source</Link>
				</li>
			)}
			{credits.author && (
				<li key="author">
					<Link to={credits.author.url}>
						{credits.author.name ? credits.author.name : "artist"}
					</Link>
				</li>
			)}
			{credits.license && (
				<li key="license">
					<Link to={credits.license.url}>
						{credits.license.name ? credits.license.name : "license"}
					</Link>
				</li>
			)}
		</ul>
	)

	return creditText
}

const getImage = (type, id) => {
	const imageData = getImageData(type)
	const img = imageData.allImageSharp.nodes.find(node => node.fields.id === id)
	const image = img
		? isFixedType(type)
			? { fixed: img.fixed }
			: { fluid: img.fluid }
		: undefined
	const json = imageData.allImagesJson.nodes.find(node => node.slug === id)
	const credits = json ? json.credits : undefined
	return {
		image,
		credits,
	}
}

const getImageData = type => {
	switch (type) {
		case "post-title":
			return useStaticQuery(
				graphql`
					query {
						...Credits
						...PostTitleImage
					}
				`
			)
		default:
			throw `Unknown image type "${type}".`
	}
}

const isFixedType = type => {
	switch (type) {
		case "post-title":
			return false
		default:
			throw `Unknown image type "${type}".`
	}
}

export const imageAsPostTitleQuery = graphql`
	fragment PostTitleImage on Query {
		allImageSharp(filter: { fields: { collection: { eq: "content-images" } } }) {
			nodes {
				fields {
					id
				}
				fluid(maxWidth: 1280) {
					...GatsbyImageSharpFluid
				}
			}
		}
	}
`

export const metaQuery = graphql`
	fragment Credits on Query {
		allImagesJson {
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

export default Image

import React from "react"
import { graphql } from "gatsby"
import { useStaticQuery } from "gatsby"
import Img from "gatsby-image"

const Card = ({ imageId, url, cssId }) => {
	const { images } = useStaticQuery(
		graphql`
			query {
				images: allImageSharp(filter: { fields: { collection: { eq: "src-images" } } }) {
					nodes {
						fields {
							id
						}
						fluid(maxWidth: 320) {
							...GatsbyImageSharpFluid
						}
					}
				}
			}
		`
	)

	const image = images.nodes.filter(node => node.fields.id === imageId)[0]

	return (
		<div id={cssId} style={{ borderRadius: `5px` }}>
			<a href={url}>
				<Img fluid={image.fluid} />
			</a>
		</div>
	)
}

export default Card

import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"

import { classNames, resetPath } from "../infra/functions"

import Link from "./link"

import style from "./siteLogo.module.css"

const SiteLogo = ({ className, onIndexPage }) => {
	const onClick = onIndexPage ? _ => resetPath() : null
	return (
		<div {...classNames(className, style.logo)}>
			<Link to="/" onClick={onClick}>
				<Img {...logo()} />
			</Link>
		</div>
	)
}

const logo = () =>
	// * using "fixed" images because "fluid" cut off a few pixels on the left - not sure why
	// * using "noBase64" prevents the blur-up effect, which I don't like for the logo
	useStaticQuery(graphql`
		query {
			logo: imageSharp(fields: { id: { eq: "logo" } }) {
				fields {
					id
				}
				fixed(width: 200, jpegQuality: 80) {
					...GatsbyImageSharpFixed_noBase64
				}
			}
		}
	`).logo

export default SiteLogo

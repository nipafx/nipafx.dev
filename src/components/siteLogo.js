import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"

import { classNames } from "../infra/functions"

import Link from "./link"

import style from "./siteLogo.module.css"

const SiteLogo = ({ className }) => {
	return (
		<div {...classNames(className, style.logo)}>
			<Link to="/">
				<Img {...logo()} />
			</Link>
		</div>
	)
}

const logo = () =>
	useStaticQuery(graphql`
		query {
			logo: imageSharp(fields: { id: { eq: "logo" } }) {
				fields {
					id
				}
				fluid(maxWidth: 200, srcSetBreakpoints: [100, 200, 400], jpegQuality: 80) {
					...GatsbyImageSharpFluid
				}
			}
		}
	`).logo

export default SiteLogo

import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import { classNames, resetPath } from "../infra/functions"

import Link from "./link"

import * as style from "./siteLogo.module.css"

const SiteLogo = ({ className, onIndexPage }) => {
	const onClick = onIndexPage ? _ => resetPath() : null
	return (
		<div {...classNames(className, style.logo)}>
			<Link to="/" onClick={onClick}>
				<img src={logo()} />
			</Link>
		</div>
	)
}

const logo = () =>
	// I switched to a base64-encoded image, so the logo shows up immediately. At 200px width,
	// this adds 6.4KiB per logo, which appears in header and footer, so ~13KiB in total.
	useStaticQuery(graphql`
		query {
			logo: imageSharp(fields: { id: { eq: "logo" } }) {
				gatsbyImageData(placeholder: BLURRED blurredOptions: { width: 200 })
			}
		}
	`).logo.gatsbyImageData.placeholder.fallback

export default SiteLogo

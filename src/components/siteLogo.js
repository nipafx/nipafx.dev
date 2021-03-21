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
				<img src={logo().base64} />
			</Link>
		</div>
	)
}

const logo = () =>
	// I switched to a base64-encoded image, so the logo shows up immediately. At 200px width,
	// this adds 6.4KiB per logo, which appears in header and footer, so ~13KiB in total.
	//
	// Before base64, I used "fixed" and "noBase64" and in case I need to go back, these comments are helpful:
	// * using "fixed" images because "fluid" cut off a few pixels on the left - not sure why
	// * using "noBase64" prevents the blur-up effect, which I don't like for the logo
	useStaticQuery(graphql`
		query {
			logo: imageSharp(fields: { id: { eq: "logo" } }) {
				fixed(base64Width: 200) {
					base64
				}
			}
		}
	`).logo.fixed

export default SiteLogo

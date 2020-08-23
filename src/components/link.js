import React from "react"
import { Link as Internal } from "gatsby"

import ExternalLink from "./externalLink"
import { tagletPath } from "../infra/functions"

const Link = ({ to, children, onClick, className }) => {
	className = className || ""

	const external =
		to.includes("://") || to.startsWith("//") || to.startsWith("mailto")
	if (external) return <ExternalLink to={to} className={className} onClick={onClick}>{children}</ExternalLink>

	const id = to.startsWith("#")
	if (id) return <a href={to} className={className}>{children}</a>

	if (to.startsWith("tag:")) to = tagletPath("tag", to.substring(4))
	if (to.startsWith("channel:")) to = tagletPath("channel", to.substring(8))

	// if internal links don't start with "/", Gatsby emits a warning;
	// prevent that by prefixing internal links with a "/" if they lack one
	to = to.startsWith("/") ? to : `/${to}`
	return <Internal to={to} className={className} onClick={onClick}>{children}</Internal>
}

export default Link

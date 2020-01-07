import React from "react"
import { Link as Internal } from "gatsby"

import ExternalLink from "./externalLink"

const Link = ({ to, children }) => {
	const external =
		to.includes("://") || to.startsWith("//") || to.startsWith("mailto")
	if (external) return <ExternalLink to={to}>{children}</ExternalLink>

	const id = to.startsWith("#")
	if (id) return <a href={to}>{children}</a>

	// if internal links don't start with "/", Gatsby emits a warning;
	// prevent that by prefixing internal links with a "/" if they lack one
	to = to.startsWith("/") ? to : `/${to}`
	return <Internal to={to}>{children}</Internal>
}

export default Link

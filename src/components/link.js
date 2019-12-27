import React from "react"
import { Link as Internal } from "gatsby"

import ExternalLink from "./externalLink"

const Link = ({ to, children }) => {
	const external =
		to.indexOf("://") > 0 || to.startsWith("//") || to.startsWith("mailto")
	// if internal links don't start with "/", Gatsby emits a warning;
	// prevent that by prefixing internal links with a "/" if they lack one
	const internalWithoutPrefix = !external && !to.startsWith("/")
	to = internalWithoutPrefix ? `/${to}` : to
	return external ? <ExternalLink to={to}>{children}</ExternalLink> : <Internal to={to}>{children}</Internal>
}

export default Link

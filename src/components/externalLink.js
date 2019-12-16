import React from "react"

// maybe prefix with https://commons.wikimedia.org/wiki/File:External.svg ?
const ExternalLink = ({ to, className, children }) => {
	className = className ? className : ""
	return (
		<a className={className} rel="noopener noreferrer" href={to}>
			{children}
		</a>
	)
}

export default ExternalLink

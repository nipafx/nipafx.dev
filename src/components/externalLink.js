import React from "react"

// maybe prefix with https://commons.wikimedia.org/wiki/File:External.svg ?
const ExternalLink = ({ to, onClick, className, children }) => {
	className = className || ""
	return (
		<a className={className} rel="noopener noreferrer" href={to} onClick={onClick}>
			{children}
		</a>
	)
}

export default ExternalLink

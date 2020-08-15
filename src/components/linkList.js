import React from "react"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { classNames } from "../infra/functions"

import Link from "./link"

import style from "./linkList.module.css"

const LinkList = ({ showIcons, links, className }) => {
	const styles = [className]
	if (showIcons) styles.push(style.icons)
	else styles.push(style.text)
	return (
		<span {...classNames(...styles)}>
			{links.map(link => selectDisplay(showIcons, link)).map(showLink)}
		</span>
	)
}

const selectDisplay = (showIcons, { title, fontAwesome, url, className }) => {
	return {
		element: showIcons && fontAwesome ? <FontAwesomeIcon icon={fontAwesome} /> : title,
		url,
		className,
	}
}

const showLink = ({ element, url, className }) => (
	<span key={url}>
		<Link to={url} className={className}>
			{element}
		</Link>
	</span>
)

export default LinkList

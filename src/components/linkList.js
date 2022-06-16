import React from "react"

import FaIcon from "./faIcon"

import { classNames } from "../infra/functions"

import Link from "./link"

import * as style from "./linkList.module.css"

const LinkList = ({ showOnlyTexts, showOnlyIcons, showIconsUntil, links, className }) => {
	const textsFrom = showTextsFrom(showOnlyTexts, showOnlyIcons, showIconsUntil)

	const styles = [className, style.links]
	if (textsFrom === 0) styles.push(style.texts)
	if (textsFrom === 600) styles.push(style.textsFrom600)
	if (textsFrom === 1200) styles.push(style.textsFrom1200)

	return <div {...classNames(styles)}>{links.map(link => showLink(link, showOnlyIcons))}</div>
}

const showTextsFrom = (showOnlyTexts, showOnlyIcons, showIconsUntil) => {
	const xor =
		(showOnlyTexts && !showOnlyIcons && !showIconsUntil) ||
		(!showOnlyTexts && showOnlyIcons && !showIconsUntil) ||
		(!showOnlyTexts && !showOnlyIcons && showIconsUntil)
	if (!xor) {
		const message = `Specify either \`showOnlyTexts\` ("${showOnlyTexts}") or \`showOnlyIcons\` ("${showOnlyIcons}") or \`showIconsUntil\` ("${showIconsUntil}").`
		throw new Error(message)
	}

	if (showOnlyTexts) return 0
	if (showOnlyIcons) return -1
	if ([0, 600, 1200].includes(showIconsUntil)) return showIconsUntil
	throw new Error(`Illegal value for \`showIconsUntil\` ("${showIconsUntil}).`)
}

const showLink = ({ title, fontAwesome, url, className, rel }, showOnlyIcons) => (
	// it would be more common to apply `className` (e.g. "twitter") to <Link>
	// to get a matching hover color, but then the " // " ::after each link
	// also has that color
	// I circumvent that here without requiring an additional nesting <span>
	<Link key={url} to={url} rel={rel}>
		{fontAwesome && <FaIcon icon={fontAwesome} {...classNames(className, style.icon)} />}
		{!showOnlyIcons && <span {...classNames(className, style.text)}>{title}</span>}
	</Link>
)

export default LinkList

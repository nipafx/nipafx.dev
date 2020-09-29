import React from "react"

import FaIcon from "./faIcon"

import { classNames } from "../infra/functions"

import Link from "./link"

import style from "./linkList.module.css"

const LinkList = ({ showOnlyTexts, showOnlyIcons, showIconsUntil, links, className }) => {
	const textsFrom = showTextsFrom(showOnlyTexts, showOnlyIcons, showIconsUntil)

	const styles = [className, style.links]
	if (textsFrom === 0) styles.push(style.texts)
	if (textsFrom === 600) styles.push(style.textsFrom600)
	if (textsFrom === 1000) styles.push(style.textsFrom1000)

	return <div {...classNames(...styles)}>{links.map(showLink)}</div>
}

const showTextsFrom = (showOnlyTexts, showOnlyIcons, showIconsUntil) => {
	const xor =
		[showOnlyTexts, showOnlyIcons, showIconsUntil]
			.map(flag => (flag ? 1 : 0))
			.reduce((a, b) => a + b, 0) === 1
	if (!xor) {
		const message = `Specify either \`showOnlyTexts\` ("${showOnlyTexts}") or \`showOnlyIcons\` ("${showOnlyIcons}") or \`showIconsUntil\` ("${showIconsUntil}").`
		throw new Error(message)
	}

	if (showOnlyTexts) return 0
	if (showOnlyIcons) return -1
	if ([0, 600, 1000].includes(showIconsUntil)) return showIconsUntil
	throw new Error(`Illegal value for \`showIconsUntil\` ("${showIconsUntil}).`)
}

const showLink = ({ title, fontAwesome, url, className }) => (
	<span key={url}>
		<Link to={url} className={className}>
			{fontAwesome && (
				<span className={style.icon}>
					<FaIcon icon={fontAwesome} />
				</span>
			)}
			<span className={style.text}>{title}</span>
		</Link>
	</span>
)

export default LinkList

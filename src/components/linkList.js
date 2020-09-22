import React from "react"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { classNames } from "../infra/functions"

import Link from "./link"

import style from "./linkList.module.css"

const LinkList = ({ showIcons, links, className }) => {
	const styles = [className, style.links]
	const showOnlyTexts = !links[0].fontAwesome
	const showTexts = !showIcons
	if (showOnlyTexts) styles.push(style.onlyTexts)
	else if (showTexts) styles.push(style.texts)
	return <div {...classNames(...styles)}>{links.map(showLink)}</div>
}

const showLink = ({ title, fontAwesome, url, className }) => (
	<span key={url}>
		<Link to={url} className={className}>
			{fontAwesome && (
				<span className={style.icon}>
					<FontAwesomeIcon icon={fontAwesome} />
				</span>
			)}
			<span className={style.text}>{title}</span>
		</Link>
	</span>
)

export default LinkList

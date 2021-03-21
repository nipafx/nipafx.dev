import React, { useRef, useEffect } from "react"

import { classNames } from "../infra/functions"

import SiteLogo from "./siteLogo"
import LinkList from "./linkList"
import SiteMenu from "./siteMenu"
import ProgressBar, { PROGRESS_BAR_OFFSET_ID } from "./progressBar"

import channels from "../../content/meta/channel-links.json"

import * as layout from "../layout/container.module.css"
import * as style from "./siteHeader.module.css"

const SiteHeader = ({ onIndexPage }) => {
	const scrollPosition = useRef(0)
	const headerElement = useRef(null)
	useEffect(() => {
		initializeHeaderVisibility(scrollPosition, headerElement)
		const scrollListener = () => updateHeaderVisibility(scrollPosition, headerElement)
		window.addEventListener("scroll", scrollListener)
		return () => {
			window.removeEventListener("scroll", scrollListener)
		}
	})
	return (
		<header id={PROGRESS_BAR_OFFSET_ID} {...classNames(layout.container, style.header)}>
			<div {...classNames(layout.siteHeader, style.container)}>
				<SiteLogo className={style.logo} onIndexPage={onIndexPage} />
				<LinkList showIconsUntil={600} className={style.channels} links={channels.links} />
				<SiteMenu className={style.menu} onIndexPage={onIndexPage} />
			</div>
			<ProgressBar className={layout.fullWidth} />
		</header>
	)
}

const initializeHeaderVisibility = (scrollPosition, headerElement) => {
	scrollPosition.current = window.pageYOffset
	headerElement.current = document.getElementById(PROGRESS_BAR_OFFSET_ID)
}

const updateHeaderVisibility = (scrollPosition, headerElement) => {
	const position = window.pageYOffset
	if (position < scrollPosition.current) headerElement.current.classList.add(style.show)
	else headerElement.current.classList.remove(style.show)
	scrollPosition.current = position
}

export default SiteHeader

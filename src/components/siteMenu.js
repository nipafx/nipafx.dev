import React, { useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"

import { classNames } from "../infra/functions"

import Link from "./link"
import { ChannelTag } from "./taglet"

import style from "./siteMenu.module.css"

import json from "../../content/meta/site-menu.json"

const SITE_NAV = "site-nav"

const SiteMenu = ({ className, onIndexPage }) => {
	useEffect(() => {
		document.getElementById(SITE_NAV).classList.add(style.animated)
		window.addEventListener("click", closeOpenMenus)
		return () => window.removeEventListener("click", closeOpenMenus)
	})
	return (
		<nav id={SITE_NAV} {...classNames(className, style.menu, style.topLevelContainer)}>
			{json.entries.map(entry => topLevelEntry(entry, onIndexPage))}
		</nav>
	)
}

const topLevelEntry = ({ title, url, children, className }, onIndexPage) => {
	const id = ("site-nav-top-level-entry-" + Math.random()).replace("0.", "")
	const checkboxId = id + "-checkbox"
	const contentId = id + "-content"
	if (url)
		return (
			<div key={title} className={style.topLevelEntry}>
				<Link className={className} to={url}>
					{title}
				</Link>
			</div>
		)
	if (children) {
		if (!(children instanceof Array)) children = loadChildren(children)
		return (
			<div key={title} className={style.topLevelEntry}>
				<input
					id={checkboxId}
					className={style.topLevelCheckbox}
					type="checkbox"
					onChange={event => toggleSecondLevel(event.target.checked, contentId)}
				/>
				<label {...classNames(style.topLevelLabel, className)} htmlFor={checkboxId}>
					{title}
				</label>
				<div id={contentId} className={style.secondLevelOuterContainer}>
					<div className={style.secondLevelContainer}>
						{children.map(entry => secondLevelEntry(entry, onIndexPage))}
					</div>
				</div>
			</div>
		)
	}
	throw new Error(`Nav entry "${title}" with neither URL nor children.`)
}

const secondLevelEntry = ({ title, url, children, className }, onIndexPage) => {
	const id = ("site-nav-second-level-entry-" + Math.random()).replace("0.", "")
	const checkboxId = id + "-checkbox"
	const contentId = id + "-content"
	if (url)
		return (
			<div key={title} className={style.secondLevelEntry}>
				<Link to={url} onIndexPage={onIndexPage} className={className}>
					{title}
				</Link>
			</div>
		)
	if (children) {
		if (!(children instanceof Array)) children = loadChildren(children)
		return (
			<div key={title} className={style.secondLevelEntry}>
				<input
					id={checkboxId}
					className={style.secondLevelCheckbox}
					type="checkbox"
					onChange={event => toggleThirdLevel(event.target.checked, contentId)}
				/>
				<label {...classNames(style.secondLevelLabel, className)} htmlFor={checkboxId}>
					{title}
				</label>
				<div id={contentId} className={style.thirdLevelOuterContainer}>
					<div className={style.thirdLevelContainer}>
						{children.map(entry => thirdLevelEntry(entry, onIndexPage))}
					</div>
				</div>
			</div>
		)
	}
	throw new Error(`Nav entry "${title}" with neither URL nor children.`)
}

const thirdLevelEntry = ({ title, url, channel, tag, className }, onIndexPage) => {
	if (url)
		return (
			<span key={title} className={style.thirdLevelEntry}>
				<Link key={title} className={className} to={url}>
					{title}
					{/* the trailing space is important - without it, browsers won't line-break */}
				</Link>{" "}
			</span>
		)
	if (tag)
		return (
			<span key={tag} {...classNames(style.thirdLevelEntry, style.tag)}>
				{/* the trailing space is important - without it, browsers won't line-break */}
				<ChannelTag
					key={tag}
					channel={channel}
					tag={tag}
					mode={onIndexPage ? "overlink" : "forward"}
					className={className}
				/>{" "}
			</span>
		)
	throw new Error(`Nav entry "${title}" with neither URL nor tag.`)
}

const loadChildren = tag => {
	const { articleTags, videoTags } = useStaticQuery(
		graphql`
			query {
				videoTags: allVideo {
					group(field: tags) {
						tag: fieldValue
					}
				}
				articleTags: allArticle {
					group(field: tags) {
						tag: fieldValue
					}
				}
			}
		`
	)
	switch (tag) {
		case "$ARTICLE-TAGS":
			return articleTags.group.map(tag => {
				return { channel: "articles", tag: tag.tag }
			})
		case "$VIDEO-TAGS":
			return videoTags.group.map(tag => {
				return { channel: "videos", tag: tag.tag }
			})
	}
}

/*
 * JavaScript
 */

const toggleSecondLevel = (expand, containerId) => {
	const container = document.getElementById(containerId)
	if (expand) expandSecondLevel(container)
	else collapseSecondLevel(container)
}

const expandSecondLevel = container => {
	container.style.overflow = "hidden"
	container.style.transition = "max-height var(--menu-transition)"
	requestAnimationFrame(() => (container.style.maxHeight = container.scrollHeight + "px"))

	const resetStyle = () => {
		container.removeEventListener("transitionend", resetStyle)
		container.style.overflow = null
		container.style.transition = null
		container.style.maxHeight = null
	}
	container.addEventListener("transitionend", resetStyle)
}

const collapseSecondLevel = container => {
	container.style.maxHeight = container.scrollHeight + "px"
	requestAnimationFrame(() => {
		container.style.transition = "max-height var(--menu-transition)"
		container.style.maxHeight = 0
	})

	const resetStyle = () => {
		container.removeEventListener("transitionend", resetStyle)
		container.style.transition = null
		container.style.maxHeight = null
		container.style.overflow = null
	}
	container.addEventListener("transitionend", resetStyle)
}

const toggleThirdLevel = (expand, containerId) => {
	const container = document.getElementById(containerId)
	if (expand) expandThirdLevel(container)
	else collapseThirdLevel(container)
}

const expandThirdLevel = container => {
	const secondLevelContainer = container.closest(`.${style.secondLevelContainer}`)
	const secondLevelRectangle = secondLevelContainer.getBoundingClientRect()
	const thirdLevelInner = container.querySelector(`.${style.thirdLevelContainer}`)

	const menuEnd = container.closest(`#${SITE_NAV}`).getBoundingClientRect().right
	const secondLevelEnd = secondLevelRectangle.right
	const thirdLevelWidth = menuEnd - secondLevelEnd

	// set the inner container's width, so we can compute its height
	thirdLevelInner.style.width = `calc(${thirdLevelWidth}px - 4em)`
	container.style.maxWidth = 0
	requestAnimationFrame(() => {
		container.style.maxHeight = secondLevelRectangle.height + "px"
		secondLevelContainer.style.minHeight = `calc(${secondLevelRectangle.height}px - 2em)`
		requestAnimationFrame(() => {
			container.style.transition =
				"max-height var(--menu-transition), max-width var(--menu-transition)"
			const thirdLevelHeight = Math.max(
				thirdLevelInner.scrollHeight,
				secondLevelRectangle.height
			)
			container.style.maxWidth = thirdLevelWidth + "px"
			container.style.height = thirdLevelHeight + "px"
			container.style.maxHeight = thirdLevelHeight + "px"

			secondLevelContainer.style.transition = "min-height var(--menu-transition)"
			secondLevelContainer.style.minHeight = `calc(${thirdLevelHeight}px - 2em)`
		})
	})

	const resetStyle = () => {
		container.removeEventListener("transitionend", resetStyle)

		// no reason to reset `thirdLevelInner.style.width`

		container.style.transition = null
		container.style.maxWidth = null
		container.style.maxHeight = null

		// don't reset secondLevelContainer.style.minHeight
		// or it will collapse again (nothing to prop it up)
		secondLevelContainer.style.transition = null
	}
	container.addEventListener("transitionend", resetStyle)
}

const collapseThirdLevel = container => {
	const secondLevelContainer = container.closest(`.${style.secondLevelContainer}`)
	const currentHeight = secondLevelContainer.style.minHeight
	secondLevelContainer.style.minHeight = 0
	const targetHeight = secondLevelContainer.scrollHeight
	secondLevelContainer.style.minHeight = currentHeight

	container.style.maxHeight = container.scrollHeight + "px"
	container.style.maxWidth = container.scrollWidth + "px"
	requestAnimationFrame(() => {
		container.style.transition =
			"max-height var(--menu-transition), max-width var(--menu-transition)"
		container.style.maxHeight = targetHeight + "px"
		container.style.maxWidth = 0

		secondLevelContainer.style.transition = "min-height var(--menu-transition)"
		secondLevelContainer.style.minHeight = `calc(${targetHeight}px - 2em)`
	})

	const resetStyle = () => {
		container.removeEventListener("transitionend", resetStyle)
		container.style.transition = null
		container.style.maxHeight = null
		container.style.maxWidth = null

		secondLevelContainer.style.transition = null
		secondLevelContainer.style.minHeight = null
	}
	container.addEventListener("transitionend", resetStyle)
}

const closeOpenMenus = event => {
	document
		.querySelectorAll(`.${style.topLevelCheckbox}:checked`)
		.forEach(checkbox => closeOpenMenu(event, checkbox))
	document
		.querySelectorAll(`.${style.secondLevelCheckbox}:checked`)
		.forEach(checkbox => closeOpenMenu(event, checkbox))
}

const closeOpenMenu = (event, checkbox) => {
	const target = event.target
	const clickedLabel = target.nodeName.toLowerCase() === "label" && target.htmlFor === checkbox.id
	// if the label was clicked, ignore the event;
	// another one will be coming that otherwise toggles back to true
	if (clickedLabel) return

	// if either the checkbox or the div was clicked, we do nothing
	const clickedMenuEntry = checkbox.parentNode.contains(event.target)
	if (clickedMenuEntry) return

	// something unrelated to the currently open menu was clicked ~> close it
	// (by simulating a click, so the animations are triggered)
	checkbox.click()
}

export default SiteMenu

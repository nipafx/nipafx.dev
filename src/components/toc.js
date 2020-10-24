import React, { useEffect } from "react"

import style from "./toc.module.css"

// DEPENDS ON header height
const HEADER_HEIGHT = 85
const EXTRA_MARGIN = 50
const INTERSECTION_THRESHOLD = 1
const OBSERVATION_POINTS = "article h2, article h3, article h4, article h5, article h6"

const Toc = ({ toc }) => {
	useEffect(() => {
		const observer = createIntersectionObserver()
		document
			.querySelectorAll(OBSERVATION_POINTS)
			.forEach(heading => observer.observe(heading))
		return () => {
			document
				.querySelectorAll(OBSERVATION_POINTS)
				.forEach(heading => observer.unobserve(heading))
		}
	})

	return <nav className={style.toc} dangerouslySetInnerHTML={{ __html: toc }} />
}

const createIntersectionObserver = () => {
	// gripes with intersection observer: https://twitter.com/nipafx/status/1217590444772810753

	// to make sure only events after the initial observation are acted on,
	// store the ids of visited headers
	const visited = {}

	const updateHighlights = entry => {
		const focusedTitleId = entry.target.querySelector(`span`).id
		const isTitleVisible = entry.intersectionRatio < INTERSECTION_THRESHOLD
		if (visited[focusedTitleId] && isTitleVisible) {
			const titlePosition = entry.boundingClientRect.top
			lowlightItems()
			highlightItems(focusedTitleId, titlePosition)
			return
		}
		visited[focusedTitleId] = true
	}

	const onObserve = entries => entries.forEach(updateHighlights)
		
	return new IntersectionObserver(onObserve, {
		// when scrolling to a header in the toc, no event is thrown if the margin
		// is exactly the same as the header height
		rootMargin: `-${HEADER_HEIGHT + EXTRA_MARGIN}px 0px -50%`,
		threshold: INTERSECTION_THRESHOLD,
	})
}

const lowlightItems = () => {
	document
		.querySelectorAll(`.${style.toc} a.${style.highlighted}`)
		.forEach(highlightedItem => highlightedItem.classList.remove(style.highlighted))
}

const highlightItems = (id, position) => {
	const aboveViewport = position <= HEADER_HEIGHT + EXTRA_MARGIN
	// prettier-ignore
	document
		.querySelectorAll(`.${style.toc} a[href="#${id}"]`)
		.forEach(anchor => {
			const item = anchor.closest(`li`)
			if (aboveViewport) highlightItem(item)
			else highlightItem(itemAbove(item))
		})
}

const highlightItem = item => {
	item?.querySelector(`a`).classList.add(style.highlighted)
}

const itemAbove = item => {
	const siblingItem = item.previousElementSibling
	if (siblingItem) {
		const above = lastTransitiveItem(siblingItem)
		return above
	}
	// if this gets called on the first toc entry, the expectation is
	// that `parent` is null, but if the toc gets nested into a <ul>,
	// this wouldn't be the case; so... if you're reading this...
	const parent = item.closest(`ul`).closest(`li`)
	return parent
}

const lastTransitiveItem = item => {
	const list = item.querySelector(`ul`)
	if (!list?.children.length) return item
	return  lastTransitiveItem(list.children[list.children.length - 1])
}

export default Toc

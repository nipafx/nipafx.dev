import React, { useEffect } from "react"

import style from "./toc.module.css"

// DEPENDS ON header height
const HEADER_HEIGHT = 85
const EXTRA_MARGIN = 50
const INTERSECTION_THRESHOLD = 1
const HEADERS = "article h2, article h3, article h4, article h5, article h6"

const Toc = ({ toc }) => {
	useEffect(() => {
		const observer = createIntersectionObserver()
		document.querySelectorAll(HEADERS).forEach(heading => observer.observe(heading))
		return () => {
			document.querySelectorAll(HEADERS).forEach(heading => observer.unobserve(heading))
		}
	})

	return <nav className={style.toc} dangerouslySetInnerHTML={{ __html: toc }} />
}

const createIntersectionObserver = () => {
	// gripes with intersection observer: https://twitter.com/nipafx/status/1217590444772810753

	// registering the intersection observer triggers an event for each
	// observed header, but none of them should be highlighted at this point;
	// instead store the initial events' targets and only act on an event
	// if its target was stored earlier.
	const visited = {}

	const updateHighlights = event => {
		const focusedHeaderId = event.target.querySelector(`span`).id
		if (!visited[focusedHeaderId]) {
			visited[focusedHeaderId] = true
			return
		}

		const isHeaderVisible = event.intersectionRatio < INTERSECTION_THRESHOLD
		if (isHeaderVisible) {
			// `event.isIntersecting` should indicate whether the element
			// transitioned into or out of intersection, but Firefox instead
			// returns true if intersection ratio is > 0;
			// instead fall back to comparing intersection ratio with threshold
			const headerPosition = event.boundingClientRect.top
			// remember that the ToC is duplicated (accordion and pop-out-accordion),
			// so each ToC entry exists twice on the page; hence "itemS" (plural)
			lowlightItems()
			highlightItems(focusedHeaderId, headerPosition)
		}
	}

	const onObserve = events => events.forEach(updateHighlights)

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
	if (item) item.querySelector(`a`).classList.add(style.highlighted)
}

const itemAbove = item => {
	const siblingItem = item.previousElementSibling
	if (siblingItem) {
		const above = lastTransitiveItem(siblingItem)
		return above
	} else {
		// if this gets called on the first toc entry, the expectation is
		// that `parent` is null, but if the toc gets nested into a <ul>,
		// this wouldn't be the case; so... if you're reading this...
		const parent = item.closest(`ul`).closest(`li`)
		return parent
	}
}

const lastTransitiveItem = item => {
	const list = item.querySelector(`ul`)
	if (!list || list.children.length === 0) return item

	const lastChild = list.children[list.children.length - 1]
	return lastTransitiveItem(lastChild)
}

export default Toc

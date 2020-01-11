import React, { useEffect } from "react"

import style from "./toc.module.css"

// DEPENDS ON header height
const HEADER_HEIGHT = 85
const EXTRA_MARGIN = 50
const INTERSECTION_THRESHOLD = 1

const Toc = ({ toc }) => {
	useEffect(() => {
		const observer = createIntersectionObserver()
		document
			.querySelectorAll(`article h2, article h3, article h4, article h5, article h6`)
			.forEach(heading => observer.observe(heading))
		return () => {
			document
				.querySelectorAll(`article h2, article h3, article h4, article h5, article h6`)
				.forEach(heading => observer.unobserve(heading))
		}
	})
	return <nav id={style.toc} dangerouslySetInnerHTML={{ __html: toc }} />
}

const createIntersectionObserver = () => {
	// gripes with intersection observer: https://twitter.com/nipafx/status/1217590444772810753

	// to make sure only events after the initial observation are acted on,
	// store the ids of visited headers
	const visited = []
	const update = events =>
		events.forEach(event => {
			const id = event.target.querySelector(`span`).id
			if (visited.includes(id)) {
				// `event.isIntersecting` should indicate whether the element
				// transitioned into or out of intersection, but Firefox instead
				// returns true if intersection ratio is > 0;
				// instead fall back to comparing intersection ratio with threshould
				const visible = event.intersectionRatio < INTERSECTION_THRESHOLD
				if (visible) {
					const position = event.boundingClientRect.top
					updateHighlight(id, position)
				}
			} else visited.push(id)
		})
	return new IntersectionObserver(update, {
		// when scrolling to a header in the toc, no event is thrown if the margin
		// is exactly the same as the header height
		rootMargin: `-${HEADER_HEIGHT+EXTRA_MARGIN}px 0px -50%`,
		threshold: INTERSECTION_THRESHOLD,
	})
}

const updateHighlight = (id, position) => {
	const aboveViewport = position <= HEADER_HEIGHT+EXTRA_MARGIN
	const item = document.querySelector(`#${style.toc} a[href="#${id}"]`).closest(`li`)
	if (aboveViewport) highlightItem(item)
	else highlightItem(itemAbove(item))
}

const highlightItem = item => {
	const highlightedItem = document.querySelector(`#${style.toc} a.${style.highlighted}`)
	if (highlightedItem) highlightedItem.classList.remove(style.highlighted)
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
	if (!list) return item

	const descendant = list.children.length === 0 ? null : list.children[list.children.length - 1]
	return descendant ? lastTransitiveItem(descendant) : item
}

export default Toc

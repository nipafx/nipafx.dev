import React, { useEffect } from "react"

import { classNames } from "../infra/functions"

import * as style from "./accordion.module.css"

const Accordion = ({ className, headerClassName, headers, open, children }) => {
	const id = "accordion-45f3n6"
	useEffect(() => {
		document.getElementById(id).classList.add(style.animated)
	})

	children = Array.isArray(children) ? children : [children]
	return (
		<div id={id} {...classNames(style.container, className)}>
			{children.map((child, index) =>
				child ? item(headers[index], headerClassName, index, open, child) : null
			)}
		</div>
	)
}

const item = (title, titleClassName, index, open, item) => {
	const id = "accordion-item-" + index
	const checkboxId = id + "-checkbox"
	const contentId = id + "-content"
	return (
		<div key={title} className={style.item}>
			<input
				id={checkboxId}
				className={style.itemCheckbox}
				type="checkbox"
				defaultChecked={open}
				onChange={event => toggleContent(event.target.checked, contentId)}
			/>
			<label {...classNames(style.itemLabel, titleClassName)} htmlFor={checkboxId}>
				{title}
			</label>
			<div id={contentId} className={style.itemContent}>
				{item}
			</div>
		</div>
	)
}

const toggleContent = (expand, itemId) => {
	const item = document.querySelector("#" + itemId)
	if (expand) expandContent(item)
	else collapseContent(item)
}

const expandContent = item => {
	// set `max-height` to expected height,
	// so transition has the correct end point
	item.style.maxHeight = item.scrollHeight + "px"

	// unset `max-height` when the next transition (hopefully this one) finishes
	const unsetHeight = () => {
		item.removeEventListener("transitionend", unsetHeight)
		item.style.maxHeight = null
	}
	item.addEventListener("transitionend", unsetHeight)
}

const collapseContent = item => {
	// disable transition while setting `max-height` to actual height,
	// so transition has the correct starting point
	item.style.transition = "none"
	requestAnimationFrame(() => {
		item.style.maxHeight = item.scrollHeight + "px"
		// enable transition and unset `max-height`, so it transitions to zero
		requestAnimationFrame(() => {
			item.style.transition = null
			requestAnimationFrame(() => (item.style.maxHeight = null))
		})
	})
}

export default Accordion

import React from "react"

import { classNames } from "../infra/functions"

import style from "./accordion.module.css"

const Accordion = ({ headerClassName, headers, children }) => {
	children = Array.isArray(children) ? children : [children]
	return (
		<div className={style.container}>
			{children.map((child, index) =>
				child ? item(headerClassName, headers[index], child) : null
			)}
		</div>
	)
}

const item = (titleClassName, title, item) => {
	const id = ("accordion-item-" + Math.random()).replace("0.", "")
	const checkboxId = id + "-checkbox"
	const contentId = id + "-content"
	return (
		<div key={title} className={style.item}>
			<input
				id={checkboxId}
				className={style.itemCheckbox}
				type="checkbox"
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

const collapseContent = item => {
	// disable transition while setting `max-height` to actual height,
	// so transition has the correct starting point
	item.style.transition = "unset"
	item.style.maxHeight = item.scrollHeight + "px"
	// enable transition and unset `max-height`, so it transitions to zero
	requestAnimationFrame(() => {
		item.style.transition = null
		item.style.maxHeight = null
	})
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

export default Accordion

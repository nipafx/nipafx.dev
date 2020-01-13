import React, { useRef, useEffect } from "react"

import { classNames } from "../infra/functions"

import style from "./progressBar.module.css"

export const PROGRESS_BAR_OFFSET = "progress-bar-offset"
export const PROGRESS_BAR_REFERENCE = "progress-bar-reference"
const CONTAINER = "progress-bar-container"
const DISPLAY = "progress-bar-display"

const ProgressBar = ({ className }) => {
	const active = useRef(false)
	const offset = useRef(0)
	const referenceElement = useRef(null)
	const containerElement = useRef(null)
	const displayElement = useRef(null)

	useEffect(() => {
		initializeProgress(active, offset, referenceElement, containerElement, displayElement)
		const scrollListener = () => updateProgress(offset, referenceElement, displayElement)
		if (active.current) window.addEventListener("scroll", scrollListener)
		return () => {
			if (active.current) window.removeEventListener("scroll", scrollListener)
			containerElement.current.classList.remove(style.active)
		}
	})
	return (
		<div
			id={CONTAINER}
			{...classNames(className, style.container)}
			onClick={event =>
				jumpToPosition(active, offset, referenceElement, containerElement, event)
			}
		>
			<div id={DISPLAY} className={style.bar}></div>
		</div>
	)
}

const initializeProgress = (active, offset, referenceElement, containerElement, displayElement) => {
	containerElement.current = document.querySelector("#" + CONTAINER)
	displayElement.current = document.querySelector("#" + DISPLAY)
	if (!displayElement.current) return

	referenceElement.current = document.querySelector("#" + PROGRESS_BAR_REFERENCE)
	if (!referenceElement.current) return
	const offsetElement = document.querySelector("#" + PROGRESS_BAR_OFFSET)
	if (offsetElement) {
		const { height } = offsetElement.getBoundingClientRect()
		offset.current = height
	}

	active.current = true
	containerElement.current.classList.add(style.active)
	updateProgress(offset, referenceElement, displayElement)
}

const updateProgress = (offset, referenceElement, displayElement) => {
	const { height, top } = referenceElement.current.getBoundingClientRect()
	const viewportHeight = document.documentElement.clientHeight
	if (height <= viewportHeight - offset.current) displayProgress(displayElement, 1)
	else {
		const scrolled = offset.current - top
		const total = height + offset.current - viewportHeight
		displayProgress(displayElement, scrolled / total)
	}
}

const displayProgress = (displayElement, progress) => {
	const width = Math.max(0, Math.min(progress * 100, 100))
	displayElement.current.style.width = width + "%"
}

const jumpToPosition = (active, offset, referenceElement, containerElement, event) => {
	if (!active.current || !containerElement.current) return

	const { left } = containerElement.current.getBoundingClientRect()
	const clicked = event.clientX - left
	const total = containerElement.current.clientWidth
	const relativeTarget = clicked / total

	const height = referenceElement.current.clientHeight
	const viewportHeight = document.documentElement.clientHeight

	const absoluteTarget = (height + offset.current - viewportHeight) * relativeTarget
	window.scrollTo({
		top: absoluteTarget,
		behavior: "smooth",
	})
}

export default ProgressBar

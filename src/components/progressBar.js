import React, { Component } from "react"

import { className } from "../infra/functions"

import style from "./progressBar.module.css"

class ProgressBar extends Component {
	static REFERENCE = "progress-bar-reference"
	static CONTAINER = "progress-bar-container"
	static DISPLAY = "progress-bar-display"

	referenceElement
	containerElement
	displayElement
	active
	// the offset is needed so that progress is positive on first scroll
	offset

	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div
				id={ProgressBar.CONTAINER}
				{...className(this.props.className, style.container)}
				onClick={event => this.jumpToPosition(event)}
			>
				<div id={ProgressBar.DISPLAY} className={style.bar}></div>
			</div>
		)
	}

	componentDidMount() {
		this.initializeProgress()
		if (this.active) window.onscroll = () => this.updateProgress()
		else window.onscroll = null
	}

	initializeProgress() {
		this.active = false
		this.containerElement = document.querySelector("#" + ProgressBar.CONTAINER)

		this.displayElement = document.querySelector("#" + ProgressBar.DISPLAY)
		if (!this.displayElement) return
		this.displayProgress(0)

		this.referenceElement = document.querySelector("#" + ProgressBar.REFERENCE)
		if (!this.referenceElement) return
		const { top } = this.referenceElement.getBoundingClientRect()
		this.offset = top

		this.active = true
		this.containerElement.className += " " + style.active
		this.updateProgress()
	}

	updateProgress() {
		if (!this.active) return

		const { height, top } = this.referenceElement.getBoundingClientRect()
		const viewportHeight = document.documentElement.clientHeight
		if (height <= viewportHeight - this.offset) this.displayProgress(1)
		else {
			const scrolled = this.offset - top
			const total = height + this.offset - viewportHeight
			this.displayProgress(scrolled / total)
		}
	}

	displayProgress(progress) {
		const width = Math.max(0, Math.min(progress * 100, 100))
		this.displayElement.style.width = width + "%"
	}

	jumpToPosition(event) {
		if (!this.active) return

		if (!this.containerElement) return

		const clicked = event.clientX
		const total = this.containerElement.clientWidth
		const relativeTarget = clicked / total

		const height = this.referenceElement.clientHeight
		const viewportHeight = document.documentElement.clientHeight

		const absoluteTarget = (height + this.offset - viewportHeight) * relativeTarget
		window.scrollTo({
			top: absoluteTarget,
			behavior: "smooth",
		})
	}
}

export default ProgressBar

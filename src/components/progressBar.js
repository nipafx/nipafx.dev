import React, { Component } from "react"

import { className } from "../infra/functions"

import style from "./progressBar.module.css"

class ProgressBar extends Component {
	static REFERENCE = "progress-bar-reference"
	static DISPLAY = "progress-bar-display"

	referenceElement
	displayElement
	// the offset is needed so that progress is positive on first scroll
	offset

	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div {...className(this.props.className, style.container)}>
				<div id={ProgressBar.DISPLAY} className={style.bar}></div>
			</div>
		)
	}

	componentDidMount() {
		this.initializeProgress()
		if (this.referenceElement) window.onscroll = () => this.updateProgress()
		else window.onscroll = null
	}

	initializeProgress() {
		this.displayElement = document.querySelector("#" + ProgressBar.DISPLAY)
		if (!this.displayElement) return
		this.displayProgress(0)

		this.referenceElement = document.querySelector("#" + ProgressBar.REFERENCE)
		if (!this.referenceElement) return
		const { top } = this.referenceElement.getBoundingClientRect()
		this.offset = top

		this.updateProgress()
	}

	updateProgress() {
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
}

export default ProgressBar

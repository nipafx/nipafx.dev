import React from "react"

import ProgressBar, { PROGRESS_BAR_OFFSET } from "./progressBar"
import Link from "./link"

import layout from "../layout/container.module.css"

const SiteHeader = () => (
	<header id={PROGRESS_BAR_OFFSET} className={layout.container}>
		<div>Logo</div>
		<Link to="https://codefx.org">Links</Link>
		<nav>Nav</nav>
		<ProgressBar className={layout.fullWidth} />
	</header>
)

export default SiteHeader

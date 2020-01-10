import React from "react"

import ProgressBar from "../components/progressBar"
import Link from "./link"

import layout from "../layout/container.module.css"

const SiteHeader = () => (
	<header className={layout.container}>
		<div>Logo</div>
		<Link to="https://codefx.org">Links</Link>
		<nav>Nav</nav>
		<ProgressBar className={layout.fullWidth} />
	</header>
)

export default SiteHeader

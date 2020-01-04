import React from "react"

import Link from "./link"

import layout from "../layout/container.module.css"

const SiteFooter = () => (
	<header className={layout.container}>
		<nav>Posts</nav>
		<div>Logo</div>
		<Link to="https://codefx.org">Links</Link>
		<nav>Nav</nav>
	</header>
)

export default SiteFooter

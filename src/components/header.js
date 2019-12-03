import React from "react"

import layout from "../layout/container.module.css"

const Header = () => (
	<header className={layout.container}>
		<div>Logo</div>
		<a href="https://codefx.org">Links</a>
		<nav>Nav</nav>
	</header>
)

export default Header

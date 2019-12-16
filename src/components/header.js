import React from "react"

import Link from "./link"

import layout from "../layout/container.module.css"

const Header = () => (
	<header className={layout.container}>
		<div>Logo</div>
		<Link to="https://codefx.org">Links</Link>
		<nav>Nav</nav>
	</header>
)

export default Header

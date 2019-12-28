import React from "react"

import Link from "./link"

export default ({ tag, link }) => (
	<span>{link ? <Link to={tag}>#{tag}</Link> : `#${tag}`}</span>
)

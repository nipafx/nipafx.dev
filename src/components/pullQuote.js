import React from "react"

import { className } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./pullQuote.module.css"

const PullQuote = ({ children }) => (
	<div {...className(layout.sidebar)}>
		<blockquote {...className(style.pull)}>{children}</blockquote>
	</div>
)

export default PullQuote

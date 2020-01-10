import React from "react"

import { classNames } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./pullQuote.module.css"

const PullQuote = ({ children }) => (
	<div {...classNames(layout.sidebar)}>
		<blockquote {...classNames(style.pull)}>{children}</blockquote>
	</div>
)

export default PullQuote

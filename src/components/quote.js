import React from "react"

import layout from "../layout/container.module.css"
import style from "./quote.module.css"

export const PullQuote = ({ children }) => (
	<div className={layout.sidebar}>
		<blockquote className={style.pull}>{children}</blockquote>
	</div>
)

export const BlockQuote = ({ children }) => (
	<blockquote className={style.block}>{children}</blockquote>
)

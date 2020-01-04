import React from "react"

import { className } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./pullQuote.module.css"

const PullQuote = ({ children }) => (
	<blockquote {...className(layout.sidebar, style.pull)}>{children}</blockquote>
)

export default PullQuote

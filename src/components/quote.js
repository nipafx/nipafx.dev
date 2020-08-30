import React from "react"

import { classNames } from "../infra/functions"

import layout from "../layout/container.module.css"
import style from "./quote.module.css"

export const PullQuote = ({ children }) => (
	<blockquote {...classNames(layout.sidebar, style.pull)}>{children}</blockquote>
)

export const BlockQuote = ({ children }) => (
	<blockquote {...classNames(layout.offCenter, style.block)}>{children}</blockquote>
)

import React from "react"

import { classNames } from "../infra/functions"

import Link from "./link"

import style from "./tag.module.css"

export default ({ tag, link, className }) => {
	className = className || ""
	return (
		<span {...classNames(className, style.tag)}>
			{link ? <Link to={tag}>#{tag}</Link> : `#${tag}`}
		</span>
	)
}

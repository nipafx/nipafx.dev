import React from "react"

import { classNames } from "../infra/functions"

import Link from "./link"

import style from "./linkList.module.css"

const LinkList = ({ className, links }) => (
	<div {...classNames(className, style.container)}>{links.map(link)}</div>
)

const link = ({ title, url, className }) => (
	<span key={url}>
		<Link to={url} className={className}>
			{title}
		</Link>
	</span>
)

export default LinkList

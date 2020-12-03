import React from "react"

import { classNames } from "../infra/functions"

import Fonts from "./fonts"
import Meta from "../components/meta"
import SiteHeader from "../components/siteHeader"
import SiteFooter from "../components/siteFooter"

import style from "./site.module.css"

const SiteLayout = ({ className, meta, onIndexPage, children }) => {
	className = className || ""
	return (
		<div {...classNames(style.site, className)}>
			<Fonts />
			<Meta {...meta} />
			<SiteHeader onIndexPage={onIndexPage} />
			<main className={style.content}>{children}</main>
			<SiteFooter />
		</div>
	)
}

export default SiteLayout

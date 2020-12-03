import React from "react"

import { flatten, classNames } from "../infra/functions"

import Fonts from "./fonts"
import Meta from "../components/meta"
import SiteHeader from "../components/siteHeader"
import SiteFooter from "../components/siteFooter"

import style from "./site.module.css"

const SiteLayout = ({ className, meta, onIndexPage, children }) => {
	className = className || ""
	return flatten(
		<div {...classNames(style.site, className)}>
			<Fonts />
			{meta && <Meta {...meta} />}
			<SiteHeader onIndexPage={onIndexPage} />
			<div className={style.content}>{children}</div>
			<SiteFooter />
		</div>
	)
}

export default SiteLayout

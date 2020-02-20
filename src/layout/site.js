import React from "react"

import { flatten, classNames } from "../infra/functions"

import CodeFXForward from "../components/codefxForward"
import Meta from "../components/meta"
import SiteHeader from "../components/siteHeader"
import SiteFooter from "../components/siteFooter"

import style from "./site.module.css"

const SiteLayout = ({ className, children, meta }) => {
	className = className || ""
	return flatten(
		<div {...classNames(style.site, className)}>
			<CodeFXForward />
			{meta && <Meta {...meta} />}
			<SiteHeader />
			<div className={style.content}>{children}</div>
			<SiteFooter />
		</div>
	)
}

export default SiteLayout

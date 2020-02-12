import React from "react"

import { flatten } from "../infra/functions"

import CodeFXForward from "../components/codefxForward"
import Meta from "../components/meta"
import SiteHeader from "../components/siteHeader"
import SiteFooter from "../components/siteFooter"

const SiteLayout = ({ className, children, meta }) => {
	className = className || ""
	return flatten(
		<div className={className}>
			<CodeFXForward />
			{meta && <Meta {...meta} />}
			<SiteHeader />
			{children}
			<SiteFooter />
		</div>
	)
}

export default SiteLayout

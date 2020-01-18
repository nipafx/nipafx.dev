import React from "react"

import { flatten } from "../infra/functions"

import SiteHeader from "../components/siteHeader"
import SiteFooter from "../components/siteFooter"
import CodeFXForward from "../components/codefxForward"

const Site = ({ className, children }) => {
	className = className || ""
	return flatten(
		<div className={className}>
			<CodeFXForward />
			<SiteHeader />
			{children}
			<SiteFooter />
		</div>
	)
}

export default Site

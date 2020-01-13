import React from "react"

import { flatten } from "../infra/functions"

import SiteHeader from "../components/siteHeader"
import SiteFooter from "../components/siteFooter"

const Site = ({ className, children }) => {
	className = className || ""
	return flatten(
		<div className={className}>
			<SiteHeader />
			{children}
			<SiteFooter />
		</div>
	)
}

export default Site

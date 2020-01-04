import React from "react"

import { flatten, setAltColorVar } from "../infra/functions"

import SiteHeader from "../components/siteHeader"
import SiteFooter from "../components/siteFooter"

const Site = ({ altColor, children }) =>
	flatten(
		<div style={setAltColorVar(altColor)}>
			<SiteHeader />
			{children}
			<SiteFooter />
		</div>
	)

export default Site

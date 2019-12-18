import React from "react"

import { flatten, setAltColorVar } from "../infra/functions"

import Header from "../components/header"
import Footer from "../components/footer"

const Site = ({ altColor, children }) =>
	flatten(
		<div style={setAltColorVar(altColor)}>
			<Header />
			{children}
			<Footer />
		</div>
	)

export default Site

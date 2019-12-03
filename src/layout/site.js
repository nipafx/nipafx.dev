import React from "react"

import { flatten, setAltColorVar } from "../infra/functions"

import Header from "../components/header"
import Footer from "../components/footer"

import "./colors.css"
import "./global.css"
import layout from "./container.module.css"

const Site = ({ altColor, children }) =>
	flatten(
		<div style={setAltColorVar(altColor)}>
			<Header />
			<main className={layout.container}>{children}</main>
			<Footer />
		</div>
	)

export default Site

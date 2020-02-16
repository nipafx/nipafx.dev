import React from "react"

import { classNames } from "../infra/functions"

import Accordion from "./accordion"

import MdAsHtml from "../infra/mdAsHtml"

import layout from "../layout/container.module.css"
import style from "./nav.module.css"

const Nav = ({ title, headers, children }) => {
	return (
		<div {...classNames(layout.navbar, style.container)}>
			<section {...classNames(style.nav)}>
				<p className={style.title}>
					<MdAsHtml>{title}</MdAsHtml>
				</p>
				<Accordion
					headerClassName={style.header}
					headers={headers}
				>
					{children}
				</Accordion>
			</section>
		</div>
	)
}

export default Nav

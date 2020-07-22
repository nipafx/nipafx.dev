import React from "react"

import { classNames } from "../infra/functions"

import Accordion from "./accordion"

import MarkdownAsHtml from "../infra/markdownAsHtml"

import layout from "../layout/container.module.css"
import style from "./nav.module.css"

const Nav = ({ title, headers, open, children }) => {
	return (
		<div {...classNames(layout.navbar, style.container)}>
			<section {...classNames(style.nav)}>
				<p className={style.title}>
					<MarkdownAsHtml>{title}</MarkdownAsHtml>
				</p>
				<Accordion
					headerClassName={style.header}
					headers={headers}
					open={open}
				>
					{children}
				</Accordion>
			</section>
		</div>
	)
}

export default Nav

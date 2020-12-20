import React from "react"

import { classNames } from "../infra/functions"

import Accordion from "./accordion"
import PopOutAccordion from "./accordion-pop-out"

import layout from "../layout/container.module.css"
import style from "./nav.module.css"

const Nav = ({ title, longHeaders, shortHeaders, open, backToTop, children }) => {
	return (
		<div {...classNames(layout.navbar, style.container)}>
			<section {...classNames(style.nav)}>
				<p className={style.title} dangerouslySetInnerHTML={{ __html: title }} />
				<Accordion
					className={style.largeNav}
					headerClassName={style.largeHeader}
					headers={longHeaders}
					open={open}
				>
					{children}
				</Accordion>
				<PopOutAccordion
					className={style.sideNav}
					headerClassName={style.sideHeader}
					headers={shortHeaders ?? longHeaders}
					backToTop={backToTop}
				>
					{children}
				</PopOutAccordion>
			</section>
		</div>
	)
}

export default Nav

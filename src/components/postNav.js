import React from "react"

import { className } from "../infra/functions"

import Accordion from "./accordion"

import layout from "../layout/container.module.css"
import style from "./postNav.module.css"

const PostNav = ({ title, toc }) => {
	if (!toc) return null

	return (
		<div {...className(layout.navbar, style.container)}>
			<section {...className(style.nav)}>
				<p className={style.title}>{title}</p>
				<Accordion
					titleClassName={style.entryTitle}
					titles={["table of content", "table of contents"]}
				>
					{toc && showToc(toc)}
				</Accordion>
			</section>
		</div>
	)
}

const showToc = toc => <nav className={style.toc} dangerouslySetInnerHTML={{ __html: toc }} />

export default PostNav

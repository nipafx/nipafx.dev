import React from "react"

import style from "./headings.module.css"

export const H1 = ({ id, hasAnchor, children }) => <h1>{inner(id, hasAnchor, children)}</h1>
export const H2 = ({ id, hasAnchor, children }) => <h2>{inner(id, hasAnchor, children)}</h2>
export const H3 = ({ id, hasAnchor, children }) => <h3>{inner(id, hasAnchor, children)}</h3>
export const H4 = ({ id, hasAnchor, children }) => <h4>{inner(id, hasAnchor, children)}</h4>
export const H5 = ({ id, hasAnchor, children }) => <h5>{inner(id, hasAnchor, children)}</h5>
export const H6 = ({ id, hasAnchor, children }) => <h6>{inner(id, hasAnchor, children)}</h6>

const inner = (id, hasAnchor, children) => {
	children = Array.isArray(children) ? children : [children]
	return (
		<React.Fragment>
			{/* add an invisible span for the anchor, so they're not scrolled under the site header */}
			<span id={id} className={style.bumper}></span>
			{!hasAnchor && <a href={`#${id}`}>▚</a>}
			{children}
		</React.Fragment>
	)
}

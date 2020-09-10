import React from "react"

import style from "./headings.module.css"

export const H1 = ({ id, children }) => <h1>{inner(id, children)}</h1>
export const H2 = ({ id, children }) => <h2>{inner(id, children)}</h2>
export const H3 = ({ id, children }) => <h3>{inner(id, children)}</h3>
export const H4 = ({ id, children }) => <h4>{inner(id, children)}</h4>
export const H5 = ({ id, children }) => <h5>{inner(id, children)}</h5>
export const H6 = ({ id, children }) => <h6>{inner(id, children)}</h6>

const inner = (id, children) => {
	children = Array.isArray(children) ? children : [children]
	// if the heading comes from Markdown, remark already added an anchor, so I don't want to add another one;
	// if it comes from remark, the first child is a React component (which has `$$typeof` declared)
	const addAnchor =
		children.length === 0 || (children.length > 0 && children[0].$$typeof === undefined)
	return (
		<React.Fragment>
			{/* add an invisible span for the anchor, so they're not scrolled under the site header */}
			<span id={id} className={style.bumper}></span>
			{addAnchor && <a href={`#${id}`}>▚</a>}
			{children}
		</React.Fragment>
	)
}

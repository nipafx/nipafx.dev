import React from "react"

import style from "./headings.module.css"

// all of this effort just to add an invisible span for the anchor,
// so they're not scrolled under the site header

export const H1 = ({ id, children }) => <h1>{inner(id, children)}</h1>
export const H2 = ({ id, children }) => <h2>{inner(id, children)}</h2>
export const H3 = ({ id, children }) => <h3>{inner(id, children)}</h3>
export const H4 = ({ id, children }) => <h4>{inner(id, children)}</h4>
export const H5 = ({ id, children }) => <h5>{inner(id, children)}</h5>
export const H6 = ({ id, children }) => <h6>{inner(id, children)}</h6>

const inner = (id, children) => (
	<React.Fragment>
		<span id={id} className={style.bumper}></span>
		{children}
	</React.Fragment>
)

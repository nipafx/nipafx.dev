import React from "react"
import RehypeReact from "rehype-react"

import { H1, H2, H3, H4, H5, H6 } from "../components/headings"
import Link from "../components/link"
import PullQuote from "../components/pullQuote"
import SeriesList from "../components/seriesList"

const RenderHtml = ({ withAst, htmlAst }) => {
	const renderAst = new RehypeReact({
		// this is needed to prevent Rehype from creating a <div> around
		// the rendered Markdown (which screws up the grid layout);
		// more: https://github.com/rehypejs/rehype-react/issues/9
		Fragment: React.Fragment,
		createElement: React.createElement,
		components: {
			h1: H1,
			h2: H2,
			h3: H3,
			h4: H4,
			h5: H5,
			h6: H6,
			a: renderLink,
			pullquote: PullQuote,
			"series-list": SeriesList,
		},
	}).Compiler

	return renderAst(withAst ? withAst.htmlAst : htmlAst)
}

const renderLink = props => {
	return <Link to={props.href} children={props.children} />
}

export default RenderHtml

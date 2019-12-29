import React from "react"
import RehypeReact from "rehype-react"

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

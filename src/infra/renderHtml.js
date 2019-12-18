import React from "react"
import RehypeReact from "rehype-react"

const RenderHtml = ({ withAst, htmlAst }) => {
	const renderAst = new RehypeReact({
		// this is needed to prevent Rehype from creating a <div> around
		// the rendered Markdown (which screws up the grid layout);
		// more: https://github.com/rehypejs/rehype-react/issues/9
		Fragment: React.Fragment,
		createElement: React.createElement,
	}).Compiler

	return renderAst(withAst ? withAst.htmlAst : htmlAst)
}

export default RenderHtml

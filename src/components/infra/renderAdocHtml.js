import React from "react"
import RehypeReact from "rehype-react"

const RenderHtml = ({ withAst, htmlAst }) => {
	const renderAst = new RehypeReact({
		createElement: React.createElement,
		components: {
			a: renderLink,
			img: renderImage,
		},
	}).Compiler

	return renderAst(htmlAst ? htmlAst : withAst.htmlAst)
}

const renderLink = ({ href, children }) => {
	return <span>LINK: {href}</span>
}

const renderImage = ({ src, title }) => {
	return <span>IMAGE: {src}</span>
}

export default RenderHtml

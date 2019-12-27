import React from "react"

import RenderHtml from "../infra/renderHtml"

import layout from "../layout/container.module.css"

const PostContent = ({ htmlAst }) => {
	return (
		<article className={layout.textContainer}>
			<RenderHtml htmlAst={htmlAst}/>
		</article>
	)
}

export default PostContent

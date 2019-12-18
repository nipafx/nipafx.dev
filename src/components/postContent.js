import React from "react"

import layout from "../layout/container.module.css"
import RenderHtml from "../infra/renderHtml"

const PostContent = ({ htmlAst }) => {
	return (
		<article className={layout.textContainer}>
			<RenderHtml htmlAst={htmlAst}/>
		</article>
	)
}

export default PostContent

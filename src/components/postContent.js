import React from "react"

import RenderHtml from "../infra/renderHtml"
import { classNames } from "../infra/functions"

import PostNav from "../components/postNav"

import layout from "../layout/container.module.css"

const PostContent = ({ title, repo, toc, htmlAst }) => {
	return (
		<article {...classNames(layout.container, layout.textContainer)}>
			<PostNav {...{ title, repo, toc }} />
			<RenderHtml htmlAst={htmlAst}/>
		</article>
	)
}

export default PostContent

import React from "react"

import RenderHtml from "../infra/renderHtml"
import { classNames } from "../infra/functions"

import PostNav from "../components/postNav"

import layout from "../layout/container.module.css"
import style from "./postContent.module.css"

const PostContent = ({ title, toc, series, repo, htmlAst }) => {
	return (
		<article {...classNames(layout.container, layout.textContainer, style.content)}>
			<PostNav {...{ title, toc, series, repo }} />
			<RenderHtml htmlAst={htmlAst} />
		</article>
	)
}

export default PostContent

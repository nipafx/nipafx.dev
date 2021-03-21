import React from "react"

import RenderHtml from "../infra/renderHtml"
import { classNames } from "../infra/functions"

import PostNav from "../components/postNav"

import * as layout from "../layout/container.module.css"
import * as style from "./postContent.module.css"

const PostContent = ({ title, slug, channel, description, toc, canonical, series, source, openNav, htmlAst, children }) => {
	return (
		<article {...classNames(layout.textContainer, style.content)}>
			<PostNav {...{ title, slug, channel, description, toc, canonical, series, source, open: openNav }} />
			{htmlAst && <RenderHtml htmlAst={htmlAst} />}
			{children}
		</article>
	)
}

export default PostContent

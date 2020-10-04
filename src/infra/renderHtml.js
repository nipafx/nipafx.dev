import React from "react"
import RehypeReact from "rehype-react"

import { classNames } from "../infra/functions"

import { H1, H2, H3, H4, H5, H6 } from "../components/headings"
import Admonition from "../components/admonition"
import ContentImage from "../components/contentImage"
import ContentVideo from "../components/contentVideo"
import CourseDetails from "../components/courseDetails"
import Link from "../components/link"
import PostListWrapper from "../components/postListWrapper"
import { PullQuote, BlockQuote } from "../components/quote"
import Table from "../components/table"

import layout from "../layout/container.module.css"
import contentStyle from "../components/postContent.module.css"

const RenderHtml = ({ withAst, htmlAst }) => {
	const renderAst = new RehypeReact({
		// this is needed to prevent Rehype from creating a <div> around
		// the rendered Markdown (which screws up the grid layout);
		// more: https://github.com/rehypejs/rehype-react/issues/9
		Fragment: React.Fragment,
		createElement: React.createElement,
		components: {
			h1: ({id, children}) => <H1 id={id} hasAnchor>{children}</H1>,
			h2: ({id, children}) => <H2 id={id} hasAnchor>{children}</H2>,
			h3: ({id, children}) => <H3 id={id} hasAnchor>{children}</H3>,
			h4: ({id, children}) => <H4 id={id} hasAnchor>{children}</H4>,
			h5: ({id, children}) => <H5 id={id} hasAnchor>{children}</H5>,
			h6: ({id, children}) => <H6 id={id} hasAnchor>{children}</H6>,
			a: renderLink,
			admonition: Admonition,
			blockquote: BlockQuote,
			contentimage: ContentImage,
			contentvideo: ContentVideo,
			coursedetails: CourseDetails,
			// div: it would be great to intercept div (e.g. to add `layout.offWide` to `.gatsby-highlight` divs),
			//      but this seems to override `Fragment: React.Fragment` (details above)
			ol: renderOrderedList,
			postlist: PostListWrapper,
			pullquote: PullQuote,
			table: Table,
			ul: renderUnorderedList,
		},
	}).Compiler

	return renderAst(withAst ? withAst.htmlAst : htmlAst)
}

const renderLink = ({ href, children }) => {
	const playLink = children && children[0] === "PLAY"
	if (playLink) return <Link to={href} className={contentStyle.play} />

	return <Link to={href} children={children}/>
}

const renderOrderedList = ({ id, className, style, children }) => {
	return (
		<ol id={id} {...classNames(className, layout.offCenter)} style={style}>
			{children}
		</ol>
	)
}

const renderUnorderedList = ({ id, className, style, children }) => {
	return (
		<ul id={id} {...classNames(className, layout.offCenter)} style={style}>
			{children}
		</ul>
	)
}

export default RenderHtml

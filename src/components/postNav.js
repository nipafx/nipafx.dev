import React from "react"

import Link from "./link"
import Nav from "./nav"
import Toc from "./toc"

import MarkdownAsHtml from "../infra/markdownAsHtml"

import style from "./postNav.module.css"

const PostNav = ({ title, toc, series, source }) => {
	if (!toc && !series && !source) return null

	return (
		<Nav title={title} headers={["table of contents", "series", "source code"]}>
			{toc && <Toc toc={toc} />}
			{series && showSeries(series)}
			{source && showSource(source)}
		</Nav>
	)
}

const showSeries = series => {
	return (
		<div className={style.series}>
			<p>This post is part of a series:</p>
			<ul>
				{series.posts.map(post =>
					post.current ? (
						<li key={post.slug} className={style.currentPost}>{post.title} (this one)</li>
					) : (
						<li key={post.slug}>
							<Link to={post.slug}>{post.title}</Link>
						</li>
					)
				)}
				{series.ongoing && <li>to be continued...</li>}
			</ul>
			<p>{series.description}</p>
		</div>
	)
}

const showSource = source => (
	<React.Fragment>
		{source.repo && (
			<p className={style.source}>
				Want to play around with the code yourself? Check out the repository{" "}
				<Link to={source.repo.url}>{source.repo.title}</Link>,{" "}
				<MarkdownAsHtml>{lowercaseFirstLetter(source.repo.description)}</MarkdownAsHtml> -
				it contains many of the snippets shown here.
				{!source.repo.restrictive &&
					" It has a permissive license, so you can reuse the code for your projects."}
			</p>
		)}
		{source.text && (
			<p className={style.source}>
				<MarkdownAsHtml>{source.text}</MarkdownAsHtml>
			</p>
		)}
	</React.Fragment>
)

const lowercaseFirstLetter = string => string.charAt(0).toLowerCase() + string.substring(1)

export default PostNav

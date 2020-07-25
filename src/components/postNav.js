import React from "react"

import Link from "./link"
import Nav from "./nav"
import Toc from "./toc"

import MarkdownAsHtml from "../infra/markdownAsHtml"

import style from "./postNav.module.css"

const PostNav = ({ title, toc, series, repo }) => {
	if (!toc && !series && !repo) return null

	return (
		<Nav title={title} headers={["table of contents", "series", "source code"]}>
			{toc && <Toc toc={toc} />}
			{series && showSeries(series)}
			{repo && showRepo(repo)}
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
						<li className={style.currentPost}>{post.title} (this one)</li>
					) : (
						<li>
							<Link to={post.slug}>{post.title}</Link>
						</li>
					)
				)}
			</ul>
			<p>{series.description}</p>
		</div>
	)
}

const showRepo = repo => (
	<p className={style.repo}>
		Want to play around with the code yourself? Check out{" "}
		<Link to={repo.url}>{repo.title}</Link>,{" "}
		<MarkdownAsHtml>{lowercaseFirstLetter(repo.description)}</MarkdownAsHtml> - it contains many
		of the snippets shown here.
	</p>
)

const lowercaseFirstLetter = string => string.charAt(0).toLowerCase() + string.substring(1)

export default PostNav

import React from "react"

import Link from "./link"
import Nav from "./nav"
import Toc from "./toc"

import { classNames } from "../infra/functions"
import MarkdownAsHtml from "../infra/markdownAsHtml"

import canonicalSites from "../../content/meta/canonical-sites.json"

import style from "./postNav.module.css"

const PostNav = ({ title, toc, canonical, series, source }) => {
	if (!toc && !series && !source) return null

	return (
		<Nav title={title} headers={["origin", "series", "source code", "table of contents"]}>
			{canonical && showCanonical(canonical, title)}
			{series && showSeries(series)}
			{source && showSource(source)}
			{toc && showToc(toc)}
		</Nav>
	)
}

const showToc = toc => (
	<div {...classNames(style.entry, style.toc)}>
		<Toc toc={toc} />
	</div>
)

const showCanonical = (canonical, title) => {
	const text = (canonical.text || findTextInCanonicalSites(canonical))
		.replace("$URL", canonical.url)
		.replace("$TITLE", title)
	return (
		<div className={style.entry}>
			<p>
				<MarkdownAsHtml>{text}</MarkdownAsHtml>
			</p>
		</div>
	)
}

const findTextInCanonicalSites = canonical =>
	canonicalSites.sites.find(site => canonical.url.match(site.url)).text

const showSeries = series => {
	return (
		<div className={style.entry}>
			<p>This post is part of a series:</p>
			<ul className={style.seriesList}>
				{series.posts.map(post =>
					post.current ? (
						<li key={post.slug} className={style.currentPost}>
							<MarkdownAsHtml>{post.title}</MarkdownAsHtml> (this one)
						</li>
					) : (
						<li key={post.slug}>
							<Link to={post.slug}>
								<MarkdownAsHtml>{post.title}</MarkdownAsHtml>
							</Link>
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
	<div className={style.entry}>
		{source.repo && (
			<p>
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

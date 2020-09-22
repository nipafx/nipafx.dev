import React from "react"

import Link from "./link"
import LinkList from "./linkList"
import Nav from "./nav"
import Toc from "./toc"

import { classNames } from "../infra/functions"
import MarkdownAsHtml from "../infra/markdownAsHtml"

import canonicalSites from "../../content/meta/canonical-sites.json"
import channelLinks from "../../content/meta/channel-links.json"
import shareLinks from "../../content/meta/share-links.json"

import style from "./postNav.module.css"

const PostNav = ({ title, slug, description, toc, canonical, series, source }) => {
	return (
		<Nav
			title={title}
			longHeaders={["origin", "series", "source code", "table of contents", "share & follow"]}
			shortHeaders={["org", "ser", "src", "toc", "s+f"]}
		>
			{canonical && showCanonical(canonical, title)}
			{series && showSeries(series)}
			{source && showSource(source)}
			{toc && showToc(toc)}
			{showShare(title, slug, description)}
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
	// TODO:
	//  - extract into own component
	//  - create "type", e.g. for "demo", "lab", "project", so text can be written accordingly
	//    (check in with `jdeps-maven-plugin` and `junit-5-parameterized-tests-nighthacking`, create `libfx`)
	//  - detect channel, so text can be written accordingly
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
			<p>
				<MarkdownAsHtml>{source.text}</MarkdownAsHtml>
			</p>
		)}
	</div>
)

const lowercaseFirstLetter = string => string.charAt(0).toLowerCase() + string.substring(1)

const showShare = (title, slug, description) => {
	return (
		<div className={style.entry}>
			<p>Share this post with your community:</p>
			<div className={style.icons}>
				<LinkList
					showIcons
					links={shareLinks.links.map(link =>
						updateShareUrl(link, title, slug, description)
					)}
				/>
			</div>
			<p>
				I'm active on various platforms. Watch this space or follow me there to get
				notified when I publish new content:
			</p>
			<div className={style.icons}>
				<LinkList showIcons links={channelLinks.links} />
			</div>
		</div>
	)
}

const updateShareUrl = (
	{ title, fontAwesome, url, className },
	articleTitle,
	articleSlug,
	articleDescription
) => {
	articleTitle = articleTitle.replace(/[/`/]/g, "")
	url = url
		.replace(/\n/g, encodeURI("\n"))
		.replace("$DESCRIPTION", articleDescription)
		.replace("$TITLE", articleTitle)
		.replace("$SLUG", articleSlug)
	return { title, fontAwesome, url, className }
}

export default PostNav

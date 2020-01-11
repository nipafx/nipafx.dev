import React from "react"

import { className } from "../infra/functions"

import Accordion from "./accordion"
import Link from "./link"
import Toc from "./toc"

import layout from "../layout/container.module.css"
import style from "./postNav.module.css"

const PostNav = ({ title, repo, toc }) => {
	if (!toc && !repo) return null

	return (
		<div {...className(layout.navbar, style.container)}>
			<section {...className(style.nav)}>
				<p className={style.title}>{title}</p>
				<Accordion
					titleClassName={style.entryTitle}
					titles={["table of contents", "source code"]}
				>
					{toc && <Toc toc={toc} />}
					{repo && showRepo(repo)}
				</Accordion>
			</section>
		</div>
	)
}

const showRepo = repo => (
	<p className={style.repo}>
		Want to play around with the code yourself? Check out{" "}
		<Link to={repo.url}>{repo.title}</Link>, {lowercaseFirstLetter(repo.description)} - it
		contains many of the snippets shown here.
	</p>
)

const lowercaseFirstLetter = string => string.charAt(0).toLowerCase() + string.substring(1)

export default PostNav

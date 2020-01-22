import React from "react"

import { classNames } from "../infra/functions"

import Accordion from "./accordion"
import Link from "./link"
import Toc from "./toc"

import MdAsHtml from "../infra/mdAsHtml"

import layout from "../layout/container.module.css"
import style from "./postNav.module.css"

const PostNav = ({ title, repo, toc }) => {
	if (!toc && !repo) return null

	return (
		<div {...classNames(layout.navbar, style.container)}>
			<section {...classNames(style.nav)}>
				<p className={style.title}>
					<MdAsHtml>{title}</MdAsHtml>
				</p>
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
		<Link to={repo.url}>{repo.title}</Link>,{" "}
		<MdAsHtml>{lowercaseFirstLetter(repo.description)}</MdAsHtml> - it contains many of the
		snippets shown here.
	</p>
)

const lowercaseFirstLetter = string => string.charAt(0).toLowerCase() + string.substring(1)

export default PostNav

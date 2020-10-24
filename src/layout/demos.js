import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import { classNames } from "../infra/functions"

import { H2 } from "../components/headings"
import Link from "../components/link"
import MarkdownAsHtml from "../infra/markdownAsHtml"
import PageLayout from "../layout/page"
import PostList from "../components/postList"

import style from "./demos.module.css"
import layout from "../layout/container.module.css"

const DemosLayout = page => {
	const repos = getReposWithPostSlugs()
	const toc = generateToc(repos)
	return (
		<PageLayout {...page} toc={toc}>
			{repos.map(showRepo)}
		</PageLayout>
	)
}

const showRepo = repo => {
	return (
		<React.Fragment key={repo.slug}>
			<H2 id={anchorOf(repo.title)}>
				<MarkdownAsHtml>{repo.title}</MarkdownAsHtml>
			</H2>
			<p>
				<MarkdownAsHtml>{repo.description}</MarkdownAsHtml>.
			</p>
			<p className={style.repoLink}>
				<Link to={repo.url}>Find the repository here.</Link>
			</p>
			<p>Here's a list of the posts that reference it:</p>
			<PostList
				slugs={repo.posts.map(post => post.slug)}
				{...classNames(layout.wide, style.posts)}
			/>
		</React.Fragment>
	)
}

const getReposWithPostSlugs = () => {
	const { repos, posts } = useStaticQuery(
		graphql`
			query {
				repos: allRepo(filter: { type: { eq: "demo" } }) {
					nodes {
						slug
						title
						url
						description
					}
				}
				posts: allPost(sort: { fields: date, order: DESC }) {
					nodes {
						date
						repo {
							slug
						}
						slug
					}
				}
			}
		`
	)
	const postsWithRepos = posts.nodes.filter(post => post.repo)
	// prettier-ignore
	return repos.nodes
		.map(repo => {
			const repoPosts = postsWithRepos.filter(post => post.repo.slug === repo.slug)
			return { ...repo, posts: repoPosts }
		})
		// sort repos by date of the youngest post;
		// dates are in the format YYY-mm-dd, so they can be compared lexicographically;
		// `repo2` first to sort by newest first
		.sort((repo1, repo2) => repo2.posts[0].date.localeCompare(repo1.posts[0].date))
}

const generateToc = repos => {
	const anchorList = repos
		.map(repo => [anchorOf(repo.title), repo.title])
		.map(([anchor, name]) => `<li><a href="#${anchor}" title="${name}">${name}</a></li>`)
		.join("")
	return `<ul>${anchorList}</ul>`
}

const anchorOf = title => title.replace(/[\s\/\+_]/g, "-").toLowerCase()

export default DemosLayout

import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import stub, { createTableOfContents, anchorOf } from "../infra/stubs"

import { classNames } from "../infra/functions"

import { H2 } from "../components/headings"
import Link from "../components/link"
import PostLayout from "../layout/post"
import PostContent from "../components/postContent"
import PostList from "../components/postList"
import SiteLayout from "../layout/site"

import style from "./demos.module.css"
import layout from "../layout/container.module.css"

const DemosPage = () => {
	const { meta, header, content } = stub(`demos`)
	const repos = getReposWithPostSlugs()
	content.toc = generateToc(repos)

	return (
		<SiteLayout className={content.channel} meta={meta}>
			<PostLayout {...header}>
				<PostContent {...content}>{repos.map(showRepo)}</PostContent>
			</PostLayout>
		</SiteLayout>
	)
}

const showRepo = repo => {
	return (
		<React.Fragment key={repo.slug}>
			<H2 id={anchorOf(repo.title)}>
				<span dangerouslySetInnerHTML={{ __html: repo.title }} />
			</H2>
			<p dangerouslySetInnerHTML={{ __html: repo.description }} />
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
	const toc = repos.map(repo => {
		return {
			title: repo.title,
			anchor: anchorOf(repo.title),
		}
	})
	return createTableOfContents(toc)
}

export default DemosPage

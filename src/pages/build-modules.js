import React from "react"
import { graphql } from "gatsby"

import { processTableOfContents } from "../infra/functions"

import PostLayout from "../layout/post"
import PostContent from "../components/postContent"
import Snippet from "../components/snippet"
import SiteLayout from "../layout/site"

import "./build-modules.css"

const BuildModulesPage = ({ data }) => {
	const post = data.posts.nodes.find(p => p.slug === `build-modules`)

	const postMeta = {
		title: post.title,
		slug: post.slug,
		image: post.featuredImage,
		description: post.description,
		searchKeywords: post.searchKeywords,
	}
	const postHeader = {
		title: post.title,
		date: post.date,
		channel: "articles",
		tags: post.tags,
		intro: post.intro ?? post.description,
		// no featured image above diagram
		// featuredImage: post.featuredImage,
	}
	const postContent = {
		title: post.title,
		slug: post.slug,
		channel: "articles",
		description: post.description,
		toc: processTableOfContents(post.content.tableOfContents),
		// series: findSeries(data),
		source: post.repo ?? post.source ? { repo: post.repo, text: post.source } : undefined,
		openNav: true,
		htmlAst: post.content.htmlAst,
	}

	return (
		<SiteLayout className="article" meta={postMeta}>
			<PostLayout {...postHeader}>
				<Snippet html="cheat-build-modules" />
				<PostContent {...postContent} />
			</PostLayout>
		</SiteLayout>
	)
}

export const query = graphql`
	{
		posts: allPost {
			nodes {
				title
				slug
				date
				channel
				tags
				description
				intro
				featuredImage
				repo {
					url
					title
					type
					description
					restrictive
				}
				content {
					htmlAst
					tableOfContents(pathToSlugField: "frontmatter.slug")
				}
			}
		}
	}
`

export default BuildModulesPage

import React from "react"
import { graphql } from "gatsby"

import { processTableOfContents } from "../infra/functions"

import SiteLayout from "../layout/site"
import ArticleLayout from "../layout/article"

export default ({ data }) => {
	const article = {
		title: data.article.title,
		slug: data.article.slug,
		date: data.article.date,
		tags: data.article.tags,
		canonical:
			data.article.canonicalUrl || data.article.canonicalText
				? { url: data.article.canonicalUrl, text: data.article.canonicalText }
				: undefined,
		description: data.article.description,
		intro: data.article.intro ?? data.article.description,
		featuredImage: data.article.featuredImage,
		toc: processTableOfContents(data.article.content.tableOfContents),
		source:
			data.article.repo || data.article.source
				? { repo: data.article.repo, text: data.article.source }
				: undefined,
		series: findSeries(data),
		htmlAst: data.article.content.htmlAst,
	}
	const meta = {
		title: data.article.title,
		slug: data.article.slug,
		canonicalUrl: data.article.canonicalUrl,
		image: data.article.featuredImage,
		description: data.article.description,
		searchKeywords: data.article.searchKeywords,
	}
	return (
		<SiteLayout className="article" meta={meta}>
			<ArticleLayout {...article} />
		</SiteLayout>
	)
}

const findSeries = data => {
	const article = data.article.slug
	const seriesTags = data.tags.nodes
		.filter(tag => tag.series)
		.filter(tag =>
			tag.series
				// `null` post is allowed to indicate an ongoing series
				.filter(post => post)
				.map(post => post.slug)
				.includes(article)
		)

	if (seriesTags.length === 0) return null
	// I assume each post can only be part of at most one series - hence `seriesTags[0]`
	const series = seriesTags[0]
	const description = series.seriesDescription
	// `null` post is allowed to indicate an ongoing series
	const ongoing = series.series.includes(null)
	const posts = series.series
		.filter(post => post)
		.map(post => (post.slug === article ? { ...post, current: true } : post))
	return { description, posts, ongoing }
}

export const query = graphql`
	query($slug: String!) {
		article: article(slug: { eq: $slug }) {
			title
			slug
			date
			tags
			canonicalUrl
			canonicalText
			description
			intro
			searchKeywords
			featuredImage
			repo {
				url
				title
				description
				restrictive
			}
			source
			content {
				htmlAst
				tableOfContents(pathToSlugField: "frontmatter.slug")
			}
		}
		tags: allTag {
			nodes {
				title
				slug
				series {
					title
					slug
				}
				seriesDescription
			}
		}
	}
`

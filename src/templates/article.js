import React from "react"
import { graphql } from "gatsby"

import SiteLayout from "../layout/site"
import ArticleLayout from "../layout/article"

export default ({ data }) => {
	const article = {
		title: data.article.title,
		slug: data.article.slug,
		date: data.article.date,
		tags: data.article.tags,
		canonical: data.article.canonicalUrl
			? { url: data.article.canonicalUrl, text: data.article.canonicalText }
			: undefined,
		description: data.article.description,
		intro: data.article.intro ?? data.article.description,
		featuredImage: data.article.featuredImage,
		toc: createTableOfContents(data.article),
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

	if (seriesTags.length == 0) return null
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

const createTableOfContents = article =>
	article.content.tableOfContents
		.replace(/"/g, `'`)
		.replace(/<a href='[^#"]*(#[^']*)'>(.*)<\/a>/g, `<a href="$1" title="$2">$2<\/a>`)
		.replace(/<p>|<\/p>/g, "")
		// the Remark-generated ToC contains line-breaks, some of which Firefox
		// displays as a whitespace where there shouldn't be one
		// (e.g. before <li>s that contain a <ul>)
		.replace(/\n/g, ``)

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
			content {
				htmlAst
				tableOfContents(pathToSlugField: "frontmatter.slug")
			}
			repo {
				url
				title
				description
				restrictive
			}
			source
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

import React from "react"
import { graphql } from "gatsby"

import SiteLayout from "../layout/site"
import ArticleLayout from "../layout/article"

export default ({ data }) => {
	const article = {
		title: data.article.title,
		date: data.article.date,
		tags: data.article.tags,
		intro: data.article.intro ?? data.article.description,
		featuredImage: data.article.featuredImage,
		toc: createTableOfContents(data.article),
		repo: data.article.repo,
		series: findSeries(data),
		htmlAst: data.article.content.htmlAst,
	}
	const meta = {
		title: data.article.title,
		slug: data.article.slug,
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
		.filter(tag => tag.series.map(post => post.slug).includes(article))

	if (seriesTags.length == 0) return null
	// I assume each post can only be part of at most one series - hence `seriesTags[0]`
	const description = seriesTags[0].seriesDescription
	const posts = seriesTags[0].series.map(post =>
		post.slug === article ? { ...post, current: true } : post
	)
	return { description, posts }
}

const createTableOfContents = article => {
	return article.content.tableOfContents
		.replace(/"/g, `'`)
		.replace(/<a href='[^#"]*(#[^']*)'>(.*)<\/a>/g, `<a href="$1" title="$2">$2<\/a>`)
		.replace(/<p>|<\/p>/g, "")
}

export const query = graphql`
	query($slug: String!) {
		article: article(slug: { eq: $slug }) {
			title
			slug
			date
			tags
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

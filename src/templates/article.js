import React from "react"
import { graphql } from "gatsby"

import { detectSeries, detectSource, processTableOfContents } from "../infra/stubs"

import SiteLayout from "../layout/site"
import ArticleLayout from "../layout/article"

export default ({ data }) => {
	const article = {
		title: data.article.title,
		slug: data.article.slug,
		date: data.article.date,
		tags: data.article.tags,
		canonical:
			data.article.canonicalUrl ?? data.article.canonicalText
				? { url: data.article.canonicalUrl, text: data.article.canonicalText }
				: undefined,
		description: data.article.description,
		intro: data.article.intro ?? data.article.description,
		featuredImage: data.article.featuredImage,
		toc: processTableOfContents(data.article.content.tableOfContents),
		source: detectSource(data.article.repo, data.article.source),
		series: detectSeries(data.article.slug),
		htmlAst: data.article.content.htmlAst,
	}
	const meta = {
		title: data.article.title,
		slug: data.article.slug,
		publicationDate: data.article.date,
		canonicalUrl: data.article.canonicalUrl,
		image: {
			slug: data.article.featuredImage,
			type: "postTitle",
		},
		description: data.article.description,
		searchKeywords: data.article.searchKeywords,
		structuredDataType: "article",
	}
	return (
		<SiteLayout className="article" meta={meta}>
			<ArticleLayout {...article} />
		</SiteLayout>
	)
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
				type
				description
				restrictive
			}
			source
			content {
				htmlAst
				tableOfContents(pathToSlugField: "frontmatter.slug")
			}
		}
	}
`

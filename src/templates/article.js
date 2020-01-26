import React from "react"
import { graphql } from "gatsby"

import Site from "../layout/site"
import Article from "../layout/article"

export default ({ data }) => {
	const article = {
		title: data.article.title,
		date: data.article.date,
		tags: data.article.tags,
		featuredImage: data.article.featuredImage,
		repo: data.article.repo,
		toc: createTableOfContents(data.article),
		htmlAst: data.article.content.htmlAst,
	}
	const meta = {
		title: data.article.title,
		slug: data.article.slug,
		description: data.article.description,
		searchKeywords: data.article.searchKeywords,
	}
	return (
		<Site className="article" meta={meta}>
			<Article {...article} />
		</Site>
	)
}

const createTableOfContents = article =>
	article.content.tableOfContents
		.replace(/<a href="[^#"]*(#[^"]*)">([^<]*)<\/a>/g, `<a href="$1" title="$2">$2<\/a>`)
		.replace(/<p>|<\/p>/g, "")

export const query = graphql`
	query($slug: String!) {
		article: article(slug: { eq: $slug }) {
			title
			slug
			date
			tags
			description
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
	}
`

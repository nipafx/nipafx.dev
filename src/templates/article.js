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
		htmlAst: data.article.content.htmlAst,
	}
	return (
		<Site altColor="article">
			<Article {...article} />
		</Site>
	)
}

export const query = graphql`
	query($slug: String!) {
		article: article(slug: { eq: $slug }) {
			title
			date
			tags
			featuredImage
			content {
				htmlAst
			}
		}
	}
`

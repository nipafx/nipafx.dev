import React from "react"
import { graphql } from "gatsby"

import Site from "../layout/site"
import Page from "../layout/page"

export default ({ data }) => {
	const page = {
		title: data.page.title,
		date: data.page.date,
		tags: data.page.tags,
		toc: createTableOfContents(data.page),
		htmlAst: data.page.content.htmlAst,
	}
	return (
		<Site className="page">
			<Page {...page} />
		</Site>
	)
}

const createTableOfContents = page =>
	page.content.tableOfContents
		.replace(/<a href="[^#"]*(#[^"]*)">([^<]*)<\/a>/g, `<a href="$1" title="$2">$2<\/a>`)
		.replace(/<p>|<\/p>/g, "")

export const query = graphql`
	query($slug: String!) {
		page: page(slug: { eq: $slug }) {
			title
			tags
			date
			content {
				htmlAst
				tableOfContents(pathToSlugField: "frontmatter.slug")
			}
		}
	}
`

import React from "react"
import { graphql } from "gatsby"

import SiteLayout from "../layout/site"
import PageLayout from "../layout/page"

export default ({ data }) => {
	const page = {
		title: data.page.title,
		date: data.page.date,
		tags: data.page.tags,
		toc: createTableOfContents(data.page),
		htmlAst: data.page.content.htmlAst,
	}
	const meta = {
		title: data.page.title,
		slug: data.page.slug,
		description: data.page.description,
		searchKeywords: data.page.searchKeywords,
	}
	return (
		<SiteLayout className="page" meta={meta}>
			<PageLayout {...page} />
		</SiteLayout>
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
			slug
			date
			tags
			description
			searchKeywords
			content {
				htmlAst
				tableOfContents(pathToSlugField: "frontmatter.slug")
			}
		}
	}
`

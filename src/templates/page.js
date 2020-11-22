import React from "react"
import { graphql } from "gatsby"

import { processTableOfContents } from "../infra/stubs"

import SiteLayout from "../layout/site"
import PageLayout from "../layout/page"

export default ({ data }) => {
	const page = {
		title: data.page.title,
		slug: data.page.slug,
		date: data.page.date,
		tags: data.page.tags,
		description: data.page.description,
		intro: data.page.intro ?? data.page.description,
		featuredImage: data.page.featuredImage,
		toc: processTableOfContents(data.page.content.tableOfContents),
		htmlAst: data.page.content.htmlAst,
	}
	const meta = {
		title: data.page.title,
		slug: data.page.slug,
		description: data.page.description,
		searchKeywords: data.page.searchKeywords,
		image: {
			slug: data.page.featuredImage,
			type: "postTitle",
		},
		structuredDataType: "article",
	}
	const className = data.page.style ?? "page"
	return (
		<SiteLayout className={className} meta={meta}>
			<PageLayout {...page} />
		</SiteLayout>
	)
}

export const query = graphql`
	query($slug: String!) {
		page: page(slug: { eq: $slug }) {
			title
			slug
			date
			tags
			style
			description
			searchKeywords
			featuredImage
			content {
				htmlAst
				tableOfContents(pathToSlugField: "frontmatter.slug")
			}
		}
	}
`

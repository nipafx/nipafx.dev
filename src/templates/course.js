import React from "react"
import { graphql } from "gatsby"

import { processTableOfContents } from "../infra/stubs"

import SiteLayout from "../layout/site"
import CourseLayout from "../layout/course"

export default ({ data }) => {
	const course = {
		title: data.course.title,
		slug: data.course.slug,
		date: data.course.date,
		tags: data.course.tags,
		description: data.course.description,
		intro: data.course.intro ?? data.course.description,
		toc: processTableOfContents(data.course.content.tableOfContents),
		featuredImage: data.course.featuredImage,
		htmlAst: data.course.content.htmlAst,
	}
	const meta = {
		title: data.course.title,
		slug: data.course.slug,
		image: {
			slug: data.course.featuredImage,
			type: "postTitle",
		},
		description: data.course.description,
		searchKeywords: data.course.searchKeywords,
		structuredDataType: "course",
	}
	return (
		<SiteLayout className="course" meta={meta}>
			<CourseLayout {...course} />
		</SiteLayout>
	)
}

export const query = graphql`
	query($slug: String!) {
		course: course(slug: { eq: $slug }) {
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
		}
	}
`

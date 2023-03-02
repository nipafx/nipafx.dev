import React from "react"
import { graphql } from "gatsby"

import { PROGRESS_BAR_REFERENCE_ID } from "../components/progressBar"
import Site from "../layout/site"
import { AllTagsHeader } from "../components/header"
import { Tag } from "../components/taglet"

import * as layout from "../layout/container.module.css"
import * as style from "./tags.module.css"

const TagsPage = ({ data }) => (
	<Site
		meta={{
			title: "All tags",
			slug: "tags",
			description: "All tags of all articles, videos, newsletters, etc.",
		}}
	>
		<section id={PROGRESS_BAR_REFERENCE_ID}>
			<AllTagsHeader />
			<div className={layout.container}>
				<div className={style.container}>
					{data.tags.group.map(tag => (
						<span key={tag.slug}>
							<Tag tag={tag.slug} mode="forward" />
							<span>{` (${tag.count})`}</span>
						</span>
					))}
				</div>
			</div>
		</section>
	</Site>
)

export const query = graphql`
	{
		tags: allPost {
			group(field: { tags: SELECT }) {
				slug: fieldValue
				count: totalCount
			}
		}
	}
`

export default TagsPage

import React from "react"
import { graphql } from "gatsby"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import Site from "../layout/site"
import { AllTagsHeader } from "../components/header"
import { Tag } from "../components/taglet"

import layout from "../layout/container.module.css"
import style from "./tags.module.css"

const TagsPage = ({ data }) => (
	<Site
		meta={{
			title: "All tags",
			slug: "tags",
			description: "All tags of all articles, videos, newsletters, etc.",
		}}
	>
		<section id={PROGRESS_BAR_REFERENCE}>
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
			group(field: tags) {
				slug: fieldValue
				count: totalCount
			}
		}
	}
`

export default TagsPage

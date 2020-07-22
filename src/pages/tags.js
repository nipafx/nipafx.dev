import React from "react"
import { graphql } from "gatsby"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import Site from "../layout/site"
import { AllTagsHeader } from "../components/header"
import { Tag } from "../components/taglet"

import layout from "../layout/container.module.css"

const TagsPage = ({ data }) => (
	<Site
		meta={{
			title: "All tags",
			slug: "tags",
			description: "All tags of all articles, videos, newsletters, etc.",
		}}
	>
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<AllTagsHeader />
				{/* TODO: more beautiful list */}
				<div className={layout.container}>
					<ul>
						{data.tags.group.map(tag => (
							<li key={tag.slug}>
								<Tag tag={tag.slug} mode="forward" />
								<span>{` (${tag.count})`}</span>
							</li>
						))}
					</ul>
				</div>
			</section>
		</main>
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

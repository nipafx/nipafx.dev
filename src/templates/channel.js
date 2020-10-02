import React from "react"
import { graphql } from "gatsby"

import { processTableOfContents } from "../infra/functions"

import SiteLayout from "../layout/site"
import TagletLayout from "../layout/taglet"

const ChannelPage = ({ data }) => {
	const channel = {
		channel: data.channel.internalName,
		title: data.channel.title,
		description: data.channel.description,
		contentAst: data.channel.content.htmlAst,
		toc: processTableOfContents(data.channel.content.tableOfContents),
		postSlugs: data.posts.nodes.map(post => post.slug),
	}
	const meta = {
		title: data.channel.title,
		slug: data.channel.slug,
		description: data.channel.description,
	}
	return (
		<SiteLayout className={channel.channel} meta={meta}>
			<TagletLayout {...channel} />
		</SiteLayout>
	)
}

export const query = graphql`
	query($channel: String!) {
		channel: channel(internalName: { eq: $channel }) {
			title
			internalName
			slug
			description
			content {
				htmlAst
				tableOfContents(pathToSlugField: "frontmatter.slug")
			}
		}
		posts: allPost(
			sort: { fields: [date], order: DESC }
			filter: { channel: { eq: $channel } }
		) {
			nodes {
				slug
			}
		}
	}
`

export default ChannelPage

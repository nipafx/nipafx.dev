import React from "react"
import { graphql } from "gatsby"

import SiteLayout from "../layout/site"
import TagletLayout from "../layout/taglet"

export default ({ data }) => {
	const channel = {
		channel: data.channel.internalName,
		description: data.channel.description,
		content: data.channel.content.htmlAst,
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

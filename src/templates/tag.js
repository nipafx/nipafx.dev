import React from "react"

import { graphql } from "gatsby"

import { processTableOfContents } from "../infra/stubs"

import PostListWrapper from "../components/postListWrapper"
import SiteLayout from "../layout/site"
import TagletLayout from "../layout/taglet"

const TagPage = ({ pageContext, data }) => {
	const richTag = data.tags.nodes.length > 0 ? data.tags.nodes[0] : null
	const simpleTag = pageContext.tag
	const tag = richTag
		? {
				...richTag,
				tag: simpleTag,
				contentAst: richTag.content.htmlAst,
				toc: processTableOfContents(richTag.content.tableOfContents),
		  }
		: {
				tag: simpleTag,
				slug: simpleTag,
				title: simpleTag,
		  }
	const meta = {
		title: tag.title || tag.slug,
		slug: tag.slug,
		description: tag.description || "Articles about " + tag.slug,
		searchKeywords: tag.slug,
	}

	return (
		<SiteLayout className="list" meta={meta}>
			<TagletLayout {...tag}>
				{/* rich tags (those in `content/tag`) include <postlist> in their markdown;
				    add the list here for tags without markdown file */}
				{!richTag && <PostListWrapper kind="tag" slug={simpleTag}></PostListWrapper>}
			</TagletLayout>
		</SiteLayout>
	)
}

export const pageQuery = graphql`
	query($tag: String) {
		tags: allTag(filter: { slug: { eq: $tag } }) {
			nodes {
				slug
				title
				description
				series {
					slug
				}
				content {
					htmlAst
					tableOfContents(pathToSlugField: "frontmatter.slug")
				}
			}
		}
	}
`

export default TagPage

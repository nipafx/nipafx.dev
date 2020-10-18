import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import MarkdownAsHtml from "../infra/markdownAsHtml"
import RenderHtml from "../infra/renderHtml"

import layout from "../layout/container.module.css"

const Snippet = ({ html, markdown }) => {
	if (html)
		return (
			<div
				className={layout.wide}
				dangerouslySetInnerHTML={{ __html: getSnippet(html).rawContent }}
			/>
		)
	if (markdown) return <RenderHtml htmlAst={getSnippet(markdown).content.htmlAst} />
	return null
}

const getSnippet = slug => {
	const { snippets } = useStaticQuery(
		graphql`
			query {
				snippets: allSnippet {
					nodes {
						slug
						rawContent
						content {
							... on MarkdownRemark {
								htmlAst
							}
						}
					}
				}
			}
		`
	)
	return snippets.nodes.find(snippet => snippet.slug === slug)
}

export default Snippet

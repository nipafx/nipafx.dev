import React from "react"

import stub from "../infra/stubs"

import PostLayout from "../layout/post"
import PostContent from "../components/postContent"
import Snippet from "../components/snippet"
import SiteLayout from "../layout/site"

import "./build-modules.css"

const BuildModulesPage = () => {
	const { meta, header, content } = stub(`build-modules`)
	// no featured image above diagram
	header.featuredImage = null
	content.openNav = true

	return (
		<SiteLayout className={content.channel} meta={meta}>
			<PostLayout {...header}>
				<Snippet html="cheat-build-modules" />
				<PostContent {...content} />
			</PostLayout>
		</SiteLayout>
	)
}

export default BuildModulesPage

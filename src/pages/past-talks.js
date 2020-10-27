import React from "react"

import stub from "../infra/stubs"

import PostLayout from "../layout/post"
import PostContent from "../components/postContent"
import PresentationList from "../components/presentationList"
import SiteLayout from "../layout/site"

const PastTalksPage = () => {
	const { meta, header, content } = stub(`past-talks`)

	return (
		<SiteLayout className={content.channel} meta={meta}>
			<PostLayout {...header}>
				<PostContent {...content}>
					<PresentationList />
				</PostContent>
			</PostLayout>
		</SiteLayout>
	)
}

export default PastTalksPage

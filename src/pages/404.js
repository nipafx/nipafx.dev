import React from "react"

import stub from "../infra/stubs"

import PostContent from "../components/postContent"
import PostLayout from "../layout/post"
import SiteLayout from "../layout/site"

const FourOhFourPage = () => {
	const { meta, header, content } = stub(`404`)

	return (
		<SiteLayout className="page" meta={meta}>
			<PostLayout {...header}>
				<PostContent {...content} />
			</PostLayout>
		</SiteLayout>
	)
}

export default FourOhFourPage

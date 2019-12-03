import React from "react"

import layout from "../layout/container.module.css"

const PostContent = ({ html }) => {
	return (
		<article className={layout.textContainer} dangerouslySetInnerHTML={{ __html: html }} />
	)
}

export default PostContent

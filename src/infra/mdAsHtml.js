import React from "react"

import remark from "remark"
import remarkHTML from "remark-html"

const MdAsHtml = ({ children }) => {
	// check whether `children` are React elements
	if (children.$$typeof)
		return children

	const __html =
		children instanceof Array ? children.map(md => toHtml(md)).join("") : toHtml(children)
	return <span dangerouslySetInnerHTML={{ __html }} />
}

const toHtml = md => {
	return remark()
		.use(remarkHTML)
		.processSync(md)
		.toString()
		.replace(/<p>|<\/p>|\n/g, "")
}

export default MdAsHtml

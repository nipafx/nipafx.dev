import React from "react"

import remark from "remark"
import remarkHTML from "remark-html"

/* WARNING:
	This component does not work well if a child string contains
	newlines. They will be stripped and the result will have no
	spaces in their place.It also can't run the remark used to,
	e.g. apply inlineCodeLanguage.
	It is probably best to use it as little as possible. Remember
	that if custom HTML tags (like `<admonition>`) are followed
	by an empty line, Remark will parse the contained Markdown,
	so there's no need to use this component for that.
*/
const MarkdownAsHtml = ({ className, children }) => {
	// check whether `children` are React elements
	if (children.$$typeof)
		return children

	const __html =
		children instanceof Array ? children.map(md => toHtml(md)).join("") : toHtml(children)
	return <span className={className} dangerouslySetInnerHTML={{ __html }} />
}

const toHtml = md => {
	return remark()
		.use(remarkHTML)
		.processSync(md)
		.toString()
		.replace(/<p>|<\/p>|\n/g, "")
}

export default MarkdownAsHtml

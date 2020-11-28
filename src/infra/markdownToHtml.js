const remark = require(`remark`)
const remarkHTML = require(`remark-html`)

exports.markdownToHtml = md => {
	return remark()
		.use(remarkHTML)
		.processSync(md)
		.toString()
		.replace(/<p>|<\/p>|\n/g, "")
}

const visit = require(`unist-util-visit`)

module.exports = ({ markdownAST, markdownNode }) => {
	visit(markdownAST, `html`, node => {
		if (node.value.startsWith(`<postlist`))
			// prettier-ignore
			node.value = `<postlist slug="${markdownNode.frontmatter.slug}" ${node.value.substring(10)}`
	})
}

const visit = require(`unist-util-visit`)

module.exports = ({ markdownAST, markdownNode }) => {
	visit(markdownAST, `html`, node => {
		if (node.value === `<series-list>`)
			node.value = `<series-list slug=${markdownNode.frontmatter.slug}>`
	})
}

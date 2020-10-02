const visit = require(`unist-util-visit`)

module.exports = ({ markdownAST, markdownNode }) => {
	visit(markdownAST, `html`, node => {
		if (node.value === `<serieslist>`)
			node.value = `<serieslist slug=${markdownNode.frontmatter.slug}>`
	})
}

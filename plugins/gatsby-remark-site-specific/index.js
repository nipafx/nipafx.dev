const visit = require(`unist-util-visit`)

module.exports = ({ markdownAST, markdownNode }) => {
	visit(markdownAST, `html`, node => {
		if (node.value === `<serieslist>`)
			node.value = `<serieslist slug=${markdownNode.frontmatter.slug}>`
		if (node.value === `<channellist>`)
			node.value = `<channellist slug=${markdownNode.frontmatter.slug}>`
	})
}

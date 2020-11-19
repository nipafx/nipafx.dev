const visit = require(`unist-util-visit`)

module.exports = ({ markdownAST, markdownNode }, userOptions) => {
	const defaults = {
		defaultInlineLanguage: null,
		frontmatterProperty: "inlineCodeLanguage",
		inlineCodeMarker: null
	}
	const options = {...defaults, ...userOptions }
	if (!options.inlineCodeMarker)
		throw new Error("Please define option 'inlineCodeMarker' for plugin 'gatsby-remark-add-inline-code-language'.")

	const language = markdownNode.frontmatter[options.frontmatterProperty] ?? options.defaultInlineLanguage
	if (!language)
		return
	const marker = options.inlineCodeMarker

	visit(markdownAST, `inlineCode`, node => {
		// just the marker without language prefix means the default should not be applied;
		// ~> the marker needs to be removed, so Prism doesn't see it
		if (node.value.startsWith(marker))
			node.value = node.value.substring(marker.length)
		// if there is no marker yet, no language was defined and the default should be applied
		else if (!node.value.includes(marker))
			node.value = language + marker + node.value
	})
}

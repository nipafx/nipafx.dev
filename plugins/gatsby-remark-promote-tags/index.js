const visit = require(`unist-util-visit`)

module.exports = ({ markdownAST }, userOptions) => {
	const defaults = {
		tags: [],
	}
	const { tags } = { ...defaults, ...userOptions }

	visit(markdownAST, `paragraph`, (paragraph, index, parent) => {
		const isTagInRedundantParagraph =
			paragraph.children.length === 2 &&
			isOpeningTag(paragraph.children[0], tags) &&
			isClosingTag(paragraph.children[1], tags)
		if (isTagInRedundantParagraph) {
			const tagAunts = parent.children
			const tagWithAunts = [
				...tagAunts.slice(0, index),
				paragraph.children[0],
				paragraph.children[1],
				...tagAunts.slice(index + 1),
			]
			parent.children = tagWithAunts
		}
	})
}

const isOpeningTag = (node, tags) =>
	node.type === "html" &&
	tags.map(tag => `<${tag}`).filter(tag => node.value.startsWith(tag)).length > 0

const isClosingTag = (node, tags) =>
	node.type === "html" &&
	tags.map(tag => `</${tag}>`).filter(tag => node.value === tag).length > 0

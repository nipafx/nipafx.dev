const path = require(`path`)

exports.sourceNodes = ({ actions, createContentDigest }) => {
	const { createNode } = actions
	createNode({
		id: `post`,
		parent: null,
		children: [],
		internal: {
			type: `PostCollection`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	})
	createNode({
		id: `tag`,
		parent: null,
		children: [],
		internal: {
			type: `TagCollection`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	})
}

exports.onCreateNode = ({ node, getNode, actions, createContentDigest }) => {
	const { createNodeField, createNode, deleteNode } = actions

	if ([`ImageSharp`, `MarkdownRemark`].includes(node.internal.type)) {
		// add a field `collection` with the source instance (e.g. `src-images`),
		// so GraphQL queries can use that information to filter by it
		createNodeField({
			node,
			name: `collection`,
			value: getNode(node.parent).sourceInstanceName,
		})

		// add a field `id` matching the file name, so it can be used to easily identify nodes by file name
		const relative = getNode(node.parent).relativePath
		const file = relative.substring(0, relative.lastIndexOf(`.`)).replace(`/`, `-`)
		createNodeField({
			node,
			name: `id`,
			value: file,
		})
	}

	if (node.internal.type === `MarkdownRemark`) {
		// draft nodes shouldn't show up anywhere during a production build
		if (process.env.NODE_ENV === `production` && node.frontmatter.draft) {
			deleteNode(node)
			return
		}

		createPostNodes(node, createNode, createContentDigest)
		createTagNodes(node, createNode, createContentDigest)
	}
}

createPostNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `posts`)
		return

	const post = {
		id: node.fields.id,

		title: node.frontmatter.title,
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		tags: node.frontmatter.tags,
		description: node.frontmatter.description,
		socialDescription: node.frontmatter.searchDescription,
		featuredImage: node.frontmatter.featuredImage,
		searchKeywords: node.frontmatter.searchKeywords,

		// it would be nice to simply assign `node.html`/`node.htmlAst` to a field,
		// but remark creates them later (in setFieldsOnGraphQLNodeType[1]), so they
		// don't exist yet; hooking into that phase seems complicated;
		// the best solution seems to be to refer to the entire node (ugh!) with an
		// undocumented API[2] and query `html` one step removed
		// [1] https://github.com/gatsbyjs/gatsby/issues/6230#issuecomment-401438659
		// [2] https://github.com/gatsbyjs/gatsby/issues/1583#issuecomment-317827660
		content___NODE: node.id,

		parent: `post`,
		children: [],
		internal: {
			type: `BlogPost`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	if (node.frontmatter.draft) post.draft = node.frontmatter.draft

	createNode(post)
}

createTagNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `tags`)
		return

	const tag = {
		id: node.fields.id,

		title: node.frontmatter.title,
		slug: node.frontmatter.slug,

		// see comment on creating blog post nodes
		content___NODE: node.id,

		parent: `tag`,
		children: [],
		internal: {
			type: `Tag`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	if (node.frontmatter.series) tag.series = node.frontmatter.series
	if (node.frontmatter.draft) tag.draft = node.frontmatter.draft

	createNode(tag)
}

exports.createPages = ({ graphql, actions }) => {
	const { createPage } = actions

	return Promise.all([
		createPostPages(graphql, createPage),
		createTagPages(graphql, createPage),
	])
}

createPostPages = (graphql, createPage) => {
	const postTemplate = path.resolve(`./src/templates/post.js`)

	return graphql(`
		{
			posts: allBlogPost {
				nodes {
					id
					slug
				}
			}
		}
	`).then(({ data }) => {
		data.posts.nodes.forEach(post => {
			createPage({
				path: post.slug,
				component: postTemplate,
				context: {
					slug: post.slug,
				},
			})
		})
	})
}

createTagPages = (graphql, createPage) => {
	const tagTemplate = path.resolve(`./src/templates/tag.js`)

	return graphql(`
		{
			tags: allBlogPost {
				group(field: tags) {
					name: fieldValue
				}
			}
		}
	`).then(({ data }) => {
		data.tags.group.forEach(tag => {
			createPage({
				path: tag.name,
				component: tagTemplate,
				context: {
					tag: tag.name
				},
			})
		})
	})
}

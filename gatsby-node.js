const path = require(`path`)

// for ignoring drafts:
// process.env.NODE_ENV === "production"

exports.sourceNodes = ({ actions, createContentDigest }) => {
	const { createNode } = actions
	createNode({
		id: `post`,
		parent: null,
		children: [],
		internal: {
			type: `BlogPostCollection`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	})
}

exports.onCreateNode = ({ node, getNode, actions, createContentDigest }) => {
	const { createNodeField, createNode, deleteNode } = actions

	if ([`ImageSharp`, `MarkdownRemark`].includes(node.internal.type)) {
		// add a field "collection" with the source instance (e.g. "src-images"),
		// so GraphQL queries can use that information to filter by it
		createNodeField({
			node,
			name: `collection`,
			value: getNode(node.parent).sourceInstanceName,
		})

		// add a field "id" matching the file name, so it can be used to easily identify nodes by file name
		const relative = getNode(node.parent).relativePath
		const file = relative.substring(0, relative.lastIndexOf(`.`)).replace(`/`, `-`)
		createNodeField({
			node,
			name: `id`,
			value: file,
		})
	}

	if (node.internal.type === `MarkdownRemark`) {
		// draft nodes shouldn't show up anywhere
		if (node.frontmatter.draft) {
			deleteNode(node)
			return
		}

		const post = {
			id: node.fields.id,

			title: node.frontmatter.title,
			slug: node.frontmatter.slug,
			date: node.frontmatter.date,
			tags: node.frontmatter.tags,
			description: node.frontmatter.description,
			socialDescription: node.frontmatter.searchDescription,
			image: node.frontmatter.image,
			searchKeywords: node.frontmatter.searchKeywords,

			// it would be nice to simply assign `node.html`/`node.htmlAst` to a field,
			// but remark creates them later (in setFieldsOnGraphQLNodeType[1]), so they
			// don't exist yet; hooking into that phase seems complicated;
			// the best solution seems to be to refer to the entire node (ugh!) with an
			// udocumented API[2] and query `html` one step removed
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
		if (node.frontmatter.image) post.image = node.frontmatter.image

		createNode(post)
	}
}

exports.createPages = ({ graphql, actions }) => {
	const { createPage } = actions
	const postTemplate = path.resolve(`./src/templates/post.js`)

	const posts = graphql(`
		{
			posts: allBlogPost {
				nodes {
					id
					slug
				}
			}
		}
	`).then(({ data }) => {
		data.posts.nodes.forEach(node => {
			createPage({
				path: node.slug,
				component: postTemplate,
				context: {
					id: node.id,
				},
			})
		})
	})

	return Promise.all([posts])
}

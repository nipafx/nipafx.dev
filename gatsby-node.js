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
	const { createNodeField, createNode } = actions

	if ([`ImageSharp`, `Asciidoc`].includes(node.internal.type)) {
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

	if (node.internal.type === `Asciidoc`) {
		const post = {
			id: node.fields.id,

			title: node.pageAttributes.title,
			slug: node.pageAttributes.slug,
			date: node.pageAttributes.date,
			description: node.pageAttributes.description,
			socialDescription: node.pageAttributes.searchDescription,
			image: node.pageAttributes.image,
			searchKeywords: node.pageAttributes.searchKeywords,

			html: node.html,

			parent: `post`,
			children: [],
			internal: {
				type: `BlogPost`,
				content: ``,
				contentDigest: createContentDigest(``),
			},
		}

		if (node.pageAttributes.draft) post.draft = node.pageAttributes.draft
		if (node.pageAttributes.image) post.image = node.pageAttributes.image

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
		data.posts.nodes.forEach( node => {
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

const path = require(`path`)
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

exports.onCreateWebpackConfig = ({ actions }) => {
	actions.setWebpackConfig({
		plugins: [
			// Silence mini-css-extract-plugin generating lots of warnings for CSS ordering.
			// We use CSS modules that should not care for the order of CSS imports, so we
			// should be safe to ignore these.
			//
			// See:
			// https://github.com/facebook/create-react-app/issues/5372
			// https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250
			new FilterWarningsPlugin({
				exclude: /.*mini-css-extract-plugin.*/,
			}),
		],
	})
}

exports.sourceNodes = ({ actions, createContentDigest }) => {
	const createRootNode = createCreateRootNode(actions.createNode, createContentDigest)
	createRootNode(`article`, `ArticleCollection`)
	createRootNode(`channel`, `ChannelCollection`)
	createRootNode(`course`, `CourseCollection`)
	createRootNode(`page`, `PageCollection`)
	createRootNode(`post`, `PostCollection`)
	createRootNode(`repo`, `RepoCollection`)
	createRootNode(`tag`, `TagCollection`)
	createRootNode(`talk`, `TalkCollection`)
	createRootNode(`video`, `VideoCollection`)
}

const createCreateRootNode = (createNode, createContentDigest) => (id, type) =>
	createRootNode(createNode, id, type, createContentDigest)

const createRootNode = (createNode, id, type, createContentDigest) =>
	createNode({
		id,
		parent: null,
		children: [],
		internal: {
			type,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	})

exports.onCreateNode = ({ node, getNode, actions, createContentDigest }) => {
	const { createNodeField, createNode, deleteNode } = actions

	createFields(node, getNode, createNodeField)

	if (node.internal.type === `MarkdownRemark`) {
		// draft nodes shouldn't show up anywhere during a production build
		if (node.frontmatter.draft) {
			console.warn(
				"Draft: ",
				node.fileAbsolutePath.substring(node.fileAbsolutePath.lastIndexOf("/") + 1)
			)
			if (process.env.NODE_ENV === `production`) {
				deleteNode(node)
				return
			}
		}

		createPostNodes(node, createNode, createContentDigest)
		createArticleNodes(node, createNode, createContentDigest)
		createChannelNodes(node, createNode, createContentDigest)
		createCourseNodes(node, createNode, createContentDigest)
		createPageNodes(node, createNode, createContentDigest)
		createRepoNodes(node, createNode, createContentDigest)
		createTagNodes(node, createNode, createContentDigest)
		createTalkNodes(node, createNode, createContentDigest)
		createVideoNodes(node, createNode, createContentDigest)
	}
}

createFields = (node, getNode, createNodeField) => {
	if (![`ImageSharp`, `MarkdownRemark`].includes(node.internal.type)) return

	// add a field `collection` with the source instance (e.g. `articles`),
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

exports.createSchemaCustomization = ({ actions }) => {
	const { createTypes } = actions
	// NOTE:
	//  - title, description, and intro can use Markdown syntax!
	//  - linked nodes (see `mapping` in `gatsby-config` must not be part of the schema)
	const typeDefs = `
		type Post implements Node {
			title: String!
			slug: String!
			date: Date! @dateformat
			channel: String!
			tags: [String!]!
			description: String!
			featuredImage: String
		}
		type Article implements Node {
			title: String!
			slug: String!
			date: Date! @dateformat
			tags: [String!]!
			canonicalUrl: String
			canonicalText: String
			description: String!
			intro: String
			searchKeywords: String
			featuredImage: String
			source: String
		}
		type Channel implements Node {
			title: String!
			internalName: String!
			singularName: String!
			pluralName: String!
			slug: String!
			description: String!
		}
		type Course implements Node {
			title: String!
			slug: String!
			date: Date! @dateformat
			tags: [String!]!
			description: String!
			length: String!
			audience: String!
			requirements: String!
			intro: String
			searchKeywords: String
			featuredImage: String
		}
		type Page implements Node {
			title: String!
			slug: String!
			date: Date! @dateformat
			tags: [String!]!
			description: String!
			searchKeywords: String
			featuredImage: String
		}
		type Repo implements Node {
			title: String!
			slug: String!
			tags: [String!]!
			type: String!
			description: String!
			url: String!
			restrictive: Boolean
		}
		type Tag implements Node {
			title: String!
			slug: String!
			description: String!
			seriesDescription: String
		}
		type Talk implements Node {
			title: String!
			slug: String!
			date: Date! @dateformat
			tags: [String!]!
			description: String!
			intro: String
			searchKeywords: String
			featuredImage: String
			slides: String
			videoSlug: String
		}
		type Video implements Node {
			title: String!
			slug: String!
			videoSlug: String!
			date: Date! @dateformat
			tags: [String!]!
			description: String!
			intro: String
			searchKeywords: String
			featuredImage: String
			source: String
		}
	`
	createTypes(typeDefs)
}

createPostNodes = (node, createNode, createContentDigest) => {
	if (![`articles`, `courses`, `videos`, `talks`].includes(node.fields.collection))
		return

	const post = {
		id: node.fields.collection + `-as-post-` + node.fields.id,

		title: node.frontmatter.title,
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		channel: node.fields.collection,
		tags: node.frontmatter.tags,
		description: node.frontmatter.description,
		featuredImage: node.frontmatter.featuredImage,

		parent: `post`,
		children: [],
		internal: {
			type: `Post`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	createNode(post)
}

createArticleNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `articles`) return

	const article = {
		id: `article-` + node.fields.id,

		title: node.frontmatter.title,
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		tags: node.frontmatter.tags,
		canonicalUrl: node.frontmatter.canonicalUrl,
		canonicalText: node.frontmatter.canonicalText,
		description: node.frontmatter.description,
		intro: node.frontmatter.intro,
		searchKeywords: node.frontmatter.searchKeywords,
		featuredImage: node.frontmatter.featuredImage,
		repo: node.frontmatter.repo,
		source: node.frontmatter.source,

		// it would be nice to simply assign `node.html`/`node.htmlAst` to a field,
		// but remark creates them later (in setFieldsOnGraphQLNodeType[1]), so they
		// don't exist yet; hooking into that phase seems complicated;
		// the best solution seems to be to refer to the entire node (ugh!) with
		// `___NODE`[2] and query `html` one step removed
		// [1] https://github.com/gatsbyjs/gatsby/issues/6230#issuecomment-401438659
		// [2] https://www.gatsbyjs.org/docs/node-creation/#foreign-key-reference-___node
		content___NODE: node.id,

		parent: `article`,
		children: [],
		internal: {
			type: `Article`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	createNode(article)
}

createChannelNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `channels`) return

	const path = node.fileAbsolutePath
	// remove directories and file extension ".md"
	const fileName = path.substring(path.lastIndexOf(`/`) + 1, path.length - 3)

	const channel = {
		id: `channel-` + node.fields.id,

		title: node.frontmatter.title,
		internalName: fileName,
		singularName: node.frontmatter.singularName,
		pluralName: node.frontmatter.pluralName,
		slug: node.frontmatter.slug,
		description: node.frontmatter.description,
		featuredImage: node.frontmatter.featuredImage,

		// see comment on creating article nodes
		content___NODE: node.id,

		parent: `channel`,
		children: [],
		internal: {
			type: `Channel`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	createNode(channel)
}

createCourseNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `courses`) return

	const course = {
		id: `course-` + node.fields.id,

		title: node.frontmatter.title,
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		tags: node.frontmatter.tags,
		description: node.frontmatter.description,
		length: node.frontmatter.length,
		audience: node.frontmatter.audience,
		requirements: node.frontmatter.requirements,
		intro: node.frontmatter.intro,
		searchKeywords: node.frontmatter.searchKeywords,
		featuredImage: node.frontmatter.featuredImage,

		// see comment on creating article nodes
		content___NODE: node.id,

		parent: `course`,
		children: [],
		internal: {
			type: `Course`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	createNode(course)
}

createPageNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `pages`) return

	const page = {
		id: `page-` + node.fields.id,

		title: node.frontmatter.title,
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		tags: node.frontmatter.tags,
		description: node.frontmatter.description,
		searchKeywords: node.frontmatter.searchKeywords,
		featuredImage: node.frontmatter.featuredImage,

		// see comment on creating article nodes
		content___NODE: node.id,

		parent: `page`,
		children: [],
		internal: {
			type: `Page`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	createNode(page)
}

createRepoNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `repos`) return

	const repo = {
		id: `repo-` + node.fields.id,

		title: node.frontmatter.title,
		slug: node.frontmatter.slug,
		tags: node.frontmatter.tags,
		type: node.frontmatter.type,
		description: node.frontmatter.description,
		url: node.frontmatter.url,

		parent: `repo`,
		children: [],
		internal: {
			type: `Repo`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	createNode(repo)
}

createTagNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `tags`) return

	const tag = {
		id: `tag-` + node.fields.id,

		title: node.frontmatter.title,
		slug: node.frontmatter.slug,
		description: node.frontmatter.description,
		series: node.frontmatter.series,
		seriesDescription: node.frontmatter.seriesDescription,

		// see comment on creating article nodes
		content___NODE: node.id,

		parent: `tag`,
		children: [],
		internal: {
			type: `Tag`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	createNode(tag)
}

createTalkNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `talks`) return

	const talk = {
		id: `talk-` + node.fields.id,

		title: node.frontmatter.title,
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		tags: node.frontmatter.tags,
		description: node.frontmatter.description,
		intro: node.frontmatter.intro,
		searchKeywords: node.frontmatter.searchKeywords,
		featuredImage: node.frontmatter.featuredImage,
		slides: node.frontmatter.slides,
		videoSlug: node.frontmatter.videoSlug,
		repo: node.frontmatter.repo,

		// see comment on creating article nodes
		content___NODE: node.id,

		parent: `talk`,
		children: [],
		internal: {
			type: `Talk`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	createNode(talk)
}

createVideoNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `videos`) return

	const video = {
		id: `video-` + node.fields.id,

		title: node.frontmatter.title,
		slug: node.frontmatter.slug,
		videoSlug: node.frontmatter.videoSlug,
		date: node.frontmatter.date,
		tags: node.frontmatter.tags,
		description: node.frontmatter.description,
		intro: node.frontmatter.intro,
		searchKeywords: node.frontmatter.searchKeywords,
		repo: node.frontmatter.repo,
		source: node.frontmatter.source,

		// see comment on creating article nodes
		content___NODE: node.id,

		parent: `video`,
		children: [],
		internal: {
			type: `Video`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	createNode(video)
}

exports.createPages = ({ graphql, actions }) => {
	const { createPage } = actions

	return Promise.all([
		createArticlePages(graphql, createPage),
		createChannelPages(graphql, createPage),
		createCoursePages(graphql, createPage),
		createPagePages(graphql, createPage),
		createTagPages(graphql, createPage),
		createTalkPages(graphql, createPage),
		createVideoPages(graphql, createPage),
	])
}

createArticlePages = (graphql, createPage) => {
	const articleTemplate = path.resolve(`./src/templates/article.js`)

	return graphql(`
		{
			articles: allArticle {
				nodes {
					slug
				}
			}
		}
	`).then(({ data }) => {
		data.articles.nodes.forEach(article => {
			createPage({
				path: article.slug,
				component: articleTemplate,
				context: {
					slug: article.slug,
				},
			})
		})
	})
}

createChannelPages = (graphql, createPage) => {
	const pageTemplate = path.resolve(`./src/templates/channel.js`)

	return graphql(`
		{
			channels: allChannel {
				nodes {
					internalName
					slug
				}
			}
		}
	`).then(({ data }) => {
		data.channels.nodes.forEach(channel => {
			createPage({
				path: channel.slug,
				component: pageTemplate,
				context: {
					channel: channel.internalName,
				},
			})
		})
	})
}

createCoursePages = (graphql, createPage) => {
	const courseTemplate = path.resolve(`./src/templates/course.js`)

	return graphql(`
		{
			courses: allCourse {
				nodes {
					slug
				}
			}
		}
	`).then(({ data }) => {
		data.courses.nodes.forEach(course => {
			createPage({
				path: course.slug,
				component: courseTemplate,
				context: {
					slug: course.slug,
				},
			})
		})
	})
}

createPagePages = (graphql, createPage) => {
	const pageTemplate = path.resolve(`./src/templates/page.js`)

	return graphql(`
		{
			pages: allPage {
				nodes {
					slug
				}
			}
		}
	`).then(({ data }) => {
		data.pages.nodes.forEach(page => {
			createPage({
				path: page.slug,
				component: pageTemplate,
				context: {
					slug: page.slug,
				},
			})
		})
	})
}

createTagPages = (graphql, createPage) => {
	const tagTemplate = path.resolve(`./src/templates/tag.js`)

	return graphql(`
		{
			tags: allPost {
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
					tag: tag.name,
				},
			})
		})
	})
}

createTalkPages = (graphql, createPage) => {
	const talkTemplate = path.resolve(`./src/templates/talk.js`)

	return graphql(`
		{
			talks: allTalk {
				nodes {
					slug
				}
			}
		}
	`).then(({ data }) => {
		data.talks.nodes.forEach(talk => {
			createPage({
				path: talk.slug,
				component: talkTemplate,
				context: {
					slug: talk.slug,
				},
			})
		})
	})
}

createVideoPages = (graphql, createPage) => {
	const articleTemplate = path.resolve(`./src/templates/video.js`)

	return graphql(`
		{
			videos: allVideo {
				nodes {
					slug
				}
			}
		}
	`).then(({ data }) => {
		data.videos.nodes.forEach(video => {
			createPage({
				path: video.slug,
				component: articleTemplate,
				context: {
					slug: video.slug,
				},
			})
		})
	})
}

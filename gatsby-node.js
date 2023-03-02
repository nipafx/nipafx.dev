/*
When more than 10 event listeners are registered, node emits a warning like this
(reproduce with `node --trace-warnings node_modules/.bin/gatsby develop`):

(node:64191) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 end listeners added to [PassThrough]. Use emitter.setMaxListeners() to increase limit
    at _addListener (node:events:465:17)
    at PassThrough.addListener (node:events:487:10)
    at PassThrough.Readable.on (node:internal/streams/readable:899:35)
    at eos (node:internal/streams/end-of-stream:169:10)
    at pipe (node:internal/streams/pipeline:348:3)
    at pipelineImpl (node:internal/streams/pipeline:293:9)
    at pipeline (node:internal/streams/pipeline:146:10)
    at probeStream (/home/nipa/code/nipafx.dev/node_modules/probe-image-size/stream.js:63:8)
    at get_image_size (/home/nipa/code/nipafx.dev/node_modules/probe-image-size/index.js:13:12)
    at getImageSizeAsync (/home/nipa/code/nipafx.dev/node_modules/gatsby-plugin-sharp/index.js:63:28)
    at getImageMetadata (/home/nipa/code/nipafx.dev/node_modules/gatsby-plugin-sharp/image-data.js:33:39)
    at generateImageData (/home/nipa/code/nipafx.dev/node_modules/gatsby-plugin-sharp/image-data.js:123:26)
    at resolver (/home/nipa/code/nipafx.dev/node_modules/gatsby-transformer-sharp/customize-schema.js:605:31)
    at wrappedTracingResolver (/home/nipa/code/nipafx.dev/node_modules/gatsby/src/schema/resolvers.ts:683:20)
    at resolveField (/home/nipa/code/nipafx.dev/node_modules/graphql/execution/execute.js:464:18)
    at executeFields (/home/nipa/code/nipafx.dev/node_modules/graphql/execution/execute.js:292:18)

Setting a slightly higher limit removes that warning.
*/
require(`events`).EventEmitter.defaultMaxListeners = 15;

const fs = require(`fs-extra`)
const path = require(`path`)
const { createICalendar } = require(`./src/infra/iCalendar`)
const { markdownToHtml } = require(`./src/infra/markdownToHtml`)

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
	// Silence mini-css-extract-plugin generating lots of warnings for CSS ordering.
	// The site uses CSS modules, so order of CSS imports doesn't matter.
	//
	// See:
	// https://github.com/facebook/create-react-app/issues/5372
	// https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250
	// https://stackoverflow.com/a/63128321/2525313 & https://stackoverflow.com/a/68211261/2525313
	if (stage === `develop` || stage === `build-javascript`) {
		const config = getConfig()
		config.plugins.find(plugin => plugin.constructor.name === `MiniCssExtractPlugin`).options.ignoreOrder = true
		actions.replaceWebpackConfig(config)
	}
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

	createFieldsOnContentNodes(node, getNode, createNodeField)
	createFieldsOnFileNodes(node, createNodeField)

	createSnippetNodes(node, createNode, createContentDigest)

	if (node.internal.type === `MarkdownRemark`) {
		// draft nodes shouldn't show up anywhere during a production build
		if (node.frontmatter.draft) {
			console.warn(
				`Draft: `,
				node.fileAbsolutePath.substring(node.fileAbsolutePath.lastIndexOf(`/`) + 1)
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
		createStubNodes(node, createNode, createContentDigest)
		createTagNodes(node, createNode, createContentDigest)
		createTalkNodes(node, createNode, createContentDigest)
		createVideoNodes(node, createNode, createContentDigest)
	}
}

createFieldsOnContentNodes = (node, getNode, createNodeField) => {
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

createFieldsOnFileNodes = (node, createNodeField) => {
	if (node.internal.type !== `File` || node.sourceInstanceName !== `snippets`) return

	// see `createFieldsOnContentNodes`
	createNodeField({
		node,
		name: `collection`,
		value: node.sourceInstanceName,
	})
	const relative = node.relativePath
	const file = relative.substring(0, relative.lastIndexOf(`.`)).replace(`/`, `-`)
	createNodeField({
		node,
		name: `id`,
		value: file,
	})

	// create field for local path to extract content
	createNodeField({
		node,
		name: `localPath`,
		value: node.absolutePath,
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
			intro: String
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
			style: String
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
		type Snippet implements Node {
			slug: String!
			rawContent: String
		}
		type Stub implements Node {
			title: String!
			slug: String!
			date: Date! @dateformat
			isPost: Boolean!
			channel: String!
			structuredDataType: String
			tags: [String!]!
			description: String!
			intro: String
			searchKeywords: String
			featuredImage: String
			source: String
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

futurePost = node =>
	// don't show future posts in production builds
	process.env.NODE_ENV === `production` && Date.now() < Date.parse(node.frontmatter.date)

createPostNodes = (node, createNode, createContentDigest) => {
	// do not include `courses` nodes to make them less prominent (now that I no longer offer them)
	if (![`articles`, `videos`, `stubs`, `talks`].includes(node.fields.collection))
		return
	if (node.fields.collection === `stubs` && !node.frontmatter.isPost) return
	if (futurePost(node)) {
		console.log(
			`Post ${node.frontmatter.slug} in ${node.fields.collection} skipped because it's scheduled for ${node.frontmatter.date}.`
		)
		return
	}

	const post = {
		id: node.fields.collection + `-as-post-` + node.fields.id,

		title: markdownToHtml(node.frontmatter.title),
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		channel:
			node.fields.collection === `stubs` ? node.frontmatter.channel : node.fields.collection,
		tags: node.frontmatter.tags,
		description: markdownToHtml(node.frontmatter.description),
		featuredImage: node.frontmatter.featuredImage,
		repo: node.frontmatter.repo,

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
	if (node.fields.collection !== `articles` || futurePost(node)) return

	const article = {
		id: `article-` + node.fields.id,

		title: markdownToHtml(node.frontmatter.title),
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		tags: node.frontmatter.tags,
		canonicalUrl: node.frontmatter.canonicalUrl,
		canonicalText: node.frontmatter.canonicalText,
		description: markdownToHtml(node.frontmatter.description),
		intro: markdownToHtml(node.frontmatter.intro),
		searchKeywords: node.frontmatter.searchKeywords,
		featuredImage: node.frontmatter.featuredImage,
		repo: node.frontmatter.repo,
		source: markdownToHtml(node.frontmatter.source),

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

		title: markdownToHtml(node.frontmatter.title),
		internalName: fileName,
		singularName: node.frontmatter.singularName,
		pluralName: node.frontmatter.pluralName,
		slug: node.frontmatter.slug,
		description: markdownToHtml(node.frontmatter.description),
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
	if (node.fields.collection !== `courses` || futurePost(node)) return

	const course = {
		id: `course-` + node.fields.id,

		title: markdownToHtml(node.frontmatter.title),
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		tags: node.frontmatter.tags,
		description: markdownToHtml(node.frontmatter.description),
		length: node.frontmatter.length,
		audience: node.frontmatter.audience,
		requirements: node.frontmatter.requirements,
		intro: markdownToHtml(node.frontmatter.intro),
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
	if (node.fields.collection !== `pages` || futurePost(node)) return

	const page = {
		id: `page-` + node.fields.id,

		title: markdownToHtml(node.frontmatter.title),
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		tags: node.frontmatter.tags,
		style: node.frontmatter.style,
		description: markdownToHtml(node.frontmatter.description),
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

		title: markdownToHtml(node.frontmatter.title),
		slug: node.frontmatter.slug,
		tags: node.frontmatter.tags,
		type: node.frontmatter.type,
		description: markdownToHtml(node.frontmatter.description),
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

createSnippetNodes = (node, createNode, createContentDigest) => {
	if (
		!node.fields ||
		node.fields.collection !== `snippets` ||
		// Markdown files in `content/snippets` are processed automatically and
		// two nodes are generated for them: a `File` node and `MarkdownRemark` node (see `node.internal.type`)
		// We only turn the `MarkdownRemark` node into a snippet node (it is richer anyway)
		node.internal.mediaType === `text/markdown`
	)
		return

	const snippet = {
		id: `snippet-` + node.fields.id,

		slug: node.fields.id,

		rawContent: node.fields.localPath && fs.readFileSync(node.fields.localPath, `utf8`),
		// see comment on creating article nodes
		content___NODE: node.id,

		parent: `snippet`,
		children: [],
		internal: {
			type: `Snippet`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	createNode(snippet)
}

// This creates a `Stub` node for each stub. It might make sense to _also_ create a node
// in the respective channel, but that would require additional code (here or in the
// channel?) and a new flag (to prevent creation via templates) without apparent benefit.
// So I don't do that (for now).
createStubNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `stubs`) return

	const stub = {
		id: `stub-` + node.fields.id,

		title: markdownToHtml(node.frontmatter.title),
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		isPost: node.frontmatter.isPost ?? false,
		channel: node.frontmatter.channel,
		structuredDataType: node.frontmatter.structuredDataType,
		tags: node.frontmatter.tags,
		description: markdownToHtml(node.frontmatter.description),
		intro: markdownToHtml(node.frontmatter.intro),
		searchKeywords: node.frontmatter.searchKeywords,
		featuredImage: node.frontmatter.featuredImage,
		repo: node.frontmatter.repo,
		source: markdownToHtml(node.frontmatter.source),

		// see comment on creating article nodes
		content___NODE: node.id,

		parent: `stub`,
		children: [],
		internal: {
			type: `Stub`,
			content: ``,
			contentDigest: createContentDigest(``),
		},
	}

	createNode(stub)
}

createTagNodes = (node, createNode, createContentDigest) => {
	if (node.fields.collection !== `tags`) return

	const tag = {
		id: `tag-` + node.fields.id,

		title: markdownToHtml(node.frontmatter.title),
		slug: node.frontmatter.slug,
		description: markdownToHtml(node.frontmatter.description),
		series: node.frontmatter.series,
		seriesDescription: markdownToHtml(node.frontmatter.seriesDescription),

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
	if (node.fields.collection !== `talks` || futurePost(node)) return

	const talk = {
		id: `talk-` + node.fields.id,

		title: markdownToHtml(node.frontmatter.title),
		slug: node.frontmatter.slug,
		date: node.frontmatter.date,
		tags: node.frontmatter.tags,
		description: markdownToHtml(node.frontmatter.description),
		intro: markdownToHtml(node.frontmatter.intro),
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
	if (node.fields.collection !== `videos` || futurePost(node)) return

	const video = {
		id: `video-` + node.fields.id,

		title: markdownToHtml(node.frontmatter.title),
		slug: node.frontmatter.slug,
		videoSlug: node.frontmatter.videoSlug,
		date: node.frontmatter.date,
		tags: node.frontmatter.tags,
		description: markdownToHtml(node.frontmatter.description),
		intro: markdownToHtml(node.frontmatter.intro),
		searchKeywords: node.frontmatter.searchKeywords,
		repo: node.frontmatter.repo,
		source: markdownToHtml(node.frontmatter.source),

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
	const channelTemplate = path.resolve(`./src/templates/channel.js`)

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
				component: channelTemplate,
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
				group(field: { tags: SELECT }) {
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
	const videoTemplate = path.resolve(`./src/templates/video.js`)

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
				component: videoTemplate,
				context: {
					slug: video.slug,
				},
			})
		})
	})
}

exports.onPostBuild = ({ graphql }) => {
	return graphql(`
		{
			site {
				siteMetadata {
					calendar
				}
			}
		}
	`).then(({ data }) => {
		// create calendar
		const iCal = createICalendar(``, `upcomingMonths`, `asc`)
		fs.writeFileSync(`./public/${data.site.siteMetadata.calendar}`, iCal.toString())

		return null
	})
}

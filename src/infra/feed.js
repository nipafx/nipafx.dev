const videoData = require("../../content/meta/videos.json")

// see "rss" module for documentation on the settings:
// https://www.npmjs.com/package/rss#usage
const feed = {
	setup: ({ query: { site } }) => {
		return {
			title: site.siteMetadata.title,
			description: site.siteMetadata.description,
			generator: `Gatsby using "gatsby-plugin-feed" using "rss" (node module)`,
			feed_url: `${site.siteMetadata.siteUrl}/feed.xml`,
			site_url: site.siteMetadata.siteUrl,
			image_url: `${site.siteMetadata.siteUrl}/logo-bg.png`,
			managingEditor: `${site.siteMetadata.authorEmail} (${site.siteMetadata.author})`,
			webMaster: `${site.siteMetadata.authorEmail} (${site.siteMetadata.author})`,
			copyright: `Mostly CC-BY-NC 4.0 for words and Apache 2.0 for code - for details check ${site.siteMetadata.siteUrl}/license`,
			language: "en-us",
			categories: ["java", "software-development", "programming"],
			pubDate: new Date(),
		}
	},
	serialize: ({ query: { site, posts, articles, videos, snippets, contentImages } }) =>
		posts.nodes.map(post => {
			const item = {
				title: sanitizeTitle(post.title),
				description: post.intro ?? post.description,
				url: `${site.siteMetadata.siteUrl}/${post.slug}`,
				guid: `${site.siteMetadata.siteUrl}/${post.slug}`,
				categories: post.tags,
				author: site.siteMetadata.author,
				date: post.date,
			}

			let content =
				`<p>${item.description}</p>` + identifyContent(post.slug, articles, videos)
			content = insertSnippets(content, snippets)
			content = sanitizeContent(content)
			content = makeLinksAbsolute(content, site)
			content = insertContentMedia(content, contentImages, site)
			item.custom_elements = [{ "content:encoded": content }]

			return item
		}),
	query: `
		{
			posts: allPost(sort: {fields: [date], order: DESC}) {
				nodes {
					title
					slug
					date
					description
					intro
					tags
				}
			}
			articles: allArticle {
				nodes {
					slug
					content {
						html
					}
				}
			}
			videos: allVideo {
				nodes {
					slug
					videoSlug
					content {
						html
					}
				}
			}
			contentImages: allImageSharp(
				filter: { fields: { collection: { eq: "content-images" } } }
			) {
				nodes {
					fields {
						id
					}
					fluid(maxWidth: 800, srcSetBreakpoints: [800], jpegQuality: 60) {
						src
					}
				}
			}
			snippets: allSnippet {
				nodes {
					slug
					rawContent
					content {
						... on MarkdownRemark {
							html
						}
					}
				}
			}
		}
		`,
	output: "/feed.xml",
	// `setup` (see above) overrides this, but without `title`,
	// the plugin logs a warning during the build
	title: "nipafx",
}

/*
 * ADD CONTENT
 */

const identifyContent = (slug, articles, videos) => {
	const article = articles.nodes.find(article => article.slug === slug)
	const video = videos.nodes.find(video => video.slug === slug)

	if (article) return article.content.html
	if (video) {
		let videoUrl = videoData.videos
			.find(v => v.slug === video.videoSlug)
			// HTML encode the video URL
			.url.replace("&", "&#x26;")
		return video.content.html + `<p><a href="${videoUrl}">Watch the video.</a></p>`
	}

	return ""
}

const insertSnippets = (content, snippets) =>
	content
		.replace(
			/<snippet markdown="([^"]*)">\n*<\/snippet>/g,
			(tag, slug) => getSnippet(snippets, slug).content.html
		)
		.replace(
			/<snippet html="([^"])*">\n*<\/snippet>/g,
			(tag, slug) => getSnippet(snippets, slug).rawContent
		)

const getSnippet = (snippets, slug) => snippets.nodes.find(snippet => snippet.slug === slug)

/*
 * SANITIZE CONTENT
 */

const sanitizeTitle = title => title.replace(/<\/?code>/g, "")

const sanitizeContent = content =>
	content
		.replace(/style="[^"]*"/g, "")
		.replace(/className="[^"]*"/g, "")
		.replace(/aria-label="[^"]*"/g, "")
		.replace(/<a [^>]* class="header-id-link before">▚<\/a>/g, "")
		.replace(/<(\/?)pullquote>/g, "<$1blockquote>")
		.replace(/<admonition[^>]*>/g, `<p style="font-weight: bold;">Note:</p>`)
		.replace(/<\/admonition>/g, `<p style="font-weight: bold;">End Note.</p>`)

const makeLinksAbsolute = (content, site) =>
	content.replace(/<a href="([^"]*)">/g, (tag, href) => {
		const url =
			// keep links to anchors in the same article as is;
			// not sure whether all RSS readers support that (Akregator does),
			// but making them absolute seems very weird
			href.startsWith("http") || href.startsWith("#")
				? href
				: `${site.siteMetadata.siteUrl}/${href}`
		return `<a href="${url}">`
	})

const insertContentMedia = (content, contentImages, site) =>
	content
		.replace(
			/<contentimage[^>]*slug="([^"]*)"[^>]*>\n*<\/contentimage>/g,
			replaceContentImage(contentImages, site)
		)
		.replace(/<contentvideo[^>]*slug="([^"]*)"[^>]*>\n*<\/contentvideo>/g, replaceContentVideo)

const replaceContentImage = (contentImages, site) => (tag, slug) => {
	const imageUrl = contentImages.nodes.find(img => img.fields.id === slug).fluid.src
	return `<img src="${site.siteMetadata.siteUrl + imageUrl}">`
}

const replaceContentVideo = (tag, slug) => {
	const videoUrl = videoData.videos.find(vid => vid.slug === slug).url
	return `<p><a href="${videoUrl}">Embedded video.</a></p>`
}

module.exports = feed

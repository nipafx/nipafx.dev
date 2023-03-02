const imageData = require("../../images/images.json")
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
	serialize: ({
		query: { site, posts, articles, courses, stubs, talks, videos, snippets, contentImages },
	}) =>
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
				`<p>${item.description}</p>` +
				identifyContent(post.slug, articles, courses, stubs, talks, videos)
			content = insertSnippets(content, snippets)
			content = insertCourseDetails(content, courses)
			content = sanitizeContent(content)
			content = makeLinksAbsolute(content, site)
			content = insertContentMedia(content, contentImages, site)
			item.custom_elements = [{ "content:encoded": content }]

			return item
		}),
	query: `
		{
			posts: allPost(sort: { date: DESC }) {
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
			courses: allCourse {
				nodes {
					slug
					length
					audience
					requirements
					content {
						html
					}
				}
			}
			stubs: allStub(filter: { isPost: { eq: true } }) {
				nodes {
					slug
					content {
						html
					}
				}
			}
			talks: allTalk {
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
					gatsbyImageData(layout: CONSTRAINED width: 800 jpgOptions: { quality: 60 })
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

const identifyContent = (slug, articles, courses, stubs, talks, videos) => {
	const article = articles.nodes.find(article => article.slug === slug)
	const course = courses.nodes.find(course => course.slug === slug)
	const stub = stubs.nodes.find(stub => stub.slug === slug)
	const talk = talks.nodes.find(talk => talk.slug === slug)
	const video = videos.nodes.find(video => video.slug === slug)

	if (article) return article.content.html
	if (course) return course.content.html
	if (stub) return stub.content.html
	if (talk) return talk.content.html
	if (video) {
		let videoUrl = videoData.videos
			.find(v => v.slug === video.videoSlug)
			// HTML encode the video URL
			.url.replace("&", "&#x26;")
		return video.content.html + `<p><a href="${videoUrl}">Watch the video.</a></p>`
	}

	throw new Error("No content found for " + slug)
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

const insertCourseDetails = (content, courses) =>
	content.replace(
		/<coursedetails[^>]*slug="([^"]*)"[^>]*>\n*<\/coursedetails>/g,
		replaceCourseDetails(courses)
	)

const replaceCourseDetails = courses => (tag, slug) => {
	const course = courses.nodes.find(course => course.slug === slug)
	return `<dl>
		<dt>Audience:</dt><dd>${course.audience}</dd>
		<dt>Prerequisite:</dt><dd>${course.requirements}</dd>
		<dt>Length:</dt><dd>${course.length}</dd>
	</dl>`
}

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
	const url = contentImages.nodes.find(image => image.fields.id === slug).gatsbyImageData.images.fallback.src
	const alt = imageData.find(image => image.slug === slug)?.alt
	return `<img src="${site.siteMetadata.siteUrl + url}" alt=${alt}>`
}

const replaceContentVideo = (tag, slug) => {
	const videoUrl = videoData.videos.find(vid => vid.slug === slug).url
	return `<p><a href="${videoUrl}">Embedded video.</a></p>`
}

module.exports = feed

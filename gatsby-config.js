const videoData = require("./content/meta/videos.json")

module.exports = {
	siteMetadata: {
		title: `nipafx`,
		description: `You. Me. Java.`,
		siteUrl: `https://nipafx.dev`,
		author: `Nicolai Parlog`,
		twitter: `@nipafx`,
	},
	plugins: [
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `src-images`,
				path: `${__dirname}/src/images`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `articles`,
				path: `${__dirname}/content/articles`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `channels`,
				path: `${__dirname}/content/channels`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `courses`,
				path: `${__dirname}/content/courses`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `meta`,
				path: `${__dirname}/content/meta/`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `pages`,
				path: `${__dirname}/content/pages/`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `stubs`,
				path: `${__dirname}/content/stubs`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `repos`,
				path: `${__dirname}/content/repos`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `snippets`,
				path: `${__dirname}/content/snippets`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `tags`,
				path: `${__dirname}/content/tags`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `talks`,
				path: `${__dirname}/content/talks`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `videos`,
				path: `${__dirname}/content/videos`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `event-logos`,
				path: `${__dirname}/images/events`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `content-images`,
				path: `${__dirname}/images/content`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `video-thumbnail-images`,
				path: `${__dirname}/images/video-thumbnails`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `article-title-images`,
				path: `${__dirname}/images/title-articles`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `course-title-images`,
				path: `${__dirname}/images/title-courses`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `page-title-images`,
				path: `${__dirname}/images/title-pages`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `talk-title-images`,
				path: `${__dirname}/images/title-talks`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `video-title-images`,
				path: `${__dirname}/images/title-videos`,
			},
		},
		{
			resolve: `gatsby-transformer-json`,
		},
		{
			resolve: `gatsby-plugin-favicon`,
			options: {
				logo: "./src/images/favicon.png",
				background: "#262429",
				theme_color: "#69ea7d",
			},
		},
		{
			resolve: "gatsby-plugin-react-svg",
			options: {
				rule: {
					include: /src\/images/,
				},
			},
		},
		{
			resolve: `gatsby-plugin-sharp`,
		},
		{
			resolve: `gatsby-transformer-sharp`,
		},
		{
			resolve: `gatsby-transformer-remark`,
			options: {
				plugins: [
					{
						resolve: `gatsby-remark-promote-tags`,
						options: {
							tags: [
								"admonition",
								"calendar",
								"contentimage",
								"contentvideo",
								"coursedetails",
								"postlist",
								"pullquote",
								"repolist",
								"snippet",
							],
						},
					},
					{
						// use before prismjs (https://www.gatsbyjs.org/packages/gatsby-remark-autolink-headers/#how-to-use)
						resolve: "gatsby-remark-autolink-headers",
						options: {
							// same icon is used in `headings.js`
							icon: `▚`,
							// for no apparent reason, the resulting HTML does not include this class
							// (or, for that matter, the aria tag that the plugin adds)
							// even though the `props` passed to `headings.js` contains
							// a react component with the right properties
							className: `header-id-link`,
							removeAccents: true,
							enableCustomId: true,
						},
					},
					{
						resolve: `gatsby-remark-add-inline-code-language`,
						options: {
							defaultInlineLanguage: "java",
							inlineCodeMarker: "§",
						},
					},
					{
						resolve: `gatsby-remark-prismjs`,
						options: {
							classPrefix: "language-",
							// This is used to allow setting a language for inline code
							// (i.e. single backticks) by creating a separator.
							inlineCodeMarker: "§",
							showLineNumbers: false,
							languageExtensions: [
								{
									extend: "java",
									definition: {
										// This setting overrides the existing keyword matcher; this is hence
										// a modified version of node_modules/prismjs/components/prism-java.js
										keyword: /\b(?:abstract|continue|for|new|switch|assert|default|goto|package|synchronized|boolean|do|if|private|this|break|double|implements|protected|throw|byte|else|import|public|throws|case|enum|instanceof|return|transient|catch|extends|int|short|try|char|final|interface|static|void|class|finally|long|strictfp|volatile|const|float|native|super|while|var|null|exports|module|open|opens|provides|requires|to|transitive|uses|with|record)\b/,
									},
								},
							],
						},
					},
					{
						resolve: `gatsby-remark-site-specific`,
					},
				],
			},
		},
		{
			// pull in FontAwesome CSS during build
			// https://medium.com/@johnny02/how-to-add-font-awesome-to-a-gatsby-site-89da940924d5
			resolve: "gatsby-plugin-fontawesome-css",
		},
		{
			resolve: "gatsby-plugin-react-helmet",
		},
		{
			resolve: "gatsby-plugin-matomo",
			options: {
				siteId: "1",
				matomoUrl: "https://matomo.nipafx.dev",
				siteUrl: "https://nipafx.dev",
				disableCookies: true,
				// activate to run on localhost (and turn off do-not-track)
				// dev: true,
			},
		},
		{
			resolve: `gatsby-plugin-feed`,
			options: {
				query: `
				{
					site {
						siteMetadata {
							title
							description
							siteUrl
							author
						}
					}
				}
				`,
				feeds: [
					// see "rss" module for documentation on the settings:
					// https://www.npmjs.com/package/rss#usage
					{
						setup: ({ query: { site } }) => {
							return {
								title: site.siteMetadata.title,
								description: site.siteMetadata.description,
								generator: `Gatsby using "gatsby-plugin-feed" using "rss" (node module)`,
								feed_url: `${site.siteMetadata.siteUrl}/feed.xml`,
								site_url: site.siteMetadata.siteUrl,
								image_url: `${site.siteMetadata.siteUrl}/logo-bg.png`,
								managingEditor: site.siteMetadata.author,
								webMaster: site.siteMetadata.author,
								copyright: `Mostly CC-BY-NC 4.0 for words and Apache 2.0 for code - for details check ${site.siteMetadata.siteUrl}/license`,
								language: "en-us",
								categories: ["java", "software-development", "programming"],
								pubDate: new Date(),
							}
						},
						serialize: ({ query: { site, posts, articles, videos } }) =>
							posts.nodes.map(post => {
								const item = {
									title: post.title,
									description: post.description,
									url: `${site.siteMetadata.siteUrl}/${post.slug}`,
									guid: `${site.siteMetadata.siteUrl}/${post.slug}`,
									categories: post.tags,
									author: site.siteMetadata.author,
									date: post.date,
								}

								let content = null
								const article = articles.nodes.find(
									article => article.slug === post.slug
								)
								const video = videos.nodes.find(video => video.slug === post.slug)
								if (article) content = article.content.html
								else if (video) {
									const videoInfo = videoData.videos.find(
										v => v.slug === video.videoSlug
									)
									if (!videoInfo)
										throw new Error(`Can't find URL of ${videoSlug}.`)
									content = `${video.content.html}<p><a href="${videoInfo.url}">Watch the video.</a></p>`
								}

								if (content) item.custom_elements = [{ "content:encoded": content }]
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
							}
							`,
						output: "/feed.xml",
						// `setup` (see above) overrides this, but without `title`,
						// the plugin logs a warning during the build
						title: "nipafx",
					},
				],
			},
		},
		{
			resolve: `gatsby-plugin-manifest`,
			options: {
				name: `nipafx.dev - You. Me. Java.`,
				short_name: `nipafx.dev`,
				description: `Website of Nicolai (aka nipafx), a Java enthusiast with a passion for learning and sharing, online and offline`,
				start_url: `/`,
				background_color: `#262429`,
				theme_color: `#69ea7d`,
				// `icons` set by gatsby-plugin-favicon
				display: `minimal-ui`,
				categories: [`software`, `development`, `programming`, `java`],
				lang: `en-US`,
			},
		},
		{
			resolve: `gatsby-plugin-netlify`,
		},
	],
	mapping: {
		// NOTE: don't declare the fields on the left-hand side in the schema in `gatsby-node`
		"Article.repo": `Repo.slug`,
		"Post.repo": `Repo.slug`,
		"Stub.repo": `Repo.slug`,
		"Talk.repo": `Repo.slug`,
		"Video.repo": `Repo.slug`,
		"Tag.series": `Post.slug`,
	},
}

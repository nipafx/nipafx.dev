module.exports = {
	siteMetadata: {
		title: `nipafx`,
		description: `You. Me. Java.`,
		siteUrl: `https://nipafx.dev`,
		author: `Nicolai Parlog`,
		twitter: `@nipafx`
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
				name: `content-images`,
				path: `${__dirname}/content/images`,
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
				name: `repos`,
				path: `${__dirname}/content/repos`,
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
				name: `videos`,
				path: `${__dirname}/content/videos`,
			},
		},
		{
			resolve: `gatsby-transformer-json`,
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
							tags: ["series-list", "pullimage", "pullquote"],
						},
					},
					{
						// use before prismjs (https://www.gatsbyjs.org/packages/gatsby-remark-autolink-headers/#how-to-use)
						resolve: "gatsby-remark-autolink-headers",
						options: {
							icon: `▚`,
							// for no apparent reason, the resulting HTML does not include this class
							// (or, for that matter, the aria tag that the plugin adds)
							className: `header-id-link`,
							removeAccents: true,
							enableCustomId: true,
						},
					},
					{
						resolve: `gatsby-remark-add-inline-code-language`,
						options: {
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
								// TODO: add logo as `image_url`
								managingEditor: site.siteMetadata.author,
								webMaster: site.siteMetadata.author,
								// TODO add `copyright` notice
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

								const article = articles.nodes.find(
									article => article.slug === post.slug
								)
								const video = videos.nodes.find(video => video.slug === post.slug)
								const content = article
									? article.content.html
									: video
									? `<p><a href="${video.url}">Watch the video.</a></p>${video.content.html}`
									: null
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
										url
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
	],
	mapping: {
		"Article.repo": `Repo.slug`,
		"Video.repo": `Repo.slug`,
	},
}

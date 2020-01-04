module.exports = {
	siteMetadata: {
		title: `blog.nipafx.org`,
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
				name: `tags`,
				path: `${__dirname}/content/tags`,
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
							tags: ["series-list", "pullquote"],
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
							// This lets you set up language aliases.  For example,
							// setting this to '{ sh: "bash" }' will let you use
							// the language "sh" which will highlight using the
							// bash highlighter.
							aliases: {},
							showLineNumbers: false,
						},
					},
					{
						resolve: `gatsby-remark-site-specific`,
					},
				],
			},
		},
	],
}

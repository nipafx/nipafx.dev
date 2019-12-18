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
				name: `posts`,
				path: `${__dirname}/content/posts`,
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
						resolve: `gatsby-remark-add-inline-code-language`,
						options: {
							inlineCodeMarker: "§",
						}
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
				],
			},
		},
	],
}

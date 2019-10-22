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
			resolve: `gatsby-transformer-asciidoc`,
		},
	],
}

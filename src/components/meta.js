import React from "react"
import Helmet from "react-helmet"

import { graphql, useStaticQuery } from "gatsby"

const Meta = ({ title, slug, description, searchKeywords, videoUrl }) => {
	const data = useStaticQuery(
		graphql`
			query {
				site {
					siteMetadata {
						title
						description
						siteUrl
						twitter
					}
				}
			}
		`
	)

	const site = data.site.siteMetadata
	const siteName = `${site.title} // ${site.description}`
	const pageTitle = title ? `${title} // ${site.title}` : siteName
	const pageDescription = description || site.description
	const pageUrl = `${site.siteUrl}/${slug}`
	// TODO: image
	const pageImage = null
	const pageImageAlt = null

	if (pageTitle.length > 60) console.warn("Long title: ", slug)
	if (pageDescription.length > 180) console.warn("Long description: ", slug)

	const meta = {
		// TODO: remove before publication
		robots: "noindex",
		// Google
		description,
		// yes, it's useless for search engines, but it's documentation what I'm aiming for
		// and it helps other tools judge the SEO quality
		keywords: searchKeywords,
		// Twitter
		"twitter:card": videoUrl ? "player" : pageImage ? "summary_large_image" : "summary",
		"twitter:site": site.twitter,
		"twitter:creator": site.twitter,
		"twitter:title": pageTitle,
		"twitter:description": pageDescription,
		"twitter:image": pageImage,
		"twitter:image:alt": pageImageAlt,
		"twitter:player": videoUrl,
		"twitter:player:width": videoUrl ? 1280 : null,
		"twitter:player:height": videoUrl ? 720 : null,
		// Open Graph
		"og:title": pageTitle,
		"og:type": "article",
		"og:image": pageImage,
		"og:url": pageUrl,
		"og:description": pageDescription,
		"og:site_name": siteName,
		"og:video": videoUrl,
	}

	return (
		<Helmet>
			<title key="title">{pageTitle}</title>
			{/* "charset" and "viewport" are defined in html.js */}
			{Object.getOwnPropertyNames(meta)
				.map(prop => [prop, meta[prop]])
				// don't create keys with undefined values
				.filter(([key, value]) => value)
				.map(([key, value]) => (
					<meta key={key} name={key} content={value} />
				))}
		</Helmet>
	)
}

export default Meta

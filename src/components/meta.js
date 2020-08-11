import React from "react"
import Helmet from "react-helmet"

import { graphql, useStaticQuery } from "gatsby"

const Meta = ({ title, slug, canonicalUrl, description, searchKeywords, videoUrl }) => {
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
	// because pages are reachable with and without trailing slash
	// (which Google treats as two different pages), the canonical URL
	// has to be used to identify one of them as the... well, canonical URL
	const pageCanonicalUrl = canonicalUrl || pageUrl
	// TODO: image
	const pageImage = null
	const pageImageAlt = null

	if (pageTitle.length > 60) console.warn("Long title: ", slug)
	if (pageDescription.length > 180) console.warn("Long description: ", slug)

	const links = {
		canonical: pageCanonicalUrl,
	}

	const metaNames = {
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
	}

	const metaProperties = {
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
			{propertiesOf(links).map(([key, value]) => (
				<link key={key} rel={key} href={value} />
			))}
			{propertiesOf(metaNames).map(([key, value]) => (
				<meta key={key} name={key} content={value} />
			))}
			{propertiesOf(metaProperties).map(([key, value]) => (
				<meta key={key} property={key} content={value} />
			))}
		</Helmet>
	)
}

const propertiesOf = object =>
	Object.getOwnPropertyNames(object)
		.map(prop => [prop, object[prop]])
		// filter out pairs with undefined values
		.filter(([key, value]) => value)

export default Meta

import { graphql, useStaticQuery } from "gatsby"

export const stub = slug => {
	const stub = stubsAndTags().stubs.nodes.find(stub => stub.slug === slug)
	if (!stub) throw Error("Unknown stub: " + stub)

	const meta = {
		title: stub.title,
		slug: stub.slug,
		image: stub.featuredImage,
		description: stub.description,
		searchKeywords: stub.searchKeywords,
	}
	const header = {
		title: stub.title,
		date: stub.date,
		channel: stub.channel,
		tags: stub.tags,
		intro: stub.intro ?? stub.description,
		featuredImage: stub.featuredImage,
	}
	const content = {
		title: stub.title,
		slug: stub.slug,
		channel: stub.channel,
		description: stub.description,
		toc: processTableOfContents(stub.content.tableOfContents),
		series: detectSeries(stub.slug),
		source: detectSource(stub.repo, stub.source),
		htmlAst: stub.content.htmlAst,
	}

	return { meta, header, content }
}

export default stub

export const processTableOfContents = toc =>
	toc
		.replace(/"/g, `'`)
		.replace(/<a href='[^#"]*(#[^']*)'>(.*)<\/a>/g, `<a href="$1" title="$2">$2<\/a>`)
		.replace(/<p>|<\/p>/g, "")
		// the Remark-generated ToC contains line-breaks, some of which Firefox
		// displays as a whitespace where there shouldn't be one
		// (e.g. before <li>s that contain a <ul>)
		.replace(/\n/g, ``)

export const detectSeries = slug => {
	// prettier-ignore
	const seriesTags = stubsAndTags()
		.tags.nodes
		.filter(tag => tag.series)
		.filter(tag =>
			tag.series
				// `null` post is allowed to indicate an ongoing series
				.filter(post => post)
				.map(post => post.slug)
				.includes(slug)
		)

	if (seriesTags.length === 0) return null
	// I assume each post can only be part of at most one series - hence `seriesTags[0]`
	const series = seriesTags[0]
	const description = series.seriesDescription
	// `null` post is allowed to indicate an ongoing series
	const ongoing = series.series.includes(null)
	const posts = series.series
		.filter(post => post)
		.map(post => (post.slug === slug ? { ...post, current: true } : post))
	return { description, posts, ongoing }
}

export const detectSource = (repo, source) => (repo ?? source ? { repo, text: source } : undefined)

const stubsAndTags = () =>
	useStaticQuery(graphql`
		{
			stubs: allStub {
				nodes {
					title
					slug
					date
					channel
					tags
					description
					intro
					searchKeywords
					featuredImage
					repo {
						url
						title
						type
						description
						restrictive
					}
					source
					content {
						htmlAst
						tableOfContents(pathToSlugField: "frontmatter.slug")
					}
				}
			}
			tags: allTag {
				nodes {
					title
					slug
					series {
						title
						slug
					}
					seriesDescription
				}
			}
		}
	`)

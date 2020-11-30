import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import BackgroundImage from "gatsby-background-image"

import { classNames } from "../infra/functions"

import { Channel, tagletText } from "./taglet"
import FormattedDate from "./formattedDate"
import Link from "./link"

import style from "./postCard.module.css"
import tagletStyle from "./taglet.module.css"

const PostCard = ({ slug, className }) => {
	const { title, date, channel, tags, description, featuredImage } = getPost(slug)
	return (
		<BackgroundImage
			data-channel={channel}
			data-tags={tags}
			{...classNames(style.card, style.image, channel, className)}
			fluid={featuredImage.fluid}
		>
			<Link to={slug} className={style.content}>
				<div className={style.details}>
					<div className={style.top}>
						<span className={style.title} dangerouslySetInnerHTML={{ __html: title }} />
						<Channel channel={channel} colorize className={style.channel} />
						{/* it would be clearer to use <Tag>s instead of concatenating strings and
						    applying the correct style, but that requires more DOM nodes */}
						<span {...classNames(tagletStyle.taglet, style.tags)}>
							{tags.map(tagletText).join(" ")}
						</span>
					</div>
					<p className={style.description}>
						<span dangerouslySetInnerHTML={{ __html: description }} />
						<FormattedDate date={date} className={style.date} />
					</p>
				</div>
			</Link>
		</BackgroundImage>
	)
}

const getPost = slug => {
	const { posts } = useStaticQuery(graphql`
		query {
			posts: allPost {
				nodes {
					title
					slug
					date
					channel
					tags
					description
					featuredImage {
						fluid(
							maxWidth: 800
							base64Width: 10
							srcSetBreakpoints: [800, 1600]
							toFormat: JPG
							jpegQuality: 40
						) {
							...GatsbyImageSharpFluid
						}
					}
				}
			}
		}
	`)
	return posts.nodes.find(node => node.slug === slug)
}

export default PostCard

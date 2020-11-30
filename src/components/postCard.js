import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import BackgroundImage from "gatsby-background-image"

import { classNames } from "../infra/functions"

import { Channel, Tag } from "./taglet"
import FormattedDate from "./formattedDate"
import Link from "./link"

import style from "./postCard.module.css"

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
						<span className={style.channel}>
							<Channel channel={channel} colorize />
						</span>
						<span className={style.tags}>
							{tags.map(tag => (
								<Tag key={tag} tag={tag} />
							))}
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

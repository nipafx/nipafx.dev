import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import BackgroundImage from "gatsby-background-image"

import { classNames } from "../infra/functions"

import { Channel, Tag } from "./tag"
import FormattedDate from "./formattedDate"
import Link from "./link"

import style from "./postCard.module.css"

const PostCard = ({ slug, className }) => {
	const { title, date, channel, tags, description, image } = getPost(slug)
	return (
		<div {...classNames(style.card, channel, className)}>
			<Link to={slug}>
				<ImageCard image={image}>
					<div className={style.content}>
						<div className={style.cover} />
						<div className={style.details}>
							<div className={style.top}>
								<span className={style.title}>{title}</span>
								<span className={style.channel}>
									<Channel channel={channel} />
								</span>
								<span className={style.tags}>
									{tags.map(tag => (
										<Tag key={tag} tag={tag} />
									))}
								</span>
							</div>
							<p className={style.description}>
								{description}
								<span className={style.date}>
									<FormattedDate date={date} />
								</span>
							</p>
						</div>
					</div>
				</ImageCard>
			</Link>
		</div>
	)
}

const ImageCard = ({ image, children }) => {
	if (image)
		return (
			<BackgroundImage fluid={image.fluid} className={style.image}>
				{children}
			</BackgroundImage>
		)
	else return <div id={style.image}>{children}</div>
}

const getPost = slug => {
	// TODO it looks like the 400px image is never used - why not?
	const { posts, images } = useStaticQuery(graphql`
		query {
			posts: allPost {
				nodes {
					title
					slug
					date
					channel
					tags
					description
					featuredImage
				}
			}
			images: allImageSharp(
				filter: {
					fields: {
						collection: {
							in: ["article-title-images", "page-title-images", "video-title-images"]
						}
					}
				}
			) {
				nodes {
					fields {
						id
					}
					fluid(maxWidth: 800, srcSetBreakpoints: [400, 800], toFormat: JPG, jpegQuality: 40) {
						...GatsbyImageSharpFluid
					}
				}
			}
		}
	`)
	const post = posts.nodes.find(node => node.slug === slug)
	post.image = images.nodes.find(node => node.fields.id === post.featuredImage)
	return post
}

export default PostCard

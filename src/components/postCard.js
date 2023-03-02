import React from "react"
import { GatsbyImage } from "gatsby-plugin-image"

import { classNames } from "../infra/functions"

import { Channel, tagletText } from "./taglet"
import FormattedDate from "./formattedDate"
import Link from "./link"

import * as style from "./postCard.module.css"
import * as tagletStyle from "./taglet.module.css"

const PostCard = ({ title, slug, date, channel, tags, description, featuredImage, className }) => {
	return (
		<div
			data-channel={channel}
			data-tags={tags}
			{...classNames(style.card, channel, className)}
		>
			<GatsbyImage className={style.image} alt={`Image with slug ${slug}`} image={featuredImage.gatsbyImageData} />
			<Link to={slug} className={style.content}>
				<div className={style.top}>
					<span className={style.title} dangerouslySetInnerHTML={{ __html: title }} />
					<Channel channel={channel} colorize className={style.channel} />
					{/* it would be clearer to use <Tag>s instead of concatenating strings and
					applying the correct style, but that requires more DOM nodes */}
					<span {...classNames(tagletStyle.taglet, style.tags)}>
						{tags.map(tagletText).join(" ")}
					</span>
				</div>
				<span
					{...classNames(style.bottom, style.description)}
					dangerouslySetInnerHTML={{ __html: description }}
				/>
				<FormattedDate date={date} {...classNames(style.bottom, style.date)} />
			</Link>
		</div>
	)
}

export default PostCard

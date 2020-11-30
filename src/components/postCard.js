import React from "react"
import BackgroundImage from "gatsby-background-image"

import { classNames } from "../infra/functions"

import { Channel, tagletText } from "./taglet"
import FormattedDate from "./formattedDate"
import Link from "./link"

import style from "./postCard.module.css"
import tagletStyle from "./taglet.module.css"

const PostCard = ({ title, slug, date, channel, tags, description, featuredImage, className }) => {
	return (
		<BackgroundImage
			data-channel={channel}
			data-tags={tags}
			{...classNames(style.card, channel, className)}
			fluid={featuredImage.fluid}
		>
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
				<p className={style.description}>
					<span dangerouslySetInnerHTML={{ __html: description }} />
					<FormattedDate date={date} className={style.date} />
				</p>
			</Link>
		</BackgroundImage>
	)
}

export default PostCard

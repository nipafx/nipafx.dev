import React from "react"
import BackgroundImage from "gatsby-background-image"

import { classNames } from "../infra/functions"

import { Channel, tagletText } from "./taglet"
import FormattedDate from "./formattedDate"
import Link from "./link"

import * as style from "./postCard.module.css"
import * as tagletStyle from "./taglet.module.css"

const PostCard = ({ title, slug, date, channel, tags, description, featuredImage, className }) => {
	return (
		// without this outer div, there's a problem with filtering:
		// when on a post page and you click a tag, the landing page will show
		// and URL and filter highlighting are correct, but all posts are shown
		// (I assume it has something to do with how <BackgroundImage> handles
		// CSS classes, but I don't know for sure)
		<div
			data-channel={channel}
			data-tags={tags}
			{...classNames(style.card, channel, className)}
		>
			<BackgroundImage fluid={featuredImage.fluid} className={style.image}>
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
			</BackgroundImage>
		</div>
	)
}

export default PostCard

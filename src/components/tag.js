import React from "react"

import { classNames } from "../infra/functions"

import Link from "./link"

import style from "./tag.module.css"

export const Tag = ({ tag, link, className }) => {
	className = className || ""
	return (
		<span {...classNames(className, style.tag)}>
			{link ? <Link to={tag}>#{tag}</Link> : `#${tag}`}
		</span>
	)
}

export const Channel = ({ channel, link, className }) => {
	className = className || ""
	const name = channelName(channel)
	const slug = channelSlug(channel)
	return (
		<span {...classNames(className, style.channel)}>
			{link ? <Link to={slug}>#{name}</Link> : `#${name}`}
		</span>
	)
}

const channelName = channel => {
	switch (channel) {
		case "articles": return "blog-post"
		case "pages": return "page"
		case "videos": return "video"
	}
}

const channelSlug = channel => {
	switch (channel) {
		case "articles": return "/posts"
		case "pages": return "/pages"
		case "videos": return "/videos"
	}
}

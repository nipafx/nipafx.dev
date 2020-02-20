import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import { classNames, tagletsFromPath } from "../infra/functions"

import Link from "./link"

import style from "./tag.module.css"

export const Tag = ({ tag, link, uplink, className }) => {
	// replace hyphen with non-breaking hyphen
	const tagText = tag === "all" ? "ALL-TAGS" : tag.replace("-", "‑")
	return (
		<span data-tag={tag} {...classNames(className, style.tag)}>
			{uplink ? (
				<Link to={tag} onClick={event => handleClick("tag", tag, event)}>
					#{tagText}
				</Link>
			) : link ? (
				<Link to={tag}>#{tagText}</Link>
			) : (
				`#${tagText}`
			)}
		</span>
	)
}

export const Channel = ({ channel, plural, link, uplink, colorize, className }) => {
	const classes = [style.channel]
	if (colorize) classes.push(style.colorize)
	if (className) classes.push(className)

	const { singularName, pluralName, slug } = channelInfo(channel)
	const name = plural ? pluralName : singularName
	return (
		<span data-channel={channel} {...classNames(...classes)}>
			{uplink ? (
				<Link to={slug} onClick={event => handleClick("channel", channel, event)}>
					#{name}
				</Link>
			) : link ? (
				<Link to={slug}>#{name}</Link>
			) : (
				`#${name}`
			)}
		</span>
	)
}

const handleClick = (kind, taglet, event) => {
	event.preventDefault()
	tagletsFromPath()
		.toggleSelection(kind, taglet)
		.writePath()
}

const channelInfo = channel =>
	channel === "all"
		? {
				singularName: "ALL",
				pluralName: "ALL-CHANNELS",
				slug: "/",
		  }
		: useStaticQuery(graphql`
				query {
					channels: allChannel {
						nodes {
							internalName
							singularName
							pluralName
							slug
						}
					}
				}
		  `).channels.nodes.find(node => node.internalName === channel)

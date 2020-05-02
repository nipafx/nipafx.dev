import React, { useState, useLayoutEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"

import { classNames, tagletsFromPath, tagletPath } from "../infra/functions"

import Link from "./link"

import style from "./tag.module.css"

export const Tag = ({ tag, mode, className }) => {
	const { link, forward, onClick } = detectMode(mode, "tag", tag)

	const id = ("tag-" + tag + "-" + Math.random()).replace("0.", "")
	// replace hyphen with non-breaking hyphen
	const text = tag === "all" ? "ALL‑TAGS" : tag.replace("-", "‑")

	return (
		<span id={id} data-tag={tag} {...classNames(className, style.tag)}>
			{taglet(text, link, forward, onClick)}
		</span>
	)
}

export const Channel = ({ channel, plural, mode, colorize, className }) => {
	let { link, forward, onClick } = detectMode(mode, "channel", channel)
	const { singularName, pluralName, slug } = channelInfo(channel)
	if (link) link = slug

	const id = ("channel-" + channel + "-" + Math.random()).replace("0.", "")
	const text = plural ? pluralName : singularName

	const classes = [style.channel]
	if (colorize) classes.push(style.colorize)
	if (className) classes.push(className)

	return (
		<span id={id} data-channel={channel} {...classNames(...classes)}>
			{taglet(text, link, forward, onClick)}
		</span>
	)
}

const taglet = (text, link, forward, onClick) => {
	const [jsEnabled, setJsEnabled] = useState(false)
	useLayoutEffect(() => {
		setJsEnabled(true)
	}, [])
	return link ? (
		<Link to={jsEnabled ? forward : link} onClick={onClick}>
			#{text}
		</Link>
	) : (
		`#${text}`
	)
}

const detectMode = (mode, kind, taglet) => {
	mode = mode || "text"
	return {
		link: mode === "text" ? null : taglet,
		forward: ["forward", "uplink"].includes(mode) ? tagletPath(kind, taglet) : null,
		onClick: mode === "uplink" ? event => handleClick(kind, taglet, event) : null,
	}
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

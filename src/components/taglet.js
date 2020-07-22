import React, { useState, useLayoutEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"

import {
	classNames,
	tagletsFromPath,
	emptyTaglets,
	tagletPath,
	tagletsPath,
} from "../infra/functions"

import Link from "./link"

import style from "./taglet.module.css"

export const Tag = ({ tag, mode, className }) => {
	const { link, forward, onClick } = detectMode(mode, "tag", tag)

	const id = ("tag-" + tag + "-" + Math.random()).replace("0.", "")
	// replace hyphen with non-breaking hyphen
	const text = tag === "all" ? "ALL‑TAGS" : tag.replace("-", "‑")

	return (
		<span id={id} data-tag={tag} {...classNames(className, style.taglet)}>
			{taglet(text, link, forward, onClick)}
		</span>
	)
}

export const Channel = ({ channel, plural, mode, colorize, className }) => {
	let { link, forward, onClick } = detectMode(mode, "channel", channel)
	const { singularName, pluralName, slug } = channelInfo(channel)
	if (link) link = slug

	const id = ("channel-" + channel + "-" + Math.random()).replace("0.", "")
	// replace hyphen with non-breaking hyphen
	const text = (plural ? pluralName : singularName).replace("-", "‑")

	const classes = [style.taglet]
	if (colorize) classes.push(style.colorize)
	if (className) classes.push(className)

	return (
		<span id={id} data-channel={channel} {...classNames(...classes)}>
			{taglet(text, link, forward, onClick)}
		</span>
	)
}

export const MenuTag = ({ channel, tag, onIndexPage, className }) => {
	const id = (
		"channel-" +
		channel +
		"-" +
		Math.random() +
		"-tag-" +
		tag +
		"-" +
		Math.random()
	).replace("0.", "")

	const text = tag
	const mode = onIndexPage ? "overlink" : "forward"
	const { link, forward, onClick } = detectMode(mode, "tag", tag, channel)

	return (
		<span id={id} data-tag={tag} {...classNames(className, style.taglet)}>
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

/*
 * Modes:
 *  - text: there's just text, no link
 *  - forward: link to index page (with hash) instead of a dedicated page
 *  - uplink: update the hash (i.e. read existing and toggle selection) instead of linking to a different page
 *  - overlink: set the hash (i.e. overwrite existing hash) instead of linking to a different page
 */
const detectMode = (mode, kind, taglet, otherTaglet) => {
	mode = mode || "text"
	return {
		link: mode === "text" ? null : taglet,
		forward:
			mode === "forward" || mode === "uplink"
				? tagletPath(kind, taglet)
				: mode === "overlink"
				? tagletsPath(otherTaglet, taglet)
				: null,
		onClick:
			mode === "uplink"
				? event => updatePath(kind, taglet, event)
				: mode === "overlink"
				? event => overridePath(otherTaglet, taglet, event)
				: null,
	}
}

const updatePath = (kind, taglet, event) => {
	event.preventDefault()
	tagletsFromPath()
		.toggleSelection(kind, taglet)
		.writePath()
}

const overridePath = (channel, tag, event) => {
	event.preventDefault()
	emptyTaglets()
		.toggleSelection("channel", channel)
		.toggleSelection("tag", tag)
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

import React from "react"

import { classNames } from "../infra/functions"

import Link from "./link"

import style from "./channelLinks.module.css"

import json from "../../content/meta/channel-links.json"

const ChannelLinks = ({ className }) => (
	<div {...classNames(className, style.container)}>{json.links.map(channelLink)}</div>
)

const channelLink = ({ title, url, className }) => (
	<span key={url}>
		<Link to={url} className={className}>
			{title}
		</Link>
	</span>
)

export default ChannelLinks

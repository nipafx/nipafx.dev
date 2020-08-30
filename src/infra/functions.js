import React from "react"

export function flatten(nodes) {
	return React.Children.toArray(nodes).reduce((flatChildren, child) => {
		if (child.type === React.Fragment) {
			return flatChildren.concat(flatten(child.props.children))
		}
		flatChildren.push(child)
		return flatChildren
	}, [])
}

export function classNames() {
	const className = Array.prototype.slice
		.call(arguments)
		.filter(cls => cls !== undefined && cls !== null && cls !== "")
		.join(" ")
	return className ? { className } : null
}

export function processTableOfContents(toc) {
	return (
		toc
			.replace(/"/g, `'`)
			.replace(/<a href='[^#"]*(#[^']*)'>(.*)<\/a>/g, `<a href="$1" title="$2">$2<\/a>`)
			.replace(/<p>|<\/p>/g, "")
			// the Remark-generated ToC contains line-breaks, some of which Firefox
			// displays as a whitespace where there shouldn't be one
			// (e.g. before <li>s that contain a <ul>)
			.replace(/\n/g, ``)
	)
}

export function tagletPath(kind, taglet) {
	if (kind === "tag") return taglet === "all" ? "/" : `/#tags~~${taglet}`
	if (kind === "channel") return taglet === "all" ? "/" : `/#channels~~${taglet}`
	throw new Error("Unknown kind: " + kind)
}

export function tagletsPath(channel, tag) {
	if (!channel && !tag) return ``
	const path = [`/#`]
	if (channel) path.push(`channels~~${channel}`)
	if (channel && tag) path.push(`~~~`)
	if (tag) path.push(`tags~~${tag}`)
	return path.join(``)
}

export function emptyTaglets() {
	return tagletsFrom(true, [], true, [])
}

export function tagletsFromPath() {
	const hash = (window.location.hash || "").replace("#", "")

	const allChannels = !hash.includes("channels~~")
	const allTags = !hash.includes("tags~~")
	const channels = allChannels
		? []
		: hash
				.replace("channels~~", "")
				.replace(/~~~tags~~.*/, "")
				.split("~")
	const tags = allTags
		? []
		: hash
				.replace(/channels~~.*~~~/, "")
				.replace("tags~~", "")
				.split("~")

	return tagletsFrom(allChannels, channels, allTags, tags)
}

function tagletsFrom(allChannels, channels, allTags, tags) {
	return {
		_channels: {
			all: allChannels,
			entries: channels,
		},

		_tags: {
			all: allTags,
			entries: tags,
		},

		isChannelSelected: function(channel) {
			return (
				(channel === "all" && this._channels.all) ||
				(channel !== "all" && this._channels.entries.includes(channel))
			)
		},

		isTagSelected: function(tag) {
			return (
				(tag === "all" && this._tags.all) ||
				(tag !== "all" && this._tags.entries.includes(tag))
			)
		},

		isChannelShown: function(channel) {
			return this._channels.all || this._channels.entries.includes(channel)
		},

		areTagsShown: function(tags) {
			return (
				this._tags.all || this._tags.entries.find(tag => tags.includes(tag)) !== undefined
			)
		},

		toggleSelection: function(kind, taglet) {
			const taglets = this[`_${kind}s`]
			if (taglet === "all") {
				taglets.all = true
				taglets.entries = []
			} else {
				const index = taglets.entries.indexOf(taglet)
				if (index >= 0) taglets.entries.splice(index, 1)
				else {
					taglets.entries.push(taglet)
					taglets.entries.sort()
				}
				taglets.all = taglets.entries.length === 0
			}
			return this
		},

		writePath: function() {
			const channelHash = this._channels.all
				? null
				: "channels~~" + this._channels.entries.join("~")
			const tagHash = this._tags.all ? null : "tags~~" + this._tags.entries.join("~")

			let hash = channelHash
			if (tagHash)
				if (hash) hash += "~~~" + tagHash
				else hash = tagHash

			if (hash) window.location.hash = hash
			else resetPath()
		},
	}
}

export function resetPath() {
	window.location.hash = ""
	// remove the hash from the URL that the previous line left behind
	window.history.pushState("", document.title, window.location.pathname + window.location.search)
}

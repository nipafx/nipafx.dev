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
	return {
		className: Array.prototype.slice
			.call(arguments)
			.filter(cls => cls !== undefined && cls !== null && cls !== "")
			.join(" "),
	}
}

export function tagletsFromHash() {
	const hash = (window.location.hash || "").replace("#", "")

	const allChannels = !hash.includes("channels__")
	const allTags = !hash.includes("tags__")
	const channels = allChannels
		? []
		: hash
				.replace("channels__", "")
				.replace(/___tags__.*/, "")
				.split("_")
	const tags = allTags
		? []
		: hash
				.replace(/channels__.*___/, "")
				.replace("tags__", "")
				.split("_")
	return {
		_channels: {
			all: allChannels,
			entries: channels,
		},

		_tags: {
			all: allTags,
			entries: tags,
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

		setToHash: function() {
			const channelHash = this._channels.all
				? null
				: "channels__" + this._channels.entries.join("_")
			const tagHash = this._tags.all ? null : "tags__" + this._tags.entries.join("_")

			let hash = channelHash
			if (tagHash)
				if (hash) hash += "___" + tagHash
				else hash = tagHash

			if (hash) window.location.hash = hash
			else {
				window.location.hash = ""
				// remove the hash from the URL that the previous line left behind
				window.history.pushState(
					"",
					document.title,
					window.location.pathname + window.location.search
				)
			}
		},
	}
}

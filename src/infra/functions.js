import React from "react"

/*
 * TAGLETS & HASH
 */

export function tagletsPath(channel, tag) {
	if (!channel && !tag) return `/`
	return `/#` + tagletsHash(false, channel ? [channel] : [], false, tag ? [tag] : [])
}

function tagletsHash(allChannels, channels, allTags, tags) {
	const channelPath =
		allChannels || channels.length === 0 ? null : "channels~~" + channels.join("~")
	const tagPath = allTags || tags.length === 0 ? null : "tags~~" + tags.join("~")

	if (channelPath && tagPath) return `${channelPath}~~~${tagPath}`
	if (channelPath) return channelPath
	if (tagPath) return tagPath
	return null
}

export function emptyTaglets() {
	return tagletsFrom(true, [], true, [])
}

export function tagletsFromPath() {
	// during server-side rendering to work, `window` is undefined, so check that first
	const hash = (typeof window === "undefined" ? "" : window.location.hash || "").replace("#", "")

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
			const hash = tagletsHash(
				this._channels.all,
				this._channels.entries,
				this._tags.all,
				this._tags.entries
			)

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

/*
 * JS(X)
 */

export function classNames() {
	// accept both varargs and arrays
	const args = Array.prototype.slice.call(arguments)
	const classes = args.length === 1 && Array.isArray(args[0]) ? args[0] : args

	const className = classes
		.filter(cls => cls !== undefined && cls !== null && cls !== "")
		.join(" ")
	return className ? { className } : null
}

export function arrayTo(length) {
	return [...Array(length).keys()]
}

/*
 * VIDEOS
 */

const youTubeVideoId = videoUrl => videoUrl.match(/.*youtube\.com\/watch\?v=([^&]*).*/)[1]
const youTubeVideoStart = videoUrl => {
	const timestampMatch = videoUrl.match(/.*youtube\.com\/watch\?v=.*t=([^&]*).*/)
	if (!timestampMatch) return null

	const timestamp = timestampMatch[1]
	const timeMatch = timestamp.match(/((\d+)h)?((\d+)m)?(\d*)s/)
	if (!timeMatch) throw new Error("Unknown timestamp format: " + timestamp)

	return {
		hours: timeMatch[2] || 0,
		minutes: timeMatch[4] || 0,
		seconds: timeMatch[5],
	}
}

export const videoEmbedUrl = videoUrl => {
	if (!videoUrl || !videoUrl.includes("youtube.com/watch?v=")) return undefined

	const start = youTubeVideoStart(videoUrl)
	const startParameter = start ? `?start=${start.hours * 3600 + start.minutes * 60 + start.seconds * 1}` : ``
	return `https://www.youtube.com/embed/${youTubeVideoId(videoUrl)}${startParameter}`
}

export const videoContentUrl = videoUrl => {
	if (!videoUrl || !videoUrl.includes("youtube.com/watch?v=")) return undefined

	return `https://youtube.com/get_video_info?video_id=${youTubeVideoId(videoUrl)}`
}

/*
 * MISC
 */

export function ordinalDay(day) {
	switch (day) {
		case 1:
			return `1st`
		case 2:
			return `2nd`
		case 3:
			return `3rd`
		case 21:
			return `21st`
		case 22:
			return `22nd`
		case 23:
			return `23rd`
		case 31:
			return `31st`
		// future proof!
		case 32:
			return `32nd`
		case 33:
			return `33rd`
		default:
			return day + "th"
	}
}

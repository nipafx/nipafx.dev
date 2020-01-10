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

function altColor(color) {
	return color ? `var(--${color}-color)` : `var(--alt-color)`
}

export function setAltColorVar(color) {
	return color ? { "--alt-color": `${altColor(color)}` } : null
}

export function classNames() {
	return {
		className: Array.prototype.slice
			.call(arguments)
			.filter(cls => cls !== undefined && cls !== null && cls !== "")
			.reduce((acc, cur) => `${acc} ${cur}`, ""),
	}
}

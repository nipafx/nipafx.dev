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

export function altColor(color) {
	return color
		? `var(--${color}-color)`
		: `var(--alt-color)`
}

export function setAltColorVar(color) {
	return color
		? { "--alt-color": `${altColor(color)}` }
		: null
}

export function classes() {
	return Array.prototype.slice.call(arguments).reduce((acc, cur) => `${acc} ${cur}`)
}

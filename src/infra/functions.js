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
			.join(" ")
	}
}

import React from "react"

import Link from "./link"

const Feedback = ({ className }) => {
	return (
		<div key="feedback" className={className}>
			I've build this website myself and while I'm very proud of my digital baby, I know it's
			far from perfect. If you observe any bugs or have an idea for a cool feature, please{" "}
			<Link to="https://github.com/nipafx/nipafx.dev/issues">open an issue</Link>. I
			appreciate it!
		</div>
	)
}

export default Feedback

import React from "react"

import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import Site from "../layout/site"
import Link from "../components/link"

import layout from "../layout/container.module.css"

const FourOhFourPage = () => (
	<Site
		className="article"
		meta={{
			title: "404",
			slug: "404",
			description: "Damn, that didn't go as planned. 🤕",
		}}
	>
		<main>
			<section id={PROGRESS_BAR_REFERENCE} className={layout.textContainer}>
				<h1>404</h1>
				<p>Damn, that didn't go as planned. 🤕</p>
				<p>
					I'm terribly sorry this happened and I really hope you can find what you're
					looking for - on this blog, but also in life. It's not easy to achieve your
					goals and broken sites throwing a wrench into your daily business aren't exactly
					helping.
				</p>
				<p>
					But look at the bright side: You're out and about learning about Java and that's
					pretty cool! I'd love to help you with that as much as I can: If you
					<Link to="contact">reach out to me</Link> and let me know what you were looking
					for, I'll find it and get back to you ASAP.
				</p>
			</section>
		</main>
	</Site>
)

export default FourOhFourPage

import React from "react"

import ContentVideo from "../components/contentVideo"
import { H2 } from "../components/headings"
import Iframe from "../components/iframe"
import Link from "../components/link"
import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { PostHeader } from "../components/header"
import PostContent from "../components/postContent"
import PostEnd from "../components/postEnd"
import PresentationList from "../components/presentationList"

import layout from "../layout/container.module.css"

const TalkLayout = ({title, slug, date, tags, description, intro, featuredImage, slides, videoSlug, source, htmlAst}) => {
	return (
		<main>
			<section id={PROGRESS_BAR_REFERENCE}>
				<PostHeader {...{ title, channel: "talks", date, tags, intro, featuredImage }} />
				<PostContent {...{ title, slug, channel: "talks", description, source, htmlAst }}>
					{slides && (
						<React.Fragment>
							<H2 id="slides">Slides</H2>
							<p>
								<Link to={slides}>Here's the current version of the slides.</Link>
							</p>
							<p>
								I also embedded them below. If they're focussed, you can navigate
								with arrow keys or swipes (they're two-dimensional, with chapters on
								the horizontal axis and chapter content layed out vertically). Use{" "}
								<em>Page Up/Down</em> for linearized order and <em>?</em> for more shortcuts.
							</p>
							<Iframe src={slides} className={layout.wide} />
						</React.Fragment>
					)}
					{videoSlug && (
						<React.Fragment>
							<H2 id="video">Video</H2>
							<p>Here's a good recording of the talk. I hope you'll like it.</p>
							<ContentVideo slug={videoSlug} />
						</React.Fragment>
					)}
					<PresentationList slug={slug} />
				</PostContent>
				<PostEnd type="talk" />
			</section>
		</main>
	)
}

export default TalkLayout

import React, { useEffect } from "react"

import { classNames } from "../infra/functions"
import stub from "../infra/stubs"

import SiteLayout from "../layout/site"
import { PROGRESS_BAR_REFERENCE_ID } from "../components/progressBar"
import { PageHeader } from "../components/header"
import Link from "../components/link"
import Calendar from "../components/calendar"

import layout from "../layout/container.module.css"
import style from "./schedule.module.css"

const SchedulePage = ({ data }) => {
	useEffect(() => {
		if (window.location.hash !== `#fullscreen`) return

		document.querySelector(`header`).style.display = `none`
		document.querySelector(`footer`).style.display = `none`
		return () => {
			document.querySelector(`header`).style.display = null
			document.querySelector(`footer`).style.display = null
		}
	})

	const { meta, header } = stub(`schedule`)
	header.date = new Date()
	const calendarUrl =
		data.site.siteMetadata.siteUrl.replace(`https:`, `webcal:`) +
		`/` +
		data.site.siteMetadata.calendar

	return (
		<SiteLayout className="stream" meta={meta}>
			<section id={PROGRESS_BAR_REFERENCE_ID}>
				<div className={style.header}>
					<PageHeader {...header} />
				</div>
				<div className={layout.container}>
					<p {...classNames(style.right, style.colored)}>
						The entries are color-coded:
						<br />
						<Link className="stream" to="live">
							streams
						</Link>
						,{" "}
						<Link className="talk" to="talks">
							talks
						</Link>
						,{" "}
						<span {...classNames("event", style.event)}>events</span>
					</p>
					<p className={style.right}>
						By the way, you can
						<br />
						<a href={calendarUrl}>import this into your calendar</a>.
					</p>
					<Calendar time="upcomingMonths" order="asc" display="monthGrid" fullscreen />
				</div>
			</section>
		</SiteLayout>
	)
}

export const query = graphql`
	{
		site {
			siteMetadata {
				siteUrl
				calendar
			}
		}
	}
`

export default SchedulePage

import React, { useEffect } from "react"

import stub from "../infra/stubs"

import SiteLayout from "../layout/site"
import { PROGRESS_BAR_REFERENCE } from "../components/progressBar"
import { PageHeader } from "../components/header"
import Link from "../components/link"
import Calendar from "../components/calendar"

import layout from "../layout/container.module.css"
import style from "./schedule.module.css"

const SchedulePage = () => {
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

	return (
		<SiteLayout className="stream" meta={meta}>
			<main>
				<section id={PROGRESS_BAR_REFERENCE}>
					<div className={style.header}>
						<PageHeader {...header} />
					</div>
					<div className={layout.container}>
						<p className={style.colors}>
							The events are color-coded:
							<br />
							<Link className="stream" to="live">
								streams are purple
							</Link>
							,{" "}
							<Link className="course" to="courses">
								courses are blue
							</Link>
							<br />
							<Link className="talk" to="talks">
								talks are pink
							</Link>
							, and I love you. 😊
						</p>
						<Calendar time="upcomingMonths" order="asc" display="monthGrid" fullscreen/>
					</div>
				</section>
			</main>
		</SiteLayout>
	)
}

export default SchedulePage

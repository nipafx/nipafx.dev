import React, { useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"

import Link from "./link"

import { classNames } from "../infra/functions"

import style from "./codefxForward.module.css"

const COOKIE_NAME = "codefx_is_now_nipafx"
const COOKIE_VALUE = "got_it"

const CodeFXForward = () => {
	useEffect(() => {
		hideIfCookie()
		showJsButtons()
	})
	return (
		<React.Fragment>
			<div id="codefx-forward" className={style.background}>
				{popover()}
			</div>
			<div id="codefx-catch-all" className={style.background}>
				{popover()}
			</div>
		</React.Fragment>
	)
}

const popover = () => (
	<div className={style.popover}>
		<h1 className={style.title}>Looking for this?</h1>
		<Img {...codefx()} />
		<div className={style.text}>
			<p>
				Then you're in the right place:{" "}
				<span className={style.callout}>CodeFX.org is now nipafx.dev!</span> It's the same
				content (spicy Java) by the same guy (me, <Link to="/nicolai-parlog">Nicolai</Link>{" "}
				- nice to meet you!), but with a new look and without CodeFX as a middleman. From
				now on, it's just <span className={style.callout}>You. Me. Java.</span>
			</p>
			<div {...classNames(style.choices, style.noJs)}>
				<div className={style.choice}>
					<a className={style.button} href="#" role="button">
						Got it!
					</a>
					<p>(JavaScript is off, so no cookies - tell me again next time)</p>
				</div>
			</div>
			<div {...classNames(style.choices, style.js)}>
				<div className={style.choice}>
					<a className={style.button} href="#" role="button" onClick={setCookie}>
						Got it!
					</a>
					<p>
						(and give me a cookie to remember - <Link to="privacy">privacy policy</Link>)
					</p>
				</div>
				<div className={style.choice}>
					<a className={style.button} href="#" role="button">
						Got it!
					</a>
					<p>(and tell me again next time I'm forwarded)</p>
				</div>
			</div>
			<p className={style.catchAll}>
				By the way, it looks like you didn't get forwarded to the page you were looking for.
				If that's indeed the case, it would be great if you could{" "}
				<Link to="contact">let me know</Link>, so I can fix it.
			</p>
		</div>
	</div>
)

const codefx = () =>
	useStaticQuery(graphql`
		query {
			codefxWide: imageSharp(fields: { id: { eq: "codefx-ultra-wide" } }) {
				fields {
					id
				}
				fluid(maxWidth: 1400, srcSetBreakpoints: [600, 1000, 1400, 2800]) {
					...GatsbyImageSharpFluid
				}
			}
		}
	`).codefxWide

const setCookie = () => {
	document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE};path=/`
}

const hideIfCookie = () => {
	let hash = window.location.hash
	if (!hash.includes("codefx-forward") && !hash.includes("codefx-catch-all")) return

	const readerGotIt = document.cookie.includes(`${COOKIE_NAME}=${COOKIE_VALUE}`)
	if (!readerGotIt) return

	hash = hash.replace("codefx-forward", "").replace("codefx-catch-all", "")
	// window.location.hash = hash
	//		~> changes history, which breaks back button (JS is immediately reevaluated)
	// history.replaceState(undefined, undefined, hash)
	//		~> does not trigger a style recomputation and so popup stays visible with :target
	// location.replace(hash) ~> seems to work fine
	location.replace(hash)
}

const showJsButtons = () => {
	document.querySelectorAll("." + style.noJs).forEach(choices => (choices.style.display = "none"))
	document.querySelectorAll("." + style.js).forEach(choices => (choices.style.display = "grid"))
}

export default CodeFXForward

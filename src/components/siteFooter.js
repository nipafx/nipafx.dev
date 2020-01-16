import React from "react"

import { classNames } from "../infra/functions"

import SiteLogo from "./siteLogo"
import LinkList from "./linkList"

import channels from "../../content/meta/channel-links.json"
import meta from "../../content/meta/meta-links.json"

import layout from "../layout/container.module.css"
import style from "./siteFooter.module.css"

const SiteFooter = () => (
	<footer {...classNames(layout.container, style.footer)}>
		<div className={style.container}>
			<SiteLogo className={style.logo} />
			<LinkList className={style.channels} links={channels.links} />
			<LinkList className={style.meta} links={meta.links} />
		</div>
	</footer>
)

export default SiteFooter

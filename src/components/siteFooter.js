import React from "react"

import { classNames } from "../infra/functions"

import SiteLogo from "./siteLogo"
import LinkList from "./linkList"

import channels from "../../content/meta/channel-links.json"
import meta from "../../content/meta/meta-links.json"

import * as layout from "../layout/container.module.css"
import * as style from "./siteFooter.module.css"

const SiteFooter = () => (
	<footer {...classNames(layout.container, style.footer)}>
		<div {...classNames(layout.siteHeader, style.container)}>
			<SiteLogo className={style.logo} />
			<LinkList showIconsUntil={1000} className={style.channels} links={channels.links} />
			<LinkList showOnlyTexts className={style.meta} links={meta.links} />
		</div>
	</footer>
)

export default SiteFooter

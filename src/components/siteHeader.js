import React from "react"

import { classNames } from "../infra/functions"

import SiteLogo from "./siteLogo"
import LinkList from "./linkList"
import SiteMenu from "./siteMenu"
import ProgressBar, { PROGRESS_BAR_OFFSET } from "./progressBar"

import channels from "../../content/meta/channel-links.json"

import layout from "../layout/container.module.css"
import style from "./siteHeader.module.css"

const SiteHeader = ({ onIndexPage }) => (
	<header id={PROGRESS_BAR_OFFSET} {...classNames(layout.container, style.header)}>
		<div {...classNames(layout.siteHeader, style.container)}>
			<SiteLogo className={style.logo} onIndexPage={onIndexPage} />
			<LinkList showIconsUntil={600} className={style.channels} links={channels.links} />
			<SiteMenu className={style.menu} onIndexPage={onIndexPage} />
		</div>
		<ProgressBar className={layout.fullWidth} />
	</header>
)

export default SiteHeader

import React from "react"

import { classNames } from "../infra/functions"

import SiteLogo from "./siteLogo"
import ChannelLinks from "./channelLinks"
import SiteMenu from "./siteMenu"
import ProgressBar, { PROGRESS_BAR_OFFSET } from "./progressBar"

import layout from "../layout/container.module.css"
import style from "./siteHeader.module.css"

const SiteHeader = () => (
	<header id={PROGRESS_BAR_OFFSET} {...classNames(layout.container, style.header)}>
		<div className={style.container}>
			<SiteLogo className={style.logo} />
			<ChannelLinks className={style.links} />
			<SiteMenu className={style.menu} />
		</div>
		<ProgressBar className={layout.fullWidth} />
	</header>
)

export default SiteHeader

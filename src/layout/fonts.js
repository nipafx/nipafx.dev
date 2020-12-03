import React from "react"
import Helmet from "react-helmet"

import Text from "../fonts/SourceSansPro-Regular.woff2"
import TextBold from "../fonts/SourceSansPro-SemiBold.woff2"
import Code from "../fonts/Bedstead-Regular.otf"

const Fonts = () => (
	<Helmet>
		<link rel="preload" as="font" href={Text} type="font/woff2" crossOrigin="anonymous" />
		<link rel="preload" as="font" href={TextBold} type="font/woff2" crossOrigin="anonymous" />
		<link rel="preload" as="font" href={Code} type="font/woff2" crossOrigin="anonymous" />
	</Helmet>
)

export default Fonts

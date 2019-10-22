import React from "react"

import Card from "./card"
import style from "./cards.module.css"

export default () => (
	<div class={style.container}>
		<Card imageId="cards-twitter" url="https://twitter.com/nipafx" cssId="twitter-what" />
		<Card imageId="cards-codefx" url="https://blog.codefx.org" cssId="blog-what" />
		<Card imageId="cards-youtube" url="https://youtube.com/codefx" cssId="youtube-what" />
		<Card imageId="cards-twitch" cssId="twitch-what" url="https://twitch.tv/nipafx" />
		<Card imageId="cards-nipa" url="https://nipafx.org/hire" cssId="hire-what" />
		<Card imageId="cards-discord" url="https://discord.gg/7m9w8Td" cssId="discord-what" />
		<Card imageId="cards-medium" url="https://medium.com/codefx-weekly" cssId="medium-what" />
		<Card
			imageId="cards-jms-meap-cover"
			url="https://www.manning.com/books/the-java-9-module-system?a_aid=nipa&a_bid=869915cb"
			cssId="books-what"
		/>
		<Card imageId="cards-github" url="https://github.com/CodeFX-org" cssId="github-what" />
		<Card
			imageId="cards-stackoverflow"
			url="https://stackoverflow.com/users/2525313/nicolai-parlog"
			cssId="stackoverflow-what"
		/>
		<Card
			imageId="cards-talks"
			url="https://blog.codefx.org/upcoming-talks"
			cssId="talks-what"
		/>
	</div>
)

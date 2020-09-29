import "./src/layout/global.css"
import "./src/layout/colors.css"
import "./src/layout/fonts.css"
import "./src/layout/code.css"

// https://www.gatsbyjs.com/plugins/gatsby-background-image/#important
// IntersectionObserver polyfill for gatsby-background-image (Safari, IE)
export const onClientEntry = () => {
	if (!(`IntersectionObserver` in window)) {
		import(`intersection-observer`)
		console.log(`# IntersectionObserver is polyfilled!`)
	}
}

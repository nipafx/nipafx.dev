import React from "react"
import { graphql, useStaticQuery } from "gatsby"

const CourseDetails = ({ slug }) => {
	const { length, audience, requirements } = getCourseDetails(slug)
	// the following  content is also embedded in the RSS feed,
	// but because I couldn't reuse this component, the code is
	// effectively duplicated
	// ~> changes here need to be manually reproduced in feed generation
	return (
		<dl>
			<dt>Audience:</dt><dd>{audience}</dd>
			<dt>Prerequisite:</dt><dd>{requirements}</dd>
			<dt>Length:</dt><dd>{length}</dd>
		</dl>
	)
}

const getCourseDetails = slug => {
	const { courses } = useStaticQuery(graphql`
		query {
			courses: allCourse {
				nodes {
					slug
					length
					audience
					requirements
				}
			}
		}
	`)
	return courses.nodes.find(course => course.slug === slug)
}

export default CourseDetails

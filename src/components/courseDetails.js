import React from "react"
import { graphql, useStaticQuery } from "gatsby"

const CourseDetails = ({ slug }) => {
	const { length, audience, requirements } = getCourseDetails(slug)
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

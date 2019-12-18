import React from "react"

const FormattedDate = ({ date }) => {
	const dateObject = new Date(date)
	const formattedDateString = dateObject.toISOString().substring(0, 10)
	return <time dateTime={date}>{formattedDateString}</time>
}

export default FormattedDate

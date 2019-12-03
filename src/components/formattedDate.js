import React from "react"

const FormattedDate = ({ date }) => {
	const dateObject = new Date(date)
	const formattedDateString = dateObject.toISOString().substring(0, 10)
	return <time datetime={date}>{formattedDateString}</time>
}

export default FormattedDate

import React from "react"

const FormattedDate = ({ date, className }) => {
	const dateObject = new Date(date)
	const formattedDateString = dateObject.toISOString().substring(0, 10)
	return (
		<time dateTime={date} className={className}>
			{formattedDateString}
		</time>
	)
}

export default FormattedDate

export default async (request, context) => {
	const ip = context.ip
			|| request.headers["x-forwarded-for"]?.split(",").shift()
			|| request.socket?.remoteAddress
			|| request.connection?.remoteAddress
	if (ip === "2a01:488:66:1000:5bfa:6672:0:1") return new Response(
		"This is my effort to fight bot-induced traffic, but\n" +
		"it appears that you were caught in the cross-fire.\n\n" +
		"Please open an issue at:\n" +
		"https://github.com/nipafx/nipafx.dev/issues/new/choose.")
	else return context.next()
}

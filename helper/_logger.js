const log4js = require("log4js")
const logger = log4js.getLogger()

log4js.configure({
	appenders: {
		appender: {
			type: "file",
			filename: "log/log",
			keepFileExt: true,
			compress: true,
			pattern: "yyyy-MM-dd.log",
			alwaysIncludePattern: true,
		},
		console: { type: "console" }
	},
	categories: {
		default: {
			appenders: ["appender", "console"],
			level: "all",
		},
	},
})

module.exports = logger
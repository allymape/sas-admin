const { format, createLogger, transports } = require("winston");
const { combine, label, json } = format;
require("winston-daily-rotate-file");

//Label
const CATEGORY = "Log Rotation";

//DailyRotateFile func()
const fileRotateTransport = new transports.DailyRotateFile({
  filename: "logs/sas-admin-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "1d",
});

const logger = createLogger({
  level: "debug",
  format: combine(label({ label: CATEGORY }), json()),
  transports: [fileRotateTransport, new transports.Console()],
});

module.exports = logger;
const winston = require("winston");

const isProduction = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    isProduction &&
      new winston.transports.File({ filename: "error.log", level: "error" }),
    isProduction && new winston.transports.File({ filename: "combined.log" }),
  ].filter(Boolean),
  exitOnError: false,
});

module.exports = logger;

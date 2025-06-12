import pino from "pino";

const customLogger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

export default customLogger;

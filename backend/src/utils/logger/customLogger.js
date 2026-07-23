import { createLogger, format, transports } from "winston";
const { combine, printf, timestamp } = format
import path from "node:path"
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(filename)

const myFormat = printf(({ level, message, timestamp, ...meta }) => {

    const metaString = Object.keys(meta).length
        ? ` [Meta: ${JSON.stringify(meta)}]`
        : "";
    return `[${level}] ${timestamp} ${message} ${metaString}`
})
export const customLogger = () => {
    return createLogger({
        level: "debug",
        format: combine(timestamp(), myFormat),
        transports: [new transports.File({ filename: path.join(__dirname, "../../../log/logger.log") })]
    })
}


import loadApplication from "./src/boot/loadApplication.js"
import "dotenv/config"
import logger from "./src/utils/logger/customLogger.js"

const host = process.env.HOST || "0.0.0.0"
const port = process.env.PORT || 8080
const { app, mode } = await loadApplication()

const server = app.listen(port, host, () => {
    logger.info(`Started ${mode} application`, { "activity": `${mode} application` })
})


process.on("SIGTERM", () => {
    logger.info("SIGTERM request received, processing server shutdown")
    server.close(() => {
        logger.info("Http server closed")
        process.exit(0)
    })
})

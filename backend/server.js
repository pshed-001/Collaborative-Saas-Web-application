import app from "./src/app.js"
import "dotenv/config"
import logger from "./src/utils/logger/logger.js"

const host = process.env.HOST || "0.0.0.0"
const port = process.env.PORT || 8080

const server = app.listen(port, host, () => {
        logger.info(`Server started listening`, {"activity" : "Server initialisation"})
})


process.on("SIGTERM", () => {
    logger.info("SIGTERM request received, processing server shutdown")
    server.close(() => {
        logger.log("Http server closed")
        process.exit(0)
    })
})

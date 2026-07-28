import "dotenv/config"
import logger from "../utils/logger/customLogger.js"

export default async function loadApplication() {
    if (process.env.MAINTENANCE_MODE === "true") {
        logger.info("Selected maintenance application", { "activity": "Maintenance application" })
        return {
            app: (await import("./maintenanceApp.js")).default,
            mode: "maintenance"
        }
    }
    logger.info("Selected main application", { "activity": "Main application" })
    return {
        app: (await import("./mainApp.js")).default,
        mode: "main"
    }
}
import { customLogger } from "./customLogger.js";
import "dotenv/config"
let logger = null
if(process.env.NODE_ENV === "production")
    logger = customLogger()
export default logger

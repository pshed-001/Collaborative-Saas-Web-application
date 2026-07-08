import { createClient } from "redis"
import "dotenv/config"

const MAX_RETRIES = parseInt(process.env.REDIS_RETRIES, 10) || 5

const redisConnect = createClient({
    socket: {
        host: process.env.HOST,
        port: process.env.REDIS_PORT,
        reconnectStrategy: (retries) => {
            if (retries >= MAX_RETRIES) {
                console.error(`Redis max retry reached`)
                throw new Error("Max retry attempt reached")
            }
            const delay = 5000
            console.log(`Redis retry attemp ${retries + 1} in {delay/1000}s`)
            return delay
        }
    }
})

redisConnect.on("error", (err) => console.error("Error encounterede during initialising", err))

try {
    await redisConnect.connect()
    console.log("Redis connection initilised sucessfully")
} catch (err) {
    console.error("Error encountered", err)
}
export default redisConnect

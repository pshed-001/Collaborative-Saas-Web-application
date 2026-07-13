import { RedisStore } from "rate-limit-redis"
import { rateLimit } from "express-rate-limit"
import redisConnect from "../../utils/redis-client.js"
import { slowDown } from "express-slow-down"
import { redisStorage } from "../../utils/redisStore.js"


// global slowdown after 200 request within 30 minutes
const globalSlowDown = slowDown({
    windowMs: 30 * 60 * 1000,
    delayAfter: 200,
    delayMs: (usedHits) => usedHits * 500,
    store: redisStorage(redisConnect, "global-sd:")

})
// global limiter 210 requests within 30 minutes
const globalLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 210,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStorage(redisConnect, "global-rl:"),
    message: "Too many requests. Kindly wait while we process your request."
})
// export both limiter adn slow-down to be mounted globally
export { globalLimiter, globalSlowDown }

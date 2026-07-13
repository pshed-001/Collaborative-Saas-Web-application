import RedisStore from "rate-limit-redis"
import { slowDown } from "express-slow-down"
import { rateLimit } from "express-rate-limit"
import redisConnect from "../../utils/redis-client.js"
import { redisStorage } from "../../utils/redisStore.js"


//register slow-down 5 req are allowed before slow-down kicks in
const registerSlowDown = slowDown({
    windowMs: 30 * 60 * 1000,
    delayAfter: 5,
    delayMs: (usedHits) => usedHits * 500,
    store: redisStorage(redisConnect, "register-sd:")

})
// limit user on the reguster by ip with 10 request in 30 minutes
const registerLimiterByIp = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStorage(redisConnect, "register-rl-ip:"),
    message: "Too many account creation attempt. Kindly try again later"
})

// limit user on register with user identity with 50 requst in 30 min
const registerLimiterByEmail = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many account creation attempt. Kindly try again later",
    store: redisStorage(redisConnect, "register-rl-email:"),
    keyGenerator: (req) => {
        const email = typeof (req.body?.email) === "string" ? req.body?.email.toLowerCase().trim() : null
        if (email !== null)
            return email
        return req.ip
    }
})

// limit user on register by combinig both user identity and ip address with 10 request in 30 min
const registerLimiterCombined = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStorage(redisConnect, "register-rl-ip-email:"),
    keyGenerator: (req) => {
        const user = typeof (req.body?.email) === "string" ? req.body?.email.toLowerCase().trim() : null
        if (user !== null)
            return `UserInput:${user}:${req.ip}`;
        return req.ip
    }
})

export { registerLimiterByIp, registerLimiterCombined, registerLimiterByEmail, registerSlowDown }
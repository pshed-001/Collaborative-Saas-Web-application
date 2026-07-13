import RedisStore from "rate-limit-redis"
import { slowDown } from "express-slow-down"
import { rateLimit } from "express-rate-limit"
import redisConnect from "../../utils/redis-client.js"
import { redisStorage } from "../../utils/redisStore.js"

//login slow-down 5 req are allowed before slow-down kicks in
const loginSlowDown = slowDown({
    windowMs: 30 * 60 * 1000,
    delayAfter: 5,
    delayMs: (usedHits) => usedHits * 500,
    store: redisStorage(redisConnect, "login-sd:")

})

// limit user on the login by ip with 10 request in 30 minutes
const loginLimiterByIp = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStorage(redisConnect, "login-rl-ip:"),
    message: "Too many login attempt. Kindly try again later."
})

// limit user on login with user identity with 50 requst in 30 min
const loginLimiterByUserInput = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many login attempts. Kindly try again later.",
    store: redisStorage(redisConnect, "login-rl-ui:"),
    keyGenerator: (req) => {
        const user = typeof (req.body?.userInput) === "string" ? req.body?.userInput?.toLowerCase().trim() : null
        if (user !== null)
            return user
        return req.ip
    }
})

// limit user on login by combinig both user identity and ip address with 10 request in 30 min
const loginLimiterCombined = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStorage(redisConnect, "login-rl-ip-ui:"),
    keyGenerator: (req) => {
        const user = typeof (req.body?.userInput) === "string" ? req.body?.userInput.toLowerCase().trim() : null
        if (user !== null)
            return `${user}:${req.ip}`;
        return req.ip
    }
})

export { loginLimiterByIp, loginLimiterCombined, loginLimiterByUserInput, loginSlowDown }
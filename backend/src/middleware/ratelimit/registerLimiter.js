import { slowDown } from "express-slow-down"
import { rateLimit, ipKeyGenerator } from "express-rate-limit"
import redisConnect from "../../utils/redis-client.js"
import { redisStorage } from "../../utils/redisStore.js"
import { hashUserIdentity } from "../../utils/hash.js"

//register slow-down 20 req are allowed before slow-down kicks in
const registerSlowDown = slowDown({
    windowMs: 30 * 60 * 1000,
    delayAfter: 20,
    delayMs: (usedHits) => usedHits * 500,
    maxDelayMs: 5000,
    store: redisStorage(redisConnect, "register-sd:")

})
// limit user on the register by ip with 50 request in 30 minutes
const registerLimiterByIp = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStorage(redisConnect, "register-rl-ip:"),
    handler: (req, res) => {
        res.status(429).json({
            error: true,
            message: "Too many account creation attempts. Kindly try again later",
            data: {
                payload: {},
                metadata: {
                    timestamp: new Date()
                }
            }
        })
    },
})

// limit user on register with user identity with 50 requst in 30 min
const registerLimiterByEmail = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStorage(redisConnect, "register-rl-email:"),
    handler: (req, res) => {
        res.status(429).json({
            error: true,
            message: "Too many account creation attempts. Kindly try again later",
            data: {
                payload: {},
                metadata: {
                    timestamp: new Date()
                }
            }
        })
    },
    keyGenerator:  (req) => {
        const email = typeof (req.body?.email) === "string" ? req.body?.email.toLowerCase().trim() : null
        if (email !== null)
            return  hashUserIdentity(email)
        return ipKeyGenerator(req.ip)
    }
})

// limit user on register by combinig both user identity and ip address with 10 request in 30 min
const registerLimiterCombined = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStorage(redisConnect, "register-rl-ip-email:"),
    handler: (req, res) => {
        res.status(429).json({
            error: true,
            message: "Too many account creation attempts. Kindly try again later",
            data: {
                payload: {},
                metadata: {
                    timestamp: new Date()
                }
            }
        })
    },
    keyGenerator:  (req) => {
        const user = typeof (req.body?.email) === "string" ? req.body?.email.toLowerCase().trim() : null
        if (user !== null)
            return `${ hashUserIdentity(user)}:${ipKeyGenerator(req.ip)}`;
        return ipKeyGenerator(req.ip)
    }
})

export { registerLimiterByIp, registerLimiterCombined, registerLimiterByEmail, registerSlowDown }
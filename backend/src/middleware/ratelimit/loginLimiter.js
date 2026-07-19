import { slowDown } from "express-slow-down"
import { ipKeyGenerator, rateLimit } from "express-rate-limit"
import redisConnect from "../../utils/redis-client.js"
import { redisStorage } from "../../utils/redisStore.js"
import { hashUserIdentity } from "../../utils/hash.js"

//login slow-down 20 req are allowed before slow-down kicks in
const loginSlowDown = slowDown({
    windowMs: 30 * 60 * 1000,
    delayAfter: 20,
    delayMs: (usedHits) => usedHits * 500,
    maxDelayMs: 5000,
    store: redisStorage(redisConnect, "login-sd:")

})

// limit user on the login by ip with 50 request in 30 minutes
const loginLimiterByIp = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 50,
    // skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStorage(redisConnect, "login-rl-ip:"),
    handler: (req, res) => {
        res.status(429).json({
            error: true,
            message: "Too many login attempts. Kindly try again later.",
            data: {
                payload: {},
                metadata: {
                    timestamp: new Date()
                }
            }
        })
    },
})

// limit user on login with user identity with 50 requst in 30 min
const loginLimiterByUserInput = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 50,
    // skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: true,
            message: "Too many login attempt. Kindly try again later.",
            data: {
                payload: {},
                metadata: {
                    timestamp: new Date()
                }
            }
        })
    }, store: redisStorage(redisConnect, "login-rl-ui:"),
    keyGenerator:  (req) => {
        const user = typeof (req.body?.userInput) === "string" ? req.body?.userInput?.toLowerCase().trim() : null
        if (user !== null) 
            return  hashUserIdentity(user)
        
        return ipKeyGenerator(req.ip)
    }
})

// limit user on login by combinig both user identity and ip address with 10 request in 30 min
const loginLimiterCombined = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 10,
    // skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStorage(redisConnect, "login-rl-ip-ui:"),
    handler: (req, res) => {
        res.status(429).json({
            error: true,
            message: "Too many login attempt. Kindly try again later.",
            data: {
                payload: {},
                metadata: {
                    timestamp: new Date()
                }
            }
        })
    },
    keyGenerator:  (req) => {
        const user = typeof (req.body?.userInput) === "string" ? req.body?.userInput.toLowerCase().trim() : null
        if (user !== null)
            return `${ hashUserIdentity(user)}:${ipKeyGenerator(req.ip)}`;
        return ipKeyGenerator(req.ip)
    }
})

export { loginLimiterByIp, loginLimiterCombined, loginLimiterByUserInput, loginSlowDown }
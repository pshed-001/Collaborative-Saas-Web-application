import {RedisStore} from "rate-limit-redis"
import { rateLimit } from "express-rate-limit"
import redisConnect from "../../utils/redis-client.js"

const store = new RedisStore({
    sendCommand : (args) => {
        console.log(args)
        return redisConnect.sendCommand(args)
    },
    prefix : "global-r1"
})

const limiter = rateLimit({
    windowMs : 5 * 60 * 1000,
    limit : 5,
    standardHeaders : true,
    legacyHeaders : false,
    store 
})
export default limiter;

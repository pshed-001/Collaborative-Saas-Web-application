import RedisStore from "rate-limit-redis";

export function redisStorage(client, prefix){
    return new RedisStore({
        sendCommand : (...args) => client.sendCommand(args),
        prefix
    })
}

//
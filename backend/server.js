import app from "./src/app.js"
import "dotenv/config"

const host = process.env.HOST || "localhost"
const port = process.env.PORT || 8080

const server = app.listen(port, host, () => {
    console.log(`Server started listening on http://${host}:${port}`)
})


process.on("SIGTERM", () => {
    console.log("SIGTERM request received, processing server shutdown")
    server.close(() => {
        console.log("Http server closed")
        process.exit(0)
    })
})

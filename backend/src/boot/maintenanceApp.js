import express from "express"
import helmet from "helmet"
import cors from "cors"
import "dotenv/config"

const allowedOrigins = process.env.CLIENT_URL ?
    process.env.CLIENT_URL.split(",").map((url) => url.trim()) : []

const maintenanceApp = express()

maintenanceApp.use(helmet())
maintenanceApp.set("trust proxy", true)
maintenanceApp.use(cors({
    origin: allowedOrigins,
    optionsSuccessStatus: 200
}))
maintenanceApp.all("/{*splat}", (req, res) => {
    res.status(503).json({
        success: true,
        message: "Application is currently under maintenance."
    })
})

export default maintenanceApp
//

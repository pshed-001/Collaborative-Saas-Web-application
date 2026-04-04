import express from "express";
import router from "./modules/auth/auth.routes.js";
import { errorhandler } from "./middleware/error.middleware.js";

const app= express()
app.use(express.json())
app.use(express.urlencoded({ extended : true}))
app.use("/register",router )
app.use(errorhandler)

export default app
import express from "express";
import { authMiddleWare } from "../middleware/auth.middleware.js";

const testRouter = express.Router();

testRouter.get("/protected", authMiddleWare, (req, res)=>{
    res.status(200).json({
        message : "You are checked before giving access to this route.",
        user : req.user,
        details : req.body
    })
})

export default testRouter;
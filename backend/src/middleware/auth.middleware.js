import { errorMessage } from "../utils/helper.message";
import jwt from "jsonwebtoken";

export function authMiddleWare(err, req, res, next){
    const checkAuthorised = req.header.Authorization;
    if (!checkAuthorised){
        return errorMessage(res, "Authorization header not present.",401)
    }

    const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY
    const verifiedToken = jwt.verify(checkAuthorised.split(" ")[1],JWT_ACCESS_SECRET_KEY )
    if(!verifiedToken){
        return errorMessage(res, "Incorrect token provided.", 401)
    }
    req.user = verifiedToken;
    next()
    
}
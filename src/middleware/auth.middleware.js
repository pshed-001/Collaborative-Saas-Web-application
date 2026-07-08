import { errorMessage } from "../utils/helper.message.js";
import jwt from "jsonwebtoken";


export const authMiddleWare = (req, res, next) => {
    const checkAuthorised = req.headers.authorization;
    if (!checkAuthorised){
        return errorMessage(res, "Access Denied(0)", 401)
    }
    if (!checkAuthorised.startsWith("Bearer ")){
        return errorMessage(res, "Access Denied(1) .", 401)
    }

    const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;
    const token = checkAuthorised.split(" ")[1];
    try{
        const verifiedToken = jwt.verify(token, JWT_ACCESS_SECRET_KEY )
        req.user = {
            id : verifiedToken.id,
            username : verifiedToken.username,
            roles : verifiedToken.roles || []
        }
        next()
    }catch(err){
        if (err.name === "TokenExpiredError"){
            // get refresh token format
            return errorMessage(res, "Expired Token", 401 )

        }else if(err.name === "JsonWebTokenError"){
            return errorMessage(res, "Access Denied(2).", 401)
        }else{
            next(err)
        }
    } 
}

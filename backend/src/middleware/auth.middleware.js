import { errorMessage } from "../utils/helper.message.js";
import jwt from "jsonwebtoken";


export const  authMiddleWare = (req, res, next) => {
    const checkAuthorised = req.headers.authorization;
    if (!checkAuthorised || !checkAuthorised.startsWith("Bearer ")){
        return errorMessage(res, "Authorization header not present.",401)
    }

    const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;
    const token = checkAuthorised.split(" ")[1];
    // const verifiedToken = jwt.verify(checkAuthorised.split(" ")[1],JWT_ACCESS_SECRET_KEY )
    /*if(!verifiedToken){
        return errorMessage(res, "Incorrect token provided.", 401)
    }*/
    try{
        const verifiedToken = jwt.verify(token, JWT_ACCESS_SECRET_KEY )
        req.user = {
            id : verifiedToken.userId,
            username : verifiedToken.username
        }
        next()
    }catch(err){
        if (err.name === "TokenExpiredError"){
            // get refresh token format
            return errorMessage(res, "Expired Token", 401 )

        }else if(err.name === "JsonWebTokenError"){
            return errorMessage(res, "Invalid token provided.", 401)
        }else{
            next(err)
        }
    }
    
}

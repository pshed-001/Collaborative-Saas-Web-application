import { errorMessage } from "../utils/helper.message.js"

export const errorhandler = (err, req, res, next) =>{

    // handling validation error
    if (err.errors){
        const errors = err.errors
        return errorMessage(res, errors)
    }
    // handling service error
    if (err.message ){
        return errorMessage(res, err.message)
    }
    // handle unexpected errors
    console.error(err)
    return errorMessage(res, "Something unexpected happened", 500 )
}
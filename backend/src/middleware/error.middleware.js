import { errorMessage } from "../utils/helper.message.js"

export const errorhandler = (err, req, res, next) =>{

    if (err.errors){
        const errors = err.errors
        return errorMessage(res, errors)
    }
    if (err.message ){
        return errorMessage(res, err.message)
    }
    console.error(err)
    return errorMessage(res, "Something unexpected happened", 500 )
}
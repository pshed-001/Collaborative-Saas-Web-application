import { errorMessage } from "../utils/helper.message.js";
import { AppError } from "./apperror.js";

export const errorhandler = (err, req, res, next) => {
  // handling validation error
  if (err.errors) {
    const errors = err.errors;
    return errorMessage(res, errors, err.statusCode);
  }
  console.log(err)

  const statusCode = err.statusCode || 500
  return res.status(statusCode).json({
    error: true,
    message: err.message || "Something unexpected happened",
    data: {
      payload: null,
      meta: {
        timestamp: new Date().toISOString()
      }
    },
    statusCode
  })

};

import { errorMessage } from "../utils/helper.message.js";
import { AppError } from "./apperror.js";

export const errorhandler = (err, req, res, next) => {
  // handling validation error
  console.error(err);
  if (err.errors) {
    console.log(err.errors);
    const errors = err.errors;
    return errorMessage(res, errors, err.statusCode);
  }
  let statusCode = err.statusCode || 500

  let message = err.message
  if (err.code === "P2025") {
    message = "Record not found or invalid input";
    statusCode = 404
  }
  if (err.code === "P2002") {
    message = "Record already exist with the same unique field value";
    statusCode = 400
  }
  return res.status(statusCode).json({
    error: true,
    message: message,
    data: {
      payload: null,
      meta: {
        timestamp: new Date().toISOString()
      }
    },
  })

};

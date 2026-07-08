export function errorMessage(res, message, statusCode = 400) {
  res.status(statusCode).json({
    error: true,
    message: message,
    data: {
      payload: null,
      meta: {
        timestamp: new Date()
      }
    }
  });
}
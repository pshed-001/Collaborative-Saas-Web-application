export  function errorMessage(res, mesg, statusCode = 400, status = "Fail") {
  return res.status(statusCode).json({
    status : status,
    message : mesg,
  });
}
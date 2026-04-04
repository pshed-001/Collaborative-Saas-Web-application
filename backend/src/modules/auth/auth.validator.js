import { body, validationResult } from "express-validator";

export const validateRegisterUser = [
  body("firstname")
    .notEmpty()
    .withMessage("The firstname is required.")
    .trim()
    .escape(),
  body("lastname")
    .notEmpty()
    .withMessage("The lastname is required.")
    .trim()
    .escape(),
  body("username")
    .notEmpty()
    .withMessage("The username is required.")
    .trim()
    .escape(),
  body("email")
    .isEmail()
    .withMessage("A valid email is required.")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("A password is required")
    .isLength({ min: 10 })
    .withMessage("Password length must not be less than 10 characters."),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Comfirm password field is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
];

export const validateUserResult = (req,res,next) => {
  const  errors  = validationResult(req)
  if(errors.array().length > 0){
    return next({
      status : 400,
      errors : errors.array()[0].msg
    })
  } 
  next()
};

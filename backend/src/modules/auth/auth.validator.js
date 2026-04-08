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
    .notEmpty()
    .withMessage("The email is required.")
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
    .isLength({ min: 10 })
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
];

export const validateLogin = [
  body("userInput")
  .notEmpty()
  .withMessage("Enter your username or email")
  .isString().withMessage("Input must be a string").trim(),
  body("password")
    .notEmpty()
    .withMessage("A password is required")
    .isLength({ min: 10 })
    .withMessage("Password length must not be less than 10 characters.").trim(),
];

export const validateAuthResult = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return next({
      status: 400,
      errors: errors.array()[0].msg,
    });
  }
  next();
};

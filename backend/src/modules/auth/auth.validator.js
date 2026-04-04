import { body } from "express-validator";

export const validateRegisterUser =   [
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
      .isEmail().withMessage("A valid email is required.")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("A password is required")
      .isLength({ min: 10 })
      .withMessage("Password length must not be less than 10 characters."),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Password field is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match.");
        }
        return true;
      }),
  ]
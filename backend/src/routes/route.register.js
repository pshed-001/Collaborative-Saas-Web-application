import express from "express";
import { body, validationResult } from "express-validator";
import { hashPassword } from "../utils/hash";

const app = express();
const router = express.Router();
app.use(express.json());

export  function errorMessage(res, mesg, status = 400) {
  return res.status(status).json({
    error: mesg,
  });
}
router.post(
  "/register",
  [
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
  ],
  async (req, res) => {
    const { errors } = validationResult(req);
        const { firstname, lastname, username, password, email } = req.body;
    if (!errors.isEmpty()) {
      return errorMessage(res, errors.array());
    }
      try {
        const userPassword = await hashPassword(password);
      } catch (err) {
        return errorMessage(res, err);
      }
  }
);


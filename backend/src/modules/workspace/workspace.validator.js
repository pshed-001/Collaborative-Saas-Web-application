import { body } from "express-validator";
import { validateAuthResult } from "../auth/auth.validator.js";
import content from "../../middleware/read.json.js";

const allowedModes = ["PRIVATE", "PUBLIC"];
// const allowedCategories = ["learning", "education", "tech", "technology", "coding",];

export const validateWorkspaceInput = [
  body("workspaceName")
    .notEmpty()
    .withMessage("Workspace name cannot empty.")
    .isLength({ min: 5 })
    .withMessage("Kinly enter at least 5 characters as workspace name.").trim()
    .escape(),
  body("description")
    .notEmpty()
    .withMessage("Description field cannot be empty.")
    .isLength({ max: 100 })
    .withMessage("Description must be less than 40 characters.").trim()
    .escape(),
  body("category")
    .notEmpty()
    .withMessage("Kindly select at least one category that your workspace belongs to.",)
    .isArray()
    .withMessage("Category must be an array. ")
    .custom((value) => {
      /*for (let i = 0; i < value.length; i++){
        if(!category.includes(i)){
          throw new Error("Category selected not found")
        }
      }*/
      const isValid = value.every((cat) =>
        content.includes(cat.toLowerCase()),
      );
      if (!isValid) {
        throw new Error("Invalid category selected.");
      }
      if (!value.length > 0) {
        throw new Error("Kindly select at least one category.")
      }
      return true;
    }).toArray().customSanitizer(value => value.join(",")),
  body("mode")
    .notEmpty()
    .withMessage("Kindly select at least one mode.")
    .custom((value) => {
      const isValid = allowedModes.includes(value.toUpperCase());
      if (!isValid) {
        throw new Error("Selected mode not present");
      }
      return true;
      //preventing undefined error if field is empty as custom sanitizer runs first before other check
    }).customSanitizer(value => value ? value.toUpperCase() : value), 
];

export const validateWorkspaceResult = validateAuthResult;

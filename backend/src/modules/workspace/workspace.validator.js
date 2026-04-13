import { body } from "express-validator";
import { validateAuthResult } from "../auth/auth.validator";

export const validateWorkspaceInput = [
  body("workspaceName")
    .notEmpty()
    .withMessage("Workspace filed cannot empty")
    .isLength({ min: 5 })
    .withMessage("Kinly enter at least 5 characters as workspace name")
];

export const  validateWorkspaceResult = validateAuthResult(req, res, next);

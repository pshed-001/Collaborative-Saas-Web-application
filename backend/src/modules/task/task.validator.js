import { body } from "express-validator";
import { validateAuthResult } from "../auth/auth.validator.js";

const allowedPriority = ["LOW", "NORMAL", "HIGH"]
const allowedStatus = ["COMPLETED", "IN_REVIEW", "IN_PROGRESS", "REVIEWED", "CANCELLED", "TODO"]

const normaliseLowerCase = (str) => { return typeof str === "string" ? str.toLowerCase() : str }
const normaliseUpperCase = (str) => { return typeof str === "string" ? str.toUpperCase() : str }

const validateTaskCreation = [
    body("title")
        .trim()
        .notEmpty()
        .isLength({ min: 3, max: 50 })
        .withMessage("Task title cannot be empty"),
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Task description cannot be empty").bail()
        .isLength({ min: 3, max: 500 })
        .withMessage("Task description contains invalid special characters"),
    body("dueDate")
        .isISO8601()
        .withMessage("Kindly provide a valid date format"),
    body("priority")
        .trim()
        .isIn(allowedPriority)
        .withMessage("Kindly select a valid task priority"),
    body("assignedTo")
        //       .optional({ nullable: true }).trim()
        .isUUID()
        .withMessage("Assigned user Id must be a valid UUID"),
]

const validateTaskUpdate = [
    body("title")
        .optional({ nullable: true })
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("Task title cannot be less than 3 characters and more than 20 characters"),
    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ min: 3, max: 500 })
        .withMessage("Task description cannot be less than 3 characters and more than 500 characters"),
    body("dueDate")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Kindly provide a valid date format"),
    body("priority")
        .optional({ nullable: true })
        .trim()
        .customSanitizer(value => normaliseUpperCase(value))
        .isIn(allowedPriority).withMessage("Kindly select a valid task priority"),
]

const validateTaskStatus = [
    body("status")
        .notEmpty()
        .withMessage("Task status cannot be empty").trim()
        .bail()
        .isString()
        .withMessage("Task status can only be string")
        .bail()
        .customSanitizer(value => normaliseUpperCase(value))
        .isIn(allowedStatus)
        .withMessage("Invalid status selected")
]

const validateAssignedUserId = [
    body("assignedTo")
        .notEmpty()
        .withMessage("Assigned user field cannot be empty").trim()
        .isUUID()
        .withMessage("Assigned user Id must be a valid UUID")
]
const validateTaskResult = validateAuthResult;

export {
    validateAssignedUserId,
    validateTaskCreation,
    validateTaskResult,
    validateTaskStatus,
    validateTaskUpdate
}

//
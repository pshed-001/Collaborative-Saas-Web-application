import { body } from 'express-validator';
import { validateAuthResult } from '../auth/auth.validator.js';
import content from '../../middleware/read.json.js';

const allowedModes = ['PRIVATE', 'PUBLIC'];

const allowedRoles = ["ADMIN", "MEMBER"]
const validateWorkspaceInput = [
  body('workspaceName')
    .notEmpty()
    .withMessage('Workspace name cannot be empty.')
    .isLength({ min: 5 })
    .withMessage('Kindly enter at least 5 characters as workspace name.')
    .trim()
    .escape(),

  body('description')
    .notEmpty()
    .withMessage('Description field cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('Description must not exceed 100 characters.')
    .trim()
    .escape(),

  body('category')
    .notEmpty()
    .withMessage('Kindly select at least one category that your workspace belongs to.')
    .isArray()
    .withMessage('Category must be an array.')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Kindly select at least one category.');
      }
      const isValid = value.every((cat) => content.includes(cat.toLowerCase()));
      if (!isValid) {
        throw new Error('Invalid category selected.');
      }
      return true;
    })
    // Converted to comma-separated string after validation passes
    .customSanitizer((value) => {
      if (!Array.isArray(value)) return '';
      return value.map((cat) => cat.toLowerCase().trim()).join(',');
    }),

  body('mode')
    .notEmpty()
    .withMessage('Kindly select at least one mode.')
    .custom((value) => {
      const isValid = allowedModes.includes(value.toUpperCase());
      if (!isValid) {
        throw new Error('Selected mode not present.');
      }
      return true;
    })
    .customSanitizer((value) => (value ? value.toUpperCase() : value)),
];

const validateWorkspaceUpdateInput = [
  body('workspaceName')
    .optional()
    .trim()
    .escape(),

  body('description')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Field cannot be more than 100 characters.')
    .trim()
    .escape(),

  body('category')
    .optional()
    .isArray()
    .withMessage('Category must be an array.')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('Kindly select at least one category.');
      }
      const isValid = value.every((cat) => content.includes(cat.toLowerCase()));
      if (!isValid) {
        throw new Error('Invalid category selected.');
      }
      return true;
    })
    // Converted to comma-separated string after validation passes
    .customSanitizer((value) => {
      if (!Array.isArray(value)) return '';
      return value.map((cat) => cat.toLowerCase().trim()).join(',');
    }),

  body('mode')
    .optional()
    .custom((value) => {
      if (value !== undefined) {
        throw new Error('Workspace mode cannot be updated.');
      }
      return true;
    }),
];

const validateRole = [
  body("role")
    .notEmpty()
    .withMessage("Role cannot be empty")
    .bail()
    .customSanitizer((value) => (value ? value.toUpperCase() : value))
    .isIn(allowedRoles)
    .withMessage("Invalid role selected")
]
const validateWorkspaceResult = validateAuthResult;

export {
  validateWorkspaceInput,
  validateWorkspaceUpdateInput,
  validateRole,
  validateWorkspaceResult
}

//
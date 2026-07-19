import { body, param } from "express-validator"

const validateCommentContent = body("content")
  .isString()
  .withMessage("Comment content can only be string.")
  .bail()
  .isLength({ min: 3, max: 100 })
  .withMessage("Comment content can only be between 3 and 100 characters.")

const validateRepliedUser = body("repliedUserId")
  .optional({ nullable: true })
  .isUUID()
  .withMessage("Replied to user id must be a valid identifier")

const validateParentId = body("parentId")
  .optional({ nullable: true })
  .isUUID()
  .withMessage("Parent comment reference must be a valid identifier")

const validateCommentId = param("commentId")
  .isUUID()
  .withMessage("Comment id must be a valid identifier")

export {
  validateCommentContent,
  validateRepliedUser,
  validateParentId,
  validateCommentId,
}

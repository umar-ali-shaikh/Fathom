const express = require("express");
const commentController = require("../controllers/comment.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateCommentBody } = require("../validators/comment.validator");

const commentRouter = express.Router();

commentRouter.use(authMiddleware);

/**
 * @route GET /api/comment/post/:postId
 * @description Top-level comments (or ?parent=:commentId for a reply thread)
 */
commentRouter.get("/post/:postId", commentController.getCommentsController)

/**
 * @route POST /api/comment/post/:postId
 * @description body: { body, parent? }
 */
commentRouter.post("/post/:postId", validateCommentBody, commentController.createCommentController)

/**
 * @route PATCH /api/comment/:commentId
 * @description Edit your own comment
 */
commentRouter.patch("/:commentId", validateCommentBody, commentController.editCommentController)

/**
 * @route DELETE /api/comment/:commentId
 * @description Soft delete — comment owner or the post's owner
 */
commentRouter.delete("/:commentId", commentController.deleteCommentController)

module.exports = commentRouter;

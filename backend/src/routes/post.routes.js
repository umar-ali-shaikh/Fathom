const express = require("express");
const postController = require("../controllers/post.controller");
const postRouter = express.Router();

const { validateCaption, validateCreatePost } = require("../validators/post.validator");

const authMiddleware = require("../middleware/auth.middleware")

postRouter.use(authMiddleware);

/**
 * POST /api/post [protected]
 * body: { caption?, imageUrls: string[] } — image already uploaded via POST /api/upload.
 */
postRouter.post("/", validateCreatePost, postController.createPostController);


/**
 * GET /api/post [protected]
 */
postRouter.get("/", postController.getPostController);

/**
 * GET /api/post/feed [protected]
 */
postRouter.get("/feed", postController.getFeedController)

/**
 * GET /api/post/explore [protected]
 */
postRouter.get("/explore", postController.getExploreController)

/**
 * GET /api/post/details/:postId
 * - return details about a specific post, enforcing the visibility rules
 */
postRouter.get("/details/:postId", postController.getPostDetailController)

/**
 * @route PATCH /api/post/:postId [protected]
 * @description Edit the caption of your own post
 */
postRouter.patch("/:postId", validateCaption, postController.updatePostController)

/**
 * @route DELETE /api/post/:postId [protected]
 * @description Delete your own post (and its comments/likes)
 */
postRouter.delete("/:postId", postController.deletePostController)

/**
 * @route POST /api/post/like/:postId
 */
postRouter.post("/like/:postId", postController.likePostController)

/**
 * @route DELETE /api/post/like/:postId
 */
postRouter.delete("/like/:postId", postController.unlikePostController)

/**
 * GET /api/post/user/:username [protected]
 * - privacy-aware grid feed for a profile
 */
postRouter.get("/user/:username", postController.getUserPostsController)


module.exports = postRouter

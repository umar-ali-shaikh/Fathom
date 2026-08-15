const express = require("express");
const postController = require("../controllers/post.controller");
const postRouter = express.Router();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const authMiddleware = require("../middleware/auth.middleware")

/**
 * POST /api/posts [protected]
 * - req.body = {caption, image-file}
 */

postRouter.post("/", upload.single("image"), authMiddleware, postController.createPostController);


/**
 * GET /api/posts  [protected]
 */

postRouter.get("/", authMiddleware, postController.getPostController);


/**
 * GET /api/posts/details/:postid
 * - return an details about specific post with the id. also check whether the post belongs to the user that the request come from
 */

postRouter.get("/details/:postId", authMiddleware, postController.getPostDetailController)


/**
 * @route POST /api/posts/like/:postId
 */

postRouter.post("/like/:postId", authMiddleware, postController.likePostController)

/**
 * @route DELETE /api/posts/like/:postId
 */

postRouter.delete("/like/:postId", authMiddleware, postController.unlikePostController)

/**
 * GET /api/posts/feed
 */
postRouter.get("/feed", authMiddleware, postController.getFeedController)

/**
 * GET /api/posts/user/:username [protected]
 * - privacy-aware grid feed for a profile
 */
postRouter.get("/user/:username", authMiddleware, postController.getUserPostsController)


module.exports = postRouter
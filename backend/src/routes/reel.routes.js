const express = require("express");
const reelController = require("../controllers/reel.controller");
const authMiddleware = require("../middleware/auth.middleware");

const reelRouter = express.Router();

reelRouter.use(authMiddleware);

/**
 * @route POST /api/reel [protected]
 * @description body: { caption?, videoUrl, thumbnailUrl? } — videoUrl comes from POST /api/upload
 */
reelRouter.post("/", reelController.createReelController);

/**
 * @route GET /api/reel [protected]
 */
reelRouter.get("/", reelController.getReelFeedController);

/**
 * @route GET /api/reel/user/:username [protected]
 * @description privacy-aware grid feed, mirrors GET /api/post/user/:username
 */
reelRouter.get("/user/:username", reelController.getUserReelsController);

/**
 * @route GET /api/reel/:reelId [protected]
 */
reelRouter.get("/:reelId", reelController.getReelDetailController);

/**
 * @route PATCH /api/reel/:reelId [protected]
 */
reelRouter.patch("/:reelId", reelController.updateReelController);

/**
 * @route DELETE /api/reel/:reelId [protected]
 */
reelRouter.delete("/:reelId", reelController.deleteReelController);

/**
 * @route POST /api/reel/like/:reelId [protected]
 */
reelRouter.post("/like/:reelId", reelController.likeReelController);

/**
 * @route DELETE /api/reel/like/:reelId [protected]
 */
reelRouter.delete("/like/:reelId", reelController.unlikeReelController);

module.exports = reelRouter;

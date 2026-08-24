const express = require("express");
const storyController = require("../controllers/story.controller");
const authMiddleware = require("../middleware/auth.middleware");

const storyRouter = express.Router();

storyRouter.use(authMiddleware);

/**
 * @route GET /api/story [protected]
 * @description Statuses from people you follow (plus your own), most recent first
 */
storyRouter.get("/", storyController.getStoryTrayController);

/**
 * @route POST /api/story [protected]
 * @description body: { mediaUrl, caption? } — mediaUrl comes from POST /api/upload
 */
storyRouter.post("/", storyController.createStoryController);

/**
 * @route POST /api/story/:storyId/seen [protected]
 */
storyRouter.post("/:storyId/seen", storyController.markStorySeenController);

/**
 * @route DELETE /api/story/:storyId [protected]
 */
storyRouter.delete("/:storyId", storyController.deleteStoryController);

module.exports = storyRouter;

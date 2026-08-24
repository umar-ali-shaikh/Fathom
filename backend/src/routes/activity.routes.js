const express = require("express");
const activityController = require("../controllers/activity.controller");
const authMiddleware = require("../middleware/auth.middleware");

const activityRouter = express.Router();

activityRouter.use(authMiddleware);

/**
 * @route GET /api/activity/unread-count [protected]
 */
activityRouter.get("/unread-count", activityController.getUnreadCountController);

/**
 * @route POST /api/activity/read [protected]
 */
activityRouter.post("/read", activityController.markAllReadController);

/**
 * @route GET /api/activity [protected]
 */
activityRouter.get("/", activityController.listActivityController);

module.exports = activityRouter;

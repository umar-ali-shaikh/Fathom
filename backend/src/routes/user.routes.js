const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

const userRouter = express.Router();

userRouter.use(authMiddleware);

/**
 * @route PATCH /api/user/me
 * @description Update the logged-in user's own profile
 */
userRouter.patch("/me", userController.updateMeController)

/**
 * @route GET /api/user/follow-requests
 * @description List pending follow requests for the logged-in user
 */
userRouter.get("/follow-requests", userController.listFollowRequestsController)

/**
 * @route POST /api/user/follow-requests/:userId/accept
 */
userRouter.post("/follow-requests/:userId/accept", userController.acceptFollowRequestController)

/**
 * @route POST /api/user/follow-requests/:userId/reject
 */
userRouter.post("/follow-requests/:userId/reject", userController.rejectFollowRequestController)

/**
 * @route POST /api/user/follow/:userId
 * @description Follow a user (or send a request if the target is private)
 */
userRouter.post("/follow/:userId", userController.followUserController)

/**
 * @route DELETE /api/user/follow/:userId
 * @description Unfollow a user
 */
userRouter.delete("/follow/:userId", userController.unFollowUserController)

/**
 * @route GET /api/user/:username/followers
 */
userRouter.get("/:username/followers", userController.getFollowersController)

/**
 * @route GET /api/user/:username/following
 */
userRouter.get("/:username/following", userController.getFollowingController)

/**
 * @route GET /api/user/:username
 * @description Privacy-aware public profile
 */
userRouter.get("/:username", userController.getPublicProfileController)

module.exports = userRouter;

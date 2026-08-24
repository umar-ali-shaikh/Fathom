const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateUpdateMe } = require("../validators/user.validator");

const userRouter = express.Router();

userRouter.use(authMiddleware);

/**
 * @route GET /api/user/me
 * @description Fetch the logged-in user's own profile
 */
userRouter.get("/me", userController.getMeController)

/**
 * @route PATCH /api/user/me
 * @description Update the logged-in user's own profile
 */
userRouter.patch("/me", validateUpdateMe, userController.updateMeController)

/**
 * @route PATCH /api/user/me/notifications
 */
userRouter.patch("/me/notifications", userController.updateNotificationPrefsController)

/**
 * @route GET /api/user/search?q=
 */
userRouter.get("/search", userController.searchUsersController)

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
 * @description Follow a user by id (or send a request if the target is private)
 */
userRouter.post("/follow/:userId", userController.followUserController)

/**
 * @route DELETE /api/user/follow/:userId
 * @description Unfollow a user by id
 */
userRouter.delete("/follow/:userId", userController.unFollowUserController)

/**
 * @route POST /api/user/:username/follow
 * @description Follow a user by username — mirrors /follow/:userId for the frontend's username-keyed calls
 */
userRouter.post("/:username/follow", userController.followUserController)

/**
 * @route DELETE /api/user/:username/follow
 */
userRouter.delete("/:username/follow", userController.unFollowUserController)

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

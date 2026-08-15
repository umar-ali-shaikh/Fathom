const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");



const authRouter = express.Router();

/**
 * POST /api/auth/register
 */
authRouter.post("/register", authController.registerController);


/**
 * POST /api/auth/login
 */

authRouter.post("/login", authController.loginController)

/**
 * GET /api/auth/get-me
 */
authRouter.get("/get-me", authMiddleware, authController.getMeController)

/**
 * POST /api/auth/logout
 */
authRouter.post("/logout", authMiddleware, authController.logoutController)

module.exports = authRouter;
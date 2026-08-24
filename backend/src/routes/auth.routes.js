const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const { validateRegister, validateLogin } = require("../validators/auth.validator");



const authRouter = express.Router();

/**
 * POST /api/auth/register
 */
authRouter.post("/register", authLimiter, validateRegister, authController.registerController);


/**
 * POST /api/auth/login
 */

authRouter.post("/login", authLimiter, validateLogin, authController.loginController)

/**
 * GET /api/auth/get-me
 */
authRouter.get("/get-me", authMiddleware, authController.getMeController)

/**
 * POST /api/auth/logout
 */
authRouter.post("/logout", authMiddleware, authController.logoutController)

/**
 * PATCH /api/auth/password [protected]
 * body: { currentPassword, newPassword }
 */
authRouter.patch("/password", authMiddleware, authController.changePasswordController)

/**
 * GET /api/auth/google
 * Redirects the browser to Google's OAuth consent screen.
 */
authRouter.get("/google", authController.googleAuthController)

/**
 * GET /api/auth/google/callback
 * Google redirects here with ?code&state (or ?error on denial).
 */
authRouter.get("/google/callback", authController.googleCallbackController)

module.exports = authRouter;
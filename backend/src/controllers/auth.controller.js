const userModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const asyncHandler = require("../utils/asyncHandler");
const serializeUser = require("../utils/serializeUser");
const { signSessionToken, setSessionCookie } = require("../utils/jwt");
const { issueState, verifyState } = require("../utils/oauthState");
const oauthService = require("../services/oauth.service");
const { findOrCreateGoogleUser } = require("../services/oauthUser.service");
const { AuthenticationError, ConflictError, NotFoundError, ValidationError } = require("../utils/errors");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const registerController = asyncHandler(async function registerController(req, res) {
    const { email, username, password, bio, fullName, profileImage } = req.body;

    const isUserAlreadyExist = await userModel.findOne({
        $or: [{ email }, { username }]
    });

    if (isUserAlreadyExist) {
        throw new ConflictError(
            isUserAlreadyExist.email === email
                ? "Email already exists"
                : "Username already exists"
        );
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash,
        bio,
        fullName,
        profileImage,
    });

    const token = signSessionToken(user);
    setSessionCookie(res, token);

    return res.status(201).json({
        message: "User Registered Successfully",
        user: serializeUser(user),
    });
});

const loginController = asyncHandler(async function loginController(req, res) {
    const { username, email, password } = req.body;

    const user = await userModel.findOne({
        $or: [{ username }, { email }]
    }).select("+password");

    if (!user) {
        throw new AuthenticationError("Invalid credentials");
    }

    if (user.authProvider === "google" || !user.password) {
        throw new AuthenticationError("This account uses Google Sign-In. Please continue with Google.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        // Deliberately the same message as "user not found" so login can't be
        // used to enumerate which emails/usernames have accounts.
        throw new AuthenticationError("Invalid credentials");
    }

    const token = signSessionToken(user);
    setSessionCookie(res, token);

    res.status(200).json({
        message: "User loggedIn successfully",
        user: serializeUser(user),
    })
});

const getMeController = asyncHandler(async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    res.status(200).json({ user: serializeUser(user) })
});

function logoutController(req, res) {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" })
}

const changePasswordController = asyncHandler(async function changePasswordController(req, res) {
    const { currentPassword, newPassword } = req.body;

    if (typeof newPassword !== "string" || newPassword.length < 8) {
        throw new ValidationError("New password must be at least 8 characters");
    }

    const user = await userModel.findById(req.user.id).select("+password");
    if (!user) {
        throw new NotFoundError("User not found");
    }
    if (user.authProvider === "google" || !user.password) {
        throw new AuthenticationError("This account uses Google Sign-In and has no password to change.");
    }

    const isCurrentValid = await bcrypt.compare(currentPassword || "", user.password);
    if (!isCurrentValid) {
        throw new AuthenticationError("Current password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
});

/**
 * GET /api/auth/google
 * Kicks off the redirect to Google's consent screen with a per-request
 * CSRF `state` token stored in a short-lived cookie.
 */
function googleAuthController(req, res) {
    const state = issueState(res);
    const url = oauthService.buildAuthUrl(state);
    res.redirect(url);
}

/**
 * GET /api/auth/google/callback
 * All failure paths redirect back to the frontend with an `?error=` code
 * instead of returning JSON — this endpoint is only ever reached via a
 * top-level browser navigation from Google, not an API call.
 */
const googleCallbackController = asyncHandler(async function googleCallbackController(req, res) {
    const { code, error: googleError } = req.query;

    if (googleError) {
        return res.redirect(`${CLIENT_URL}/login?error=oauth_denied`);
    }

    if (!verifyState(req, res)) {
        return res.redirect(`${CLIENT_URL}/login?error=oauth_state`);
    }

    if (!code || typeof code !== "string") {
        return res.redirect(`${CLIENT_URL}/login?error=oauth_missing_code`);
    }

    let identity;
    try {
        identity = await oauthService.verifyAuthorizationCode(code);
    } catch (err) {
        console.error("Google OAuth verification failed:", err.message);
        return res.redirect(`${CLIENT_URL}/login?error=oauth_failed`);
    }

    const { user, emailTaken } = await findOrCreateGoogleUser(identity);

    if (emailTaken) {
        return res.redirect(`${CLIENT_URL}/login?error=oauth_email_registered`);
    }

    const token = signSessionToken(user);
    setSessionCookie(res, token);

    return res.redirect(CLIENT_URL);
});

module.exports = {
    loginController,
    registerController,
    getMeController,
    logoutController,
    changePasswordController,
    googleAuthController,
    googleCallbackController,
}

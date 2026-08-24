const { ValidationError } = require("../utils/errors");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;

function validateRegister(req, res, next) {
    let { email, username, password, bio, fullName } = req.body;

    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
        return next(new ValidationError("A valid email is required"));
    }
    if (typeof username !== "string" || !USERNAME_RE.test(username.trim())) {
        return next(new ValidationError(
            "Username must be 3-30 characters and contain only letters, numbers, underscores or dots"
        ));
    }
    if (typeof password !== "string" || password.length < 8) {
        return next(new ValidationError("Password must be at least 8 characters"));
    }
    if (bio !== undefined && (typeof bio !== "string" || bio.length > 150)) {
        return next(new ValidationError("Bio must be 150 characters or fewer"));
    }
    if (fullName !== undefined && typeof fullName !== "string") {
        return next(new ValidationError("Invalid full name"));
    }

    req.body.email = email.trim().toLowerCase();
    req.body.username = username.trim();

    next();
}

function validateLogin(req, res, next) {
    const { email, username, password } = req.body;

    if (!password || typeof password !== "string") {
        return next(new ValidationError("Password is required"));
    }
    if (!email && !username) {
        return next(new ValidationError("Email or username is required"));
    }
    if (email && typeof email === "string") {
        req.body.email = email.trim().toLowerCase();
    }
    if (username && typeof username === "string") {
        req.body.username = username.trim();
    }

    next();
}

module.exports = { validateRegister, validateLogin };

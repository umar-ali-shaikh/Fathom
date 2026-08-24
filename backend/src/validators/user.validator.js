const { ValidationError } = require("../utils/errors");

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;

function validateUpdateMe(req, res, next) {
    const { fullName, name, bio, profileImage, avatarUrl, isPrivate, username } = req.body;
    const resolvedName = name !== undefined ? name : fullName;

    if (resolvedName !== undefined && (typeof resolvedName !== "string" || resolvedName.length > 80)) {
        return next(new ValidationError("Name must be 80 characters or fewer"));
    }
    if (bio !== undefined && (typeof bio !== "string" || bio.length > 150)) {
        return next(new ValidationError("Bio must be 150 characters or fewer"));
    }
    const resolvedImage = avatarUrl !== undefined ? avatarUrl : profileImage;
    if (resolvedImage !== undefined && typeof resolvedImage !== "string") {
        return next(new ValidationError("Invalid profile image"));
    }
    if (isPrivate !== undefined && typeof isPrivate !== "boolean") {
        return next(new ValidationError("isPrivate must be true or false"));
    }
    if (username !== undefined && (typeof username !== "string" || !USERNAME_RE.test(username.trim()))) {
        return next(new ValidationError(
            "Username must be 3-30 characters and contain only letters, numbers, underscores or dots"
        ));
    }
    if (username !== undefined) req.body.username = username.trim();

    next();
}

module.exports = { validateUpdateMe };

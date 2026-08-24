const { ValidationError } = require("../utils/errors");

function validateCaption(req, res, next) {
    const { caption } = req.body;

    if (caption !== undefined && (typeof caption !== "string" || caption.length > 2200)) {
        return next(new ValidationError("Caption must be 2200 characters or fewer"));
    }

    next();
}

function validateCreatePost(req, res, next) {
    const { imageUrls } = req.body;

    if (!Array.isArray(imageUrls) || imageUrls.length === 0 || !imageUrls.every((url) => typeof url === "string" && url)) {
        return next(new ValidationError("At least one image URL is required"));
    }

    return validateCaption(req, res, next);
}

module.exports = { validateCaption, validateCreatePost };

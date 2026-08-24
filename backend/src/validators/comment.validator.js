const { ValidationError } = require("../utils/errors");

function validateCommentBody(req, res, next) {
    const { body } = req.body;

    if (typeof body !== "string" || !body.trim()) {
        return next(new ValidationError("Comment can't be empty"));
    }
    if (body.length > 2200) {
        return next(new ValidationError("Comment must be 2200 characters or fewer"));
    }

    req.body.body = body.trim();
    next();
}

module.exports = { validateCommentBody };

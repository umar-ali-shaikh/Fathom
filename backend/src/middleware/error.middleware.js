const { AppError } = require("../utils/errors");

/**
 * Keeps the existing `{ message, ... }` response shape the frontend already
 * consumes (see docs/product-spec) and additively includes `code`, rather
 * than switching to a new envelope that would break existing callers.
 */
function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            code: err.code,
        });
    }

    // Mongoose duplicate key (e.g. unique username/email/follow pair race)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || "field";
        return res.status(409).json({
            message: `${field} already exists`,
            code: "CONFLICT",
        });
    }

    // Mongoose schema validation
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
        return res.status(400).json({
            message: message || "Invalid input",
            code: "VALIDATION_ERROR",
        });
    }

    // Malformed ObjectId etc.
    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid identifier",
            code: "VALIDATION_ERROR",
        });
    }

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({
            message: "Invalid or expired session",
            code: "AUTHENTICATION_ERROR",
        });
    }

    if (err.name === "MulterError") {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "Image must be 8MB or smaller"
            : "Upload failed";
        return res.status(400).json({ message, code: "VALIDATION_ERROR" });
    }

    console.error(err);

    return res.status(500).json({
        message: "Internal Server Error",
        code: "INTERNAL_ERROR",
    });
}

function notFoundMiddleware(req, res) {
    res.status(404).json({
        message: "Route not found",
        code: "NOT_FOUND",
    });
}

module.exports = { errorMiddleware, notFoundMiddleware };

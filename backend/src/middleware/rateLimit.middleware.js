const rateLimit = require("express-rate-limit");

// Keyed by IP; only counts failed auth attempts against the cap so a burst
// of legitimate successful logins from one NAT/office IP isn't penalized.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        message: "Too many attempts. Please try again later.",
        code: "RATE_LIMITED",
    },
});

module.exports = { authLimiter };

const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("../utils/errors");

function authMiddleware(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return next(new AuthenticationError("Unauthorized Access"));
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        next(new AuthenticationError("Invalid or expired session"));
    }
}

module.exports = authMiddleware;

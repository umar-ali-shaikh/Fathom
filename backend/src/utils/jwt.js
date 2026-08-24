const jwt = require("jsonwebtoken");

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

function signSessionToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
}

function setSessionCookie(res, token) {
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: TOKEN_TTL_MS,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
}

module.exports = { signSessionToken, setSessionCookie };

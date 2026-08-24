const crypto = require("crypto");

const STATE_COOKIE = "oauth_state";
const STATE_TTL_MS = 5 * 60 * 1000;

function issueState(res) {
    const state = crypto.randomBytes(16).toString("hex");

    res.cookie(STATE_COOKIE, state, {
        httpOnly: true,
        maxAge: STATE_TTL_MS,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return state;
}

function verifyState(req, res) {
    const cookieState = req.cookies[STATE_COOKIE];
    res.clearCookie(STATE_COOKIE);

    const queryState = req.query.state;
    return Boolean(cookieState) && Boolean(queryState) && cookieState === queryState;
}

module.exports = { issueState, verifyState };

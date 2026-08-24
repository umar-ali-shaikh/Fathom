const { OAuth2Client } = require("google-auth-library");
const { OAuthError } = require("../utils/errors");

let cachedClient = null;

function getClient() {
    if (cachedClient) return cachedClient;

    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
        throw new OAuthError("Google Sign-In is not configured on this server");
    }

    cachedClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
    return cachedClient;
}

function buildAuthUrl(state) {
    const client = getClient();
    return client.generateAuthUrl({
        access_type: "online",
        scope: ["openid", "email", "profile"],
        state,
        prompt: "select_account",
    });
}

/**
 * Exchanges the authorization code for tokens and verifies the ID token's
 * signature/audience/issuer server-side — the caller must never trust a
 * client-submitted googleId/email/name directly.
 */
async function verifyAuthorizationCode(code) {
    const client = getClient();

    let tokens;
    try {
        ({ tokens } = await client.getToken(code));
    } catch (err) {
        throw new OAuthError("Could not exchange authorization code with Google");
    }

    if (!tokens.id_token) {
        throw new OAuthError("Google did not return an identity token");
    }

    let ticket;
    try {
        ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
    } catch (err) {
        throw new OAuthError("Could not verify Google identity token");
    }

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
        throw new OAuthError("Google identity payload was incomplete");
    }
    if (!payload.email_verified) {
        throw new OAuthError("Google account email is not verified");
    }

    return {
        googleId: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name || "",
        picture: payload.picture || null,
    };
}

module.exports = { buildAuthUrl, verifyAuthorizationCode };

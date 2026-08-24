const crypto = require("crypto");
const userModel = require("../model/user.model");
const { ConflictError } = require("../utils/errors");

async function generateUniqueUsername(seed) {
    const base = (seed || "user")
        .toLowerCase()
        .replace(/[^a-z0-9_.]/g, "")
        .slice(0, 20) || "user";

    let candidate = base;
    // Bounded retries: a random 4-hex suffix has ~65k possibilities, so
    // collisions this many times in a row would indicate a deeper problem
    // rather than bad luck.
    for (let attempt = 0; attempt < 5; attempt++) {
        const exists = await userModel.exists({ username: candidate });
        if (!exists) return candidate;
        candidate = `${base}_${crypto.randomBytes(2).toString("hex")}`;
    }

    throw new ConflictError("Could not generate a unique username");
}

/**
 * Resolves a verified Google identity to an application user.
 * Never auto-links a Google identity to an existing local/password account
 * just because the email matches — that would let anyone who controls a
 * victim's Google account silently take over an unrelated password account.
 */
async function findOrCreateGoogleUser({ googleId, email, name, picture }) {
    let user = await userModel.findOne({ googleId });
    if (user) return { user, created: false };

    const existingByEmail = await userModel.findOne({ email });
    if (existingByEmail) {
        if (existingByEmail.authProvider === "google") {
            // Shouldn't happen (googleId lookup above would've caught it),
            // but guards against a partially-migrated record.
            return { user: existingByEmail, created: false };
        }
        return { user: null, created: false, emailTaken: true };
    }

    const username = await generateUniqueUsername(name || email.split("@")[0]);

    user = await userModel.create({
        username,
        email,
        authProvider: "google",
        googleId,
        fullName: name || undefined,
        profileImage: picture || undefined,
    });

    return { user, created: true };
}

module.exports = { findOrCreateGoogleUser };

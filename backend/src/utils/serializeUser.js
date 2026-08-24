// Central allowlist for what a user document may expose about *itself* —
// used for register/login/get-me/update-me responses, where the caller is
// always looking at their own account. Shaped to match the frontend's
// `User` type (fathom-navigator/src/lib/api/types.ts), not the raw schema.
function serializeUser(user) {
    return {
        id: user._id,
        name: user.fullName || "",
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        avatarUrl: user.profileImage,
        isPrivate: user.isPrivate,
        provider: user.authProvider,
    };
}

module.exports = serializeUser;

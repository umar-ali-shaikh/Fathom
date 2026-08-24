// Minimal shape for a user as seen by *someone else* — embedded on posts,
// comments, reels, stories, follower/following lists and activity actors.
// Deliberately omits email. Accepts a populated Mongoose doc or plain object
// with at least { _id, username }.
function serializePublicUser(user) {
    if (!user) return null;
    return {
        id: user._id,
        name: user.fullName || "",
        username: user.username,
        bio: user.bio || "",
        avatarUrl: user.profileImage,
        isPrivate: Boolean(user.isPrivate),
    };
}

module.exports = serializePublicUser;

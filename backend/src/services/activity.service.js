const activityModel = require("../model/activity.model");

/**
 * Write-side hook shared by like/comment/follow controllers. Never throws —
 * a notification failing to record shouldn't fail the action that caused it.
 * Silently no-ops for self-actions (liking/commenting on your own post).
 */
async function recordActivity({ type, actor, recipient, post = null, commentPreview = null, requestId = null }) {
    if (!recipient || actor.toString() === recipient.toString()) return;

    try {
        await activityModel.create({
            type,
            actor,
            recipient,
            post,
            commentPreview,
            requestId,
        });
    } catch (err) {
        console.error("Failed to record activity:", err.message);
    }
}

module.exports = { recordActivity };

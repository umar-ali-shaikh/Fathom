const activityModel = require("../model/activity.model");
const asyncHandler = require("../utils/asyncHandler");
const serializePublicUser = require("../utils/serializePublicUser");

const ACTOR_FIELDS = "username fullName profileImage isPrivate";

function serializeActivity(item) {
    return {
        id: item._id,
        type: item.type,
        actor: serializePublicUser(item.actor),
        post: item.post ? { id: item.post._id, thumbnailUrl: item.post.imgUrl || null } : null,
        commentPreview: item.commentPreview || null,
        read: item.read,
        createdAt: item.createdAt,
        requestId: item.requestId || undefined,
    };
}

/**
 * GET /api/activity [protected]
 */
const listActivityController = asyncHandler(async function listActivityController(req, res) {
    const items = await activityModel
        .find({ recipient: req.user.id })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate("actor", ACTOR_FIELDS)
        .populate("post", "imgUrl")
        .lean();

    return res.status(200).json({ items: items.map(serializeActivity), nextCursor: null });
});

/**
 * GET /api/activity/unread-count [protected]
 */
const getUnreadCountController = asyncHandler(async function getUnreadCountController(req, res) {
    const count = await activityModel.countDocuments({ recipient: req.user.id, read: false });
    return res.status(200).json({ count });
});

/**
 * POST /api/activity/read [protected]
 */
const markAllReadController = asyncHandler(async function markAllReadController(req, res) {
    await activityModel.updateMany({ recipient: req.user.id, read: false }, { $set: { read: true } });
    return res.status(200).json({ message: "Marked as read" });
});

module.exports = {
    listActivityController,
    getUnreadCountController,
    markAllReadController,
};

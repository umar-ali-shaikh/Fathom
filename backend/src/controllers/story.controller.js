const storyModel = require("../model/story.model");
const followModel = require("../model/follow.model");
const asyncHandler = require("../utils/asyncHandler");
const serializePublicUser = require("../utils/serializePublicUser");
const { ValidationError, NotFoundError, AuthorizationError } = require("../utils/errors");

const AUTHOR_FIELDS = "username fullName profileImage isPrivate";

function serializeStory(story, requesterId) {
    return {
        id: story._id,
        author: serializePublicUser(story.user),
        mediaUrl: story.mediaUrl,
        caption: story.caption || null,
        seen: story.seenBy.some((id) => id.toString() === requesterId),
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
    };
}

/**
 * GET /api/story [protected]
 * Flat list of active statuses from people the viewer follows, plus their
 * own — the client groups them into per-author rails itself.
 */
const getStoryTrayController = asyncHandler(async function getStoryTrayController(req, res) {
    const requesterId = req.user.id;

    const accepted = await followModel.find({ follower: requesterId, status: "accepted" }).select("followee");
    const authorIds = [...accepted.map((f) => f.followee), requesterId];

    const stories = await storyModel
        .find({ user: { $in: authorIds }, expiresAt: { $gt: new Date() } })
        .sort({ createdAt: -1 })
        .populate("user", AUTHOR_FIELDS)
        .lean({ virtuals: false });

    return res.status(200).json({
        items: stories.map((s) => serializeStory({ ...s, seenBy: s.seenBy || [] }, requesterId)),
    });
});

const createStoryController = asyncHandler(async function createStoryController(req, res) {
    const { mediaUrl, caption } = req.body;

    if (typeof mediaUrl !== "string" || !mediaUrl) {
        throw new ValidationError("mediaUrl is required to create a status");
    }
    if (caption !== undefined && (typeof caption !== "string" || caption.length > 2200)) {
        throw new ValidationError("Caption must be 2200 characters or fewer");
    }

    const story = await storyModel.create({
        user: req.user.id,
        mediaUrl,
        caption,
        seenBy: [req.user.id],
    });
    await story.populate("user", AUTHOR_FIELDS);

    return res.status(201).json({
        message: "Status shared",
        story: serializeStory(story.toObject(), req.user.id),
    });
});

const markStorySeenController = asyncHandler(async function markStorySeenController(req, res) {
    const story = await storyModel.findById(req.params.storyId);
    if (!story) {
        throw new NotFoundError("Status not found");
    }

    await storyModel.updateOne(
        { _id: story._id },
        { $addToSet: { seenBy: req.user.id } }
    );

    return res.status(200).json({ message: "Marked as seen" });
});

const deleteStoryController = asyncHandler(async function deleteStoryController(req, res) {
    const story = await storyModel.findById(req.params.storyId);
    if (!story) {
        throw new NotFoundError("Status not found");
    }
    if (story.user.toString() !== req.user.id) {
        throw new AuthorizationError("You can't delete this status");
    }

    await storyModel.findByIdAndDelete(story._id);

    return res.status(200).json({ message: "Status deleted" });
});

module.exports = {
    getStoryTrayController,
    createStoryController,
    markStorySeenController,
    deleteStoryController,
};

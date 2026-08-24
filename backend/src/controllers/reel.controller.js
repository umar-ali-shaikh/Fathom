const reelModel = require("../model/reel.model");
const reelLikeModel = require("../model/reelLike.model");
const userModel = require("../model/user.model");
const followModel = require("../model/follow.model");
const asyncHandler = require("../utils/asyncHandler");
const serializePublicUser = require("../utils/serializePublicUser");
const { recordActivity } = require("../services/activity.service");
const { ValidationError, NotFoundError, AuthorizationError } = require("../utils/errors");

const AUTHOR_FIELDS = "username fullName profileImage isPrivate";

function serializeReel(reel) {
    return {
        id: reel._id,
        author: serializePublicUser(reel.user),
        videoUrl: reel.videoUrl,
        thumbnailUrl: reel.thumbnailUrl || null,
        caption: reel.caption || null,
        likeCount: reel.likesCount ?? 0,
        commentCount: reel.commentsCount ?? 0,
        likedByMe: Boolean(reel.isLiked),
        viewCount: reel.viewCount ?? 0,
        createdAt: reel.createdAt,
    };
}

async function hydrateReels(reels, requesterId) {
    return Promise.all(
        reels.map(async (reel) => {
            const [isLiked, likesCount] = await Promise.all([
                reelLikeModel.findOne({ user: requesterId, reel: reel._id }),
                reelLikeModel.countDocuments({ reel: reel._id }),
            ]);
            return serializeReel({ ...reel, isLiked: !!isLiked, likesCount });
        })
    );
}

/** Same visibility rule as posts: private authors only show to accepted followers. */
async function visibleReels(reels, requesterId) {
    const acceptedFollows = await followModel.find({ follower: requesterId, status: "accepted" }).select("followee");
    const followedIds = new Set(acceptedFollows.map((f) => f.followee.toString()));

    return reels.filter((reel) => {
        if (!reel.user) return false;
        if (reel.user._id.toString() === requesterId) return true;
        if (!reel.user.isPrivate) return true;
        return followedIds.has(reel.user._id.toString());
    });
}

const createReelController = asyncHandler(async function createReelController(req, res) {
    const { caption, videoUrl, thumbnailUrl } = req.body;

    if (typeof videoUrl !== "string" || !videoUrl) {
        throw new ValidationError("videoUrl is required to create a reel");
    }
    if (caption !== undefined && (typeof caption !== "string" || caption.length > 2200)) {
        throw new ValidationError("Caption must be 2200 characters or fewer");
    }

    const reel = await reelModel.create({
        caption,
        videoUrl,
        thumbnailUrl,
        user: req.user.id,
    });
    await reel.populate("user", AUTHOR_FIELDS);

    return res.status(201).json({
        message: "Reel shared",
        reel: serializeReel({ ...reel.toObject(), isLiked: false, likesCount: 0 }),
    });
});

const getReelFeedController = asyncHandler(async function getReelFeedController(req, res) {
    const requesterId = req.user.id;

    const reels = await reelModel
        .find()
        .sort({ createdAt: -1 })
        .populate("user", AUTHOR_FIELDS)
        .lean();

    const visible = await visibleReels(reels, requesterId);

    return res.status(200).json({
        items: await hydrateReels(visible, requesterId),
        nextCursor: null,
    });
});

const getReelDetailController = asyncHandler(async function getReelDetailController(req, res) {
    const requesterId = req.user.id;
    const reel = await reelModel.findById(req.params.reelId).populate("user", AUTHOR_FIELDS).lean();
    if (!reel) {
        throw new NotFoundError("Reel not found");
    }

    const [visible] = await visibleReels([reel], requesterId);
    if (!visible) {
        throw new AuthorizationError("This account is private.");
    }

    const [isLiked, likesCount] = await Promise.all([
        reelLikeModel.findOne({ user: requesterId, reel: reel._id }),
        reelLikeModel.countDocuments({ reel: reel._id }),
    ]);

    return res.status(200).json({
        reel: serializeReel({ ...reel, isLiked: !!isLiked, likesCount }),
    });
});

const updateReelController = asyncHandler(async function updateReelController(req, res) {
    const { caption } = req.body;
    const reel = await reelModel.findById(req.params.reelId);
    if (!reel) {
        throw new NotFoundError("Reel not found");
    }
    if (reel.user.toString() !== req.user.id) {
        throw new AuthorizationError("You can't edit this reel");
    }

    if (caption !== undefined) reel.caption = caption;
    await reel.save();
    await reel.populate("user", AUTHOR_FIELDS);

    const [isLiked, likesCount] = await Promise.all([
        reelLikeModel.findOne({ user: req.user.id, reel: reel._id }),
        reelLikeModel.countDocuments({ reel: reel._id }),
    ]);

    return res.status(200).json({
        message: "Reel updated",
        reel: serializeReel({ ...reel.toObject(), isLiked: !!isLiked, likesCount }),
    });
});

const deleteReelController = asyncHandler(async function deleteReelController(req, res) {
    const reel = await reelModel.findById(req.params.reelId);
    if (!reel) {
        throw new NotFoundError("Reel not found");
    }
    if (reel.user.toString() !== req.user.id) {
        throw new AuthorizationError("You can't delete this reel");
    }

    await Promise.all([
        reelLikeModel.deleteMany({ reel: reel._id }),
        reelModel.findByIdAndDelete(reel._id),
    ]);

    return res.status(200).json({ message: "Reel deleted" });
});

const likeReelController = asyncHandler(async function likeReelController(req, res) {
    const userId = req.user.id;
    const { reelId } = req.params;

    const reel = await reelModel.findById(reelId);
    if (!reel) {
        throw new NotFoundError("Reel not found");
    }

    try {
        await reelLikeModel.create({ user: userId, reel: reelId });
    } catch (err) {
        if (err.code !== 11000) throw err;
    }

    const likeCount = await reelLikeModel.countDocuments({ reel: reelId });

    await recordActivity({
        type: "like",
        actor: userId,
        recipient: reel.user,
        post: null,
    });

    return res.status(200).json({ success: true, isLiked: true, likeCount });
});

const unlikeReelController = asyncHandler(async function unlikeReelController(req, res) {
    const userId = req.user.id;
    const { reelId } = req.params;

    const reel = await reelModel.findById(reelId);
    if (!reel) {
        throw new NotFoundError("Reel not found");
    }

    await reelLikeModel.findOneAndDelete({ user: userId, reel: reelId });
    const likeCount = await reelLikeModel.countDocuments({ reel: reelId });

    return res.status(200).json({ success: true, isLiked: false, likeCount });
});

/** GET /api/reel/user/:username [protected] — mirrors the post grid endpoint. */
const getUserReelsController = asyncHandler(async function getUserReelsController(req, res) {
    const requesterId = req.user.id;
    const { username } = req.params;

    const targetUser = await userModel.findOne({ username });
    if (!targetUser) {
        throw new NotFoundError("User not found");
    }

    const isOwnProfile = targetUser._id.toString() === requesterId;
    if (targetUser.isPrivate && !isOwnProfile) {
        const followRecord = await followModel.findOne({
            follower: requesterId,
            followee: targetUser._id,
            status: "accepted",
        });
        if (!followRecord) {
            throw new AuthorizationError("This account is private.");
        }
    }

    const reels = await reelModel.find({ user: targetUser._id }).sort({ createdAt: -1 }).lean();
    const withAuthor = reels.map((reel) => ({ ...reel, user: targetUser }));

    return res.status(200).json({
        items: await hydrateReels(withAuthor, requesterId),
        nextCursor: null,
    });
});

module.exports = {
    createReelController,
    getReelFeedController,
    getReelDetailController,
    updateReelController,
    deleteReelController,
    likeReelController,
    unlikeReelController,
    getUserReelsController,
};

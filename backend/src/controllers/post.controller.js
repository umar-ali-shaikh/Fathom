const postModel = require("../model/post.model");
const likeModel = require("../model/like.model");
const commentModel = require("../model/comment.model");
const userModel = require("../model/user.model");
const followModel = require("../model/follow.model");
const asyncHandler = require("../utils/asyncHandler");
const imageKit = require("../utils/imagekit");
const serializePost = require("../utils/serializePost");
const { recordActivity } = require("../services/activity.service");
const { ValidationError, NotFoundError, AuthorizationError } = require("../utils/errors");

const POST_AUTHOR_FIELDS = "username fullName profileImage isPrivate";

/**
 * POST /api/post [protected]
 * body: { caption?, imageUrls: string[] } — the image is uploaded first via
 * POST /api/upload; only the resulting URL is sent here. The backend only
 * stores one image per post, so imageUrls[0] is used and any extras are
 * ignored (no multi-image support yet).
 */
const createPostController = asyncHandler(async function createPostController(req, res) {
    const { caption, imageUrls } = req.body;

    if (!Array.isArray(imageUrls) || imageUrls.length === 0 || typeof imageUrls[0] !== "string") {
        throw new ValidationError("At least one image is required to create a post");
    }

    const post = await postModel.create({
        caption,
        imgUrl: imageUrls[0],
        user: req.user.id,
    });

    await post.populate("user", POST_AUTHOR_FIELDS);

    res.status(201).json({
        message: "Post created successfully",
        post: serializePost({
            ...post.toObject(),
            isLiked: false,
            likesCount: 0,
        }),
    });
});

const getPostController = asyncHandler(async function getPostController(req, res) {
    const userId = req.user.id;

    const posts = await postModel.find({
        user: userId
    })

    res.status(200).json({
        message: "Post fetch successfully",
        posts
    })
});

/**
 * Loads a post and enforces that the requester may see it (owner, or an
 * accepted follower when the author is private). Shared by detail/update/delete.
 */
async function loadVisiblePost(requesterId, postId, { withImageId = false } = {}) {
    let query = postModel.findById(postId).populate("user", POST_AUTHOR_FIELDS);
    if (withImageId) query = query.select("+imageId");

    const post = await query.lean();

    if (!post) {
        throw new NotFoundError("Post not found.");
    }

    const isOwnPost = post.user._id.toString() === requesterId;

    if (post.user.isPrivate && !isOwnPost) {
        const followRecord = await followModel.findOne({
            follower: requesterId,
            followee: post.user._id,
            status: "accepted",
        });

        if (!followRecord) {
            throw new AuthorizationError("This account is private.");
        }
    }

    return { post, isOwnPost };
}

const getPostDetailController = asyncHandler(async function getPostDetailController(req, res) {
    const userId = req.user.id;
    const postId = req.params.postId

    const { post } = await loadVisiblePost(userId, postId);

    const [isLiked, likesCount] = await Promise.all([
        likeModel.findOne({ user: userId, post: post._id }),
        likeModel.countDocuments({ post: post._id }),
    ]);

    return res.status(200).json({
        message: "Post fetched successfully.",
        post: serializePost({ ...post, isLiked: !!isLiked, likesCount }),
    })
});

const updatePostController = asyncHandler(async function updatePostController(req, res) {
    const { postId } = req.params;
    const { caption } = req.body;

    const post = await postModel.findById(postId);
    if (!post) {
        throw new NotFoundError("Post not found.");
    }
    if (post.user.toString() !== req.user.id) {
        throw new AuthorizationError("You can't edit this post");
    }

    if (caption !== undefined) post.caption = caption;
    await post.save();
    await post.populate("user", POST_AUTHOR_FIELDS);

    const [isLiked, likesCount] = await Promise.all([
        likeModel.findOne({ user: req.user.id, post: post._id }),
        likeModel.countDocuments({ post: post._id }),
    ]);

    return res.status(200).json({
        message: "Post updated successfully",
        post: serializePost({ ...post.toObject(), isLiked: !!isLiked, likesCount }),
    });
});

const deletePostController = asyncHandler(async function deletePostController(req, res) {
    const { postId } = req.params;

    const post = await postModel.findById(postId).select("+imageId");
    if (!post) {
        throw new NotFoundError("Post not found.");
    }
    if (post.user.toString() !== req.user.id) {
        throw new AuthorizationError("You can't delete this post");
    }

    // Best-effort cascading cleanup — not wrapped in a transaction since this
    // deployment doesn't run Mongo as a replica set. Order doesn't matter for
    // correctness: worst case a like/comment briefly outlives its post.
    await Promise.all([
        likeModel.deleteMany({ post: post._id }),
        commentModel.deleteMany({ post: post._id }),
        postModel.findByIdAndDelete(post._id),
    ]);

    if (post.imageId) {
        imageKit.files.delete(post.imageId).catch((err) => {
            console.error("Failed to delete orphaned ImageKit file:", err.message);
        });
    }

    return res.status(200).json({ message: "Post deleted successfully" });
});

const likePostController = asyncHandler(async function likePostController(req, res) {
    const userId = req.user.id;
    const postId = req.params.postId;

    const post = await postModel.findById(postId);
    if (!post) {
        throw new NotFoundError("Post not found");
    }

    const existingLike = await likeModel.findOne({
        user: userId,
        post: postId,
    });

    if (existingLike) {
        return res.status(200).json({
            success: true,
            message: "Post already liked",
            isLiked: true,
            likeCount: await likeModel.countDocuments({ post: postId }),
        });
    }

    try {
        await likeModel.create({ user: userId, post: postId });
    } catch (err) {
        if (err.code !== 11000) throw err; // concurrent duplicate like; treat as already-liked below
    }

    const totalLikes = await likeModel.countDocuments({ post: postId });

    await recordActivity({
        type: "like",
        actor: userId,
        recipient: post.user,
        post: post._id,
    });

    return res.status(200).json({
        success: true,
        message: "Post liked successfully",
        isLiked: true,
        likeCount: totalLikes,
    });
});

const unlikePostController = asyncHandler(async function unlikePostController(req, res) {
    const userId = req.user.id;
    const postId = req.params.postId;

    const post = await postModel.findById(postId);
    if (!post) {
        throw new NotFoundError("Post not found");
    }

    await likeModel.findOneAndDelete({ user: userId, post: postId });

    const totalLikes = await likeModel.countDocuments({ post: postId });

    return res.status(200).json({
        success: true,
        message: "Post unliked successfully",
        isLiked: false,
        likeCount: totalLikes,
    });
});

/** Attaches isLiked/likesCount for the requester and serializes each post. */
async function hydrateFeed(posts, requesterId) {
    return Promise.all(
        posts.map(async (post) => {
            const [isLiked, likesCount] = await Promise.all([
                likeModel.findOne({ user: requesterId, post: post._id }),
                likeModel.countDocuments({ post: post._id }),
            ]);
            return serializePost({ ...post, isLiked: !!isLiked, likesCount });
        })
    );
}

const getFeedController = asyncHandler(async function getFeedController(req, res) {
    const user = req.user;

    const posts = await postModel
        .find()
        .sort({ createdAt: -1 })
        .populate("user", POST_AUTHOR_FIELDS)
        .lean();

    return res.status(200).json({
        message: "Posts fetched successfully.",
        items: await hydrateFeed(posts, user.id),
        nextCursor: null,
    });
});

/**
 * GET /api/post/explore [protected]
 * Discovery feed: public posts (or private accounts the requester already
 * follows), ranked by likes rather than recency.
 */
const getExploreController = asyncHandler(async function getExploreController(req, res) {
    const requesterId = req.user.id;

    const acceptedFollows = await followModel
        .find({ follower: requesterId, status: "accepted" })
        .select("followee");
    const followedIds = acceptedFollows.map((f) => f.followee);

    const posts = await postModel
        .find()
        .populate("user", POST_AUTHOR_FIELDS)
        .lean();

    const visible = posts.filter((post) => {
        if (!post.user) return false;
        if (post.user._id.toString() === requesterId) return true;
        if (!post.user.isPrivate) return true;
        return followedIds.some((id) => id.toString() === post.user._id.toString());
    });

    const hydrated = await hydrateFeed(visible, requesterId);
    hydrated.sort((a, b) => b.likeCount - a.likeCount || (a.createdAt < b.createdAt ? 1 : -1));

    return res.status(200).json({
        message: "Explore fetched successfully.",
        items: hydrated,
        nextCursor: null,
    });
});


/**
 * GET /api/post/user/:username [protected]
 * Privacy-aware grid feed for a profile: 403s if the target account is
 * private and the requester isn't the owner or an accepted follower.
 */
const getUserPostsController = asyncHandler(async function getUserPostsController(req, res) {
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

    const posts = await postModel
        .find({ user: targetUser._id })
        .sort({ createdAt: -1 })
        .lean();

    const postsWithAuthor = posts.map((post) => ({ ...post, user: targetUser }));

    return res.status(200).json({
        message: "Posts fetched successfully.",
        items: await hydrateFeed(postsWithAuthor, requesterId),
        nextCursor: null,
    });
});

module.exports = {
    createPostController,
    getPostController,
    getPostDetailController,
    updatePostController,
    deletePostController,
    likePostController,
    unlikePostController,
    getFeedController,
    getExploreController,
    getUserPostsController,
};

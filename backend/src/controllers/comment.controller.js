const commentModel = require("../model/comment.model");
const postModel = require("../model/post.model");
const followModel = require("../model/follow.model");
const asyncHandler = require("../utils/asyncHandler");
const serializeComment = require("../utils/serializeComment");
const { recordActivity } = require("../services/activity.service");
const { NotFoundError, AuthorizationError } = require("../utils/errors");

const COMMENT_USER_FIELDS = "username fullName profileImage isPrivate";

/**
 * Shared gate: comments are only visible/writable to people who could see
 * the post itself — mirrors the privacy check in getUserPostsController.
 */
async function assertPostVisible(requesterId, postId) {
    const post = await postModel.findById(postId).populate("user", "isPrivate");

    if (!post) {
        throw new NotFoundError("Post not found");
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

    return post;
}

/**
 * GET /api/comment/post/:postId?parent=:commentId
 * No parent query -> top-level comments, each carrying a repliesCount.
 * With parent query -> the flat reply thread for that one comment.
 */
const getCommentsController = asyncHandler(async function getCommentsController(req, res) {
    const { postId } = req.params;
    const { parent } = req.query;

    await assertPostVisible(req.user.id, postId);

    const comments = await commentModel
        .find({ post: postId, parent: parent || null })
        .sort({ createdAt: 1 })
        .populate("user", COMMENT_USER_FIELDS)
        .lean();

    let repliesCountByParent = {};
    if (!parent) {
        const topLevelIds = comments.map((c) => c._id);
        const counts = await commentModel.aggregate([
            { $match: { parent: { $in: topLevelIds }, isDeleted: false } },
            { $group: { _id: "$parent", count: { $sum: 1 } } },
        ]);
        repliesCountByParent = Object.fromEntries(
            counts.map((c) => [c._id.toString(), c.count])
        );
    }

    const items = comments.map((c) =>
        serializeComment({
            ...c,
            repliesCount: parent ? undefined : repliesCountByParent[c._id.toString()] || 0,
        })
    );

    return res.status(200).json({ items });
});

const createCommentController = asyncHandler(async function createCommentController(req, res) {
    const { postId } = req.params;
    const { body, parent } = req.body;

    const post = await assertPostVisible(req.user.id, postId);

    if (parent) {
        const parentComment = await commentModel.findOne({ _id: parent, post: postId });
        if (!parentComment) {
            throw new NotFoundError("Comment being replied to no longer exists");
        }
    }

    const comment = await commentModel.create({
        post: postId,
        user: req.user.id,
        parent: parent || null,
        body,
    });

    await postModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    await comment.populate("user", COMMENT_USER_FIELDS);

    await recordActivity({
        type: "comment",
        actor: req.user.id,
        recipient: post.user._id,
        post: postId,
        commentPreview: comment.body.slice(0, 140),
    });

    return res.status(201).json({
        message: "Comment posted",
        comment: serializeComment(comment.toObject()),
    });
});

const editCommentController = asyncHandler(async function editCommentController(req, res) {
    const { commentId } = req.params;
    const { body } = req.body;

    const comment = await commentModel.findById(commentId);
    if (!comment || comment.isDeleted) {
        throw new NotFoundError("Comment not found");
    }
    if (comment.user.toString() !== req.user.id) {
        throw new AuthorizationError("You can't edit this comment");
    }

    comment.body = body;
    await comment.save();
    await comment.populate("user", COMMENT_USER_FIELDS);

    return res.status(200).json({ message: "Comment updated", comment: serializeComment(comment.toObject()) });
});

const deleteCommentController = asyncHandler(async function deleteCommentController(req, res) {
    const { commentId } = req.params;

    const comment = await commentModel.findById(commentId).populate("post", "user");
    if (!comment || comment.isDeleted) {
        throw new NotFoundError("Comment not found");
    }

    const isCommentOwner = comment.user.toString() === req.user.id;
    const isPostOwner = comment.post.user.toString() === req.user.id;

    if (!isCommentOwner && !isPostOwner) {
        throw new AuthorizationError("You can't delete this comment");
    }

    comment.isDeleted = true;
    comment.body = "";
    await comment.save();

    await postModel.findByIdAndUpdate(comment.post._id, { $inc: { commentsCount: -1 } });

    return res.status(200).json({ message: "Comment deleted" });
});

module.exports = {
    getCommentsController,
    createCommentController,
    editCommentController,
    deleteCommentController,
};

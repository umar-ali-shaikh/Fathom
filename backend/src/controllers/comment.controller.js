const commentModel = require("../model/comment.model");
const postModel = require("../model/post.model");
const followModel = require("../model/follow.model");

const COMMENT_USER_FIELDS = "username profileImage";

/**
 * Shared gate: comments are only visible/writable to people who could see
 * the post itself — mirrors the privacy check in getUserPostsController.
 */
async function assertPostVisible(requesterId, postId) {
    const post = await postModel.findById(postId).populate("user", "isPrivate");

    if (!post) {
        return { error: { status: 404, message: "Post not found" } };
    }

    const isOwnPost = post.user._id.toString() === requesterId;

    if (post.user.isPrivate && !isOwnPost) {
        const followRecord = await followModel.findOne({
            follower: requesterId,
            followee: post.user._id,
            status: "accepted",
        });

        if (!followRecord) {
            return { error: { status: 403, message: "This account is private." } };
        }
    }

    return { post };
}

/**
 * GET /api/comment/post/:postId?parent=:commentId
 * No parent query -> top-level comments, each carrying a repliesCount.
 * With parent query -> the flat reply thread for that one comment.
 */
async function getCommentsController(req, res) {
    try {
        const { postId } = req.params;
        const { parent } = req.query;

        const { error } = await assertPostVisible(req.user.id, postId);
        if (error) return res.status(error.status).json({ message: error.message });

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

        const result = comments.map((c) => ({
            ...c,
            body: c.isDeleted ? "" : c.body,
            ...(parent ? {} : { repliesCount: repliesCountByParent[c._id.toString()] || 0 }),
        }));

        return res.status(200).json({ comments: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function createCommentController(req, res) {
    try {
        const { postId } = req.params;
        const { body, parent } = req.body;

        if (!body || !body.trim()) {
            return res.status(400).json({ message: "Comment can't be empty" });
        }

        const { error } = await assertPostVisible(req.user.id, postId);
        if (error) return res.status(error.status).json({ message: error.message });

        if (parent) {
            const parentComment = await commentModel.findOne({ _id: parent, post: postId });
            if (!parentComment) {
                return res.status(404).json({ message: "Comment being replied to no longer exists" });
            }
        }

        const comment = await commentModel.create({
            post: postId,
            user: req.user.id,
            parent: parent || null,
            body: body.trim(),
        });

        await postModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

        await comment.populate("user", COMMENT_USER_FIELDS);

        return res.status(201).json({
            message: "Comment posted",
            comment,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function deleteCommentController(req, res) {
    try {
        const { commentId } = req.params;

        const comment = await commentModel.findById(commentId).populate("post", "user");
        if (!comment || comment.isDeleted) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const isCommentOwner = comment.user.toString() === req.user.id;
        const isPostOwner = comment.post.user.toString() === req.user.id;

        if (!isCommentOwner && !isPostOwner) {
            return res.status(403).json({ message: "You can't delete this comment" });
        }

        comment.isDeleted = true;
        comment.body = "";
        await comment.save();

        await postModel.findByIdAndUpdate(comment.post._id, { $inc: { commentsCount: -1 } });

        return res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    getCommentsController,
    createCommentController,
    deleteCommentController,
};

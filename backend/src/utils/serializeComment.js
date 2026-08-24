const serializePublicUser = require("./serializePublicUser");

function serializeComment(comment) {
    return {
        id: comment._id,
        postId: comment.post,
        parentId: comment.parent || null,
        author: comment.isDeleted ? null : serializePublicUser(comment.user),
        body: comment.isDeleted ? null : comment.body,
        deleted: Boolean(comment.isDeleted),
        createdAt: comment.createdAt,
        repliesCount: comment.repliesCount,
    };
}

module.exports = serializeComment;

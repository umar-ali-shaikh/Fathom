const serializePublicUser = require("./serializePublicUser");

// Maps a post document (lean or hydrated, with `user` populated and
// `isLiked`/`likesCount` attached by the caller) to the frontend's `Post`
// shape. The backend only ever stores one image per post; the frontend
// treats that as a 1-length `images` array rather than the multi-image
// gallery its type suggests — there is no multi-image upload path.
function serializePost(post) {
    return {
        id: post._id,
        caption: post.caption || null,
        images: post.imgUrl ? [{ url: post.imgUrl }] : [],
        author: serializePublicUser(post.user),
        likeCount: post.likesCount ?? 0,
        commentCount: post.commentsCount ?? 0,
        likedByMe: Boolean(post.isLiked),
        createdAt: post.createdAt,
    };
}

module.exports = serializePost;

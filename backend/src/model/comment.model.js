const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts",
        required: [true, "post id is required for creating a comment"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "user id is required for creating a comment"]
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
        default: null
    },
    body: {
        // Not schema-`required`: createCommentController already rejects an
        // empty body, and deleteCommentController clears body to "" on soft
        // delete — a `required` validator here would reject that write.
        type: String,
        default: "",
        maxlength: 2200
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

commentSchema.index({ post: 1, parent: 1, createdAt: 1 })

const commentModel = mongoose.model("comments", commentSchema);

module.exports = commentModel;

const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts",
        required: [true, "post id is required for creating a like"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "User id is required"],
    },
}, {
    timestamps: true,
})

likeSchema.index({ post: 1, user: 1 }, { unique: true })

const likeModel = mongoose.model("likes", likeSchema);

module.exports = likeModel;
const mongoose = require("mongoose");


const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        default: ""
    },
    imgUrl: {
        type: String,
        required: [true, "imgUrl is required for creating an post"]
    },
    imageId: {
        // ImageKit fileId, kept so the stored image can be removed from
        // ImageKit when the post is deleted instead of becoming orphaned.
        type: String,
        select: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "user id is required for creating an post"]
    },
    commentsCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const postModel = mongoose.model("posts", postSchema);

module.exports = postModel
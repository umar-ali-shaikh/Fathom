const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema({
    caption: {
        type: String,
        default: "",
    },
    videoUrl: {
        type: String,
        required: [true, "videoUrl is required for creating a reel"],
    },
    thumbnailUrl: {
        type: String,
        default: null,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "user id is required for creating a reel"],
    },
    commentsCount: {
        type: Number,
        default: 0,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const reelModel = mongoose.model("reels", reelSchema);

module.exports = reelModel;

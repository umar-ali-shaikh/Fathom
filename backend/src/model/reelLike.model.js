const mongoose = require("mongoose");

const reelLikeSchema = new mongoose.Schema({
    reel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reels",
        required: [true, "reel id is required for creating a like"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "User id is required"],
    },
}, {
    timestamps: true,
})

reelLikeSchema.index({ reel: 1, user: 1 }, { unique: true })

const reelLikeModel = mongoose.model("reel_likes", reelLikeSchema);

module.exports = reelLikeModel;

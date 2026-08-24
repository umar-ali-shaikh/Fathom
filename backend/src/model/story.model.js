const mongoose = require("mongoose");

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "user id is required for creating a status"],
    },
    mediaUrl: {
        type: String,
        required: [true, "mediaUrl is required for creating a status"],
    },
    caption: {
        type: String,
        default: "",
    },
    seenBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }],
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + STORY_TTL_MS),
    },
}, { timestamps: true });

// TTL index — MongoDB auto-deletes the document once expiresAt passes.
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const storyModel = mongoose.model("stories", storySchema);

module.exports = storyModel;

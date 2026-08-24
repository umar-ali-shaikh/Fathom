const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    // Who the notification is for.
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "Recipient is required"],
    },
    // Who caused it.
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "Actor is required"],
    },
    type: {
        type: String,
        enum: ["like", "comment", "follow", "follow_request", "mention"],
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts",
        default: null,
    },
    commentPreview: {
        type: String,
        default: null,
    },
    // Set only for follow_request entries; lets the client accept/reject
    // directly from the activity feed without a second lookup.
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

activitySchema.index({ recipient: 1, createdAt: -1 });

const activityModel = mongoose.model("activities", activitySchema);

module.exports = activityModel;

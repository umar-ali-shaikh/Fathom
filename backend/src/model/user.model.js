const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "User name already exists"],
        required: [true, "User name is required"]
    },
    email: {
        type: String,
        unique: [true, "Email already exists"],
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        // Not required for Google accounts, which authenticate via OAuth and
        // never have a local password.
        required: [
            function passwordRequired() { return this.authProvider === "local"; },
            "Password is required"
        ],
        select: false,
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    bio: String,
    fullName: String,
    isPrivate: {
        type: Boolean,
        default: false,
    },
    activityNotifications: {
        type: Boolean,
        default: true,
    },
    profileImage: {
        type: String,
        default: "https://ik.imagekit.io/nqkixyqqh/image.png",
    }
});


const userModel = mongoose.model("users", userSchema)
module.exports = userModel
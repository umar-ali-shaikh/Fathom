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
        required: [true, "Password is required"],
    select: false,
    },
    bio: String,
    fullName: String,
    isPrivate: {
        type: Boolean,
        default: false,
    },
    profileImage: {
        type: String,
        default: "https://ik.imagekit.io/nqkixyqqh/image.png",
    }
});


const userModel = mongoose.model("users", userSchema)
module.exports = userModel
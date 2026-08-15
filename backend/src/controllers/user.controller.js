const followModel = require("../model/follow.model")
const userModel = require("../model/user.model")
const postModel = require("../model/post.model")

const PROFILE_FIELDS = "username fullName bio profileImage isPrivate";

async function followUserController(req, res) {
    try {
        const followerId = req.user.id;
        const followeeId = req.params.userId;

        if (followerId === followeeId) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            })
        }

        const followee = await userModel.findById(followeeId);

        if (!followee) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const existingFollow = await followModel.findOne({
            follower: followerId,
            followee: followeeId,
        })

        if (existingFollow) {
            return res.status(409).json({
                message: existingFollow.status === "pending"
                    ? "Follow request already sent"
                    : "You are already following this user"
            })
        }

        const followRecord = await followModel.create({
            follower: followerId,
            followee: followeeId,
            status: followee.isPrivate ? "pending" : "accepted"
        });

        return res.status(201).json({
            message: followRecord.status === "pending"
                ? "Follow request sent"
                : "You are now following this user",
            follow: followRecord
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


async function unFollowUserController(req, res) {
    try {
        const followerId = req.user.id;
        const followeeId = req.params.userId;

        const isUserFollowing = await followModel.findOne({
            follower: followerId,
            followee: followeeId,
        })

        if (!isUserFollowing) {
            return res.status(200).json({
                message: "You are not following this user"
            })
        }

        await followModel.findByIdAndDelete(isUserFollowing._id)

        return res.status(200).json({
            message: "You have unfollowed this user"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

/**
 * GET /api/user/:username
 * Privacy-aware public profile: locked (no posts/full follower access) when
 * the target is private and the requester isn't the owner or an accepted follower.
 */
async function getPublicProfileController(req, res) {
    try {
        const requesterId = req.user.id;
        const { username } = req.params;

        const user = await userModel.findOne({ username }).select(PROFILE_FIELDS);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const isOwnProfile = user._id.toString() === requesterId;

        let followStatus = null;
        if (!isOwnProfile) {
            const followRecord = await followModel.findOne({
                follower: requesterId,
                followee: user._id,
            });
            followStatus = followRecord ? followRecord.status : null;
        }

        const isLocked = user.isPrivate && !isOwnProfile && followStatus !== "accepted";

        const [postsCount, followersCount, followingCount] = await Promise.all([
            postModel.countDocuments({ user: user._id }),
            followModel.countDocuments({ followee: user._id, status: "accepted" }),
            followModel.countDocuments({ follower: user._id, status: "accepted" }),
        ]);

        return res.status(200).json({
            profile: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                bio: user.bio,
                profileImage: user.profileImage,
                isPrivate: user.isPrivate,
                isOwnProfile,
                followStatus,
                isLocked,
                postsCount,
                followersCount,
                followingCount,
            }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

/**
 * Shared helper for followers/following lists — both need the same
 * "is this profile visible to me" gate before returning anything.
 */
async function assertProfileVisible(requesterId, username) {
    const user = await userModel.findOne({ username }).select(PROFILE_FIELDS);

    if (!user) {
        return { error: { status: 404, message: "User not found" } };
    }

    const isOwnProfile = user._id.toString() === requesterId;

    if (user.isPrivate && !isOwnProfile) {
        const followRecord = await followModel.findOne({
            follower: requesterId,
            followee: user._id,
            status: "accepted",
        });

        if (!followRecord) {
            return { error: { status: 403, message: "This account is private." } };
        }
    }

    return { user };
}

async function getFollowersController(req, res) {
    try {
        const { user, error } = await assertProfileVisible(req.user.id, req.params.username);
        if (error) return res.status(error.status).json({ message: error.message });

        const follows = await followModel
            .find({ followee: user._id, status: "accepted" })
            .populate("follower", PROFILE_FIELDS)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            followers: follows.map((f) => f.follower)
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

async function getFollowingController(req, res) {
    try {
        const { user, error } = await assertProfileVisible(req.user.id, req.params.username);
        if (error) return res.status(error.status).json({ message: error.message });

        const follows = await followModel
            .find({ follower: user._id, status: "accepted" })
            .populate("followee", PROFILE_FIELDS)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            following: follows.map((f) => f.followee)
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

async function updateMeController(req, res) {
    try {
        const { fullName, bio, profileImage, isPrivate } = req.body;

        const update = {};
        if (fullName !== undefined) update.fullName = fullName;
        if (bio !== undefined) update.bio = bio;
        if (profileImage !== undefined) update.profileImage = profileImage;
        if (isPrivate !== undefined) update.isPrivate = isPrivate;

        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            { $set: update },
            { returnDocument: "after", runValidators: true }
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                bio: user.bio,
                profileImage: user.profileImage,
                isPrivate: user.isPrivate,
            }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

async function listFollowRequestsController(req, res) {
    try {
        const requests = await followModel
            .find({ followee: req.user.id, status: "pending" })
            .populate("follower", PROFILE_FIELDS)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            requests: requests.map((r) => ({
                id: r._id,
                user: r.follower,
                requestedAt: r.createdAt,
            }))
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

async function acceptFollowRequestController(req, res) {
    try {
        const followRecord = await followModel.findOne({
            follower: req.params.userId,
            followee: req.user.id,
            status: "pending",
        });

        if (!followRecord) {
            return res.status(404).json({ message: "Follow request not found" })
        }

        followRecord.status = "accepted";
        await followRecord.save();

        return res.status(200).json({ message: "Follow request accepted" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

async function rejectFollowRequestController(req, res) {
    try {
        const followRecord = await followModel.findOneAndDelete({
            follower: req.params.userId,
            followee: req.user.id,
            status: "pending",
        });

        if (!followRecord) {
            return res.status(404).json({ message: "Follow request not found" })
        }

        return res.status(200).json({ message: "Follow request rejected" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = {
    followUserController,
    unFollowUserController,
    getPublicProfileController,
    getFollowersController,
    getFollowingController,
    updateMeController,
    listFollowRequestsController,
    acceptFollowRequestController,
    rejectFollowRequestController,
}

const followModel = require("../model/follow.model")
const userModel = require("../model/user.model")
const postModel = require("../model/post.model")
const asyncHandler = require("../utils/asyncHandler");
const serializeUser = require("../utils/serializeUser");
const serializePublicUser = require("../utils/serializePublicUser");
const { recordActivity } = require("../services/activity.service");
const { ValidationError, NotFoundError, ConflictError, AuthorizationError } = require("../utils/errors");

const PROFILE_FIELDS = "username fullName bio profileImage isPrivate";

/** Resolves :userId or :username (whichever the route was matched with) to a followee id. */
async function resolveFolloweeId(req) {
    if (req.params.userId) return req.params.userId;

    const target = await userModel.findOne({ username: req.params.username }).select("_id");
    if (!target) {
        throw new NotFoundError("User not found");
    }
    return target._id.toString();
}

const followUserController = asyncHandler(async function followUserController(req, res) {
    const followerId = req.user.id;
    const followeeId = await resolveFolloweeId(req);

    if (followerId === followeeId) {
        throw new ValidationError("You cannot follow yourself");
    }

    const followee = await userModel.findById(followeeId);
    if (!followee) {
        throw new NotFoundError("User not found");
    }

    const existingFollow = await followModel.findOne({
        follower: followerId,
        followee: followeeId,
    })

    if (existingFollow) {
        throw new ConflictError(
            existingFollow.status === "pending"
                ? "Follow request already sent"
                : "You are already following this user"
        );
    }

    let followRecord;
    try {
        followRecord = await followModel.create({
            follower: followerId,
            followee: followeeId,
            status: followee.isPrivate ? "pending" : "accepted"
        });
    } catch (err) {
        // Unique index catches the case where a concurrent request won the
        // race between the findOne check above and this create.
        if (err.code === 11000) {
            throw new ConflictError("You are already following this user");
        }
        throw err;
    }

    await recordActivity({
        type: followRecord.status === "pending" ? "follow_request" : "follow",
        actor: followerId,
        recipient: followeeId,
        requestId: followRecord.status === "pending" ? followerId : null,
    });

    return res.status(201).json({
        message: followRecord.status === "pending"
            ? "Follow request sent"
            : "You are now following this user",
        status: followRecord.status === "pending" ? "requested" : "following",
        follow: followRecord
    })
});


const unFollowUserController = asyncHandler(async function unFollowUserController(req, res) {
    const followerId = req.user.id;
    const followeeId = await resolveFolloweeId(req);

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
});

/**
 * GET /api/user/:username
 * Flat `User`-shaped profile (matches the frontend's `User` type) with
 * viewer-relative fields computed per-request — they depend on who's asking,
 * so they can't live on the user document itself.
 */
const getPublicProfileController = asyncHandler(async function getPublicProfileController(req, res) {
    const requesterId = req.user.id;
    const { username } = req.params;

    const user = await userModel.findOne({ username }).select(PROFILE_FIELDS);
    if (!user) {
        throw new NotFoundError("User not found");
    }

    const isSelf = user._id.toString() === requesterId;

    let followStatus = null;
    if (!isSelf) {
        const followRecord = await followModel.findOne({
            follower: requesterId,
            followee: user._id,
        });
        followStatus = followRecord ? followRecord.status : null;
    }

    const isFollowing = followStatus === "accepted";
    const hasRequestedFollow = followStatus === "pending";
    const canViewPosts = isSelf || !user.isPrivate || isFollowing;

    const [postsCount, followersCount, followingCount] = await Promise.all([
        postModel.countDocuments({ user: user._id }),
        followModel.countDocuments({ followee: user._id, status: "accepted" }),
        followModel.countDocuments({ follower: user._id, status: "accepted" }),
    ]);

    return res.status(200).json({
        ...serializePublicUser(user),
        isSelf,
        isFollowing,
        hasRequestedFollow,
        canViewPosts,
        stats: {
            posts: postsCount,
            followers: followersCount,
            following: followingCount,
        },
    })
});

/**
 * Shared helper for followers/following lists — both need the same
 * "is this profile visible to me" gate before returning anything.
 */
async function assertProfileVisible(requesterId, username) {
    const user = await userModel.findOne({ username }).select(PROFILE_FIELDS);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    const isOwnProfile = user._id.toString() === requesterId;

    if (user.isPrivate && !isOwnProfile) {
        const followRecord = await followModel.findOne({
            follower: requesterId,
            followee: user._id,
            status: "accepted",
        });

        if (!followRecord) {
            throw new AuthorizationError("This account is private.");
        }
    }

    return user;
}

const getFollowersController = asyncHandler(async function getFollowersController(req, res) {
    const user = await assertProfileVisible(req.user.id, req.params.username);

    const follows = await followModel
        .find({ followee: user._id, status: "accepted" })
        .populate("follower", PROFILE_FIELDS)
        .sort({ createdAt: -1 });

    return res.status(200).json({
        items: follows.map((f) => serializePublicUser(f.follower))
    })
});

const getFollowingController = asyncHandler(async function getFollowingController(req, res) {
    const user = await assertProfileVisible(req.user.id, req.params.username);

    const follows = await followModel
        .find({ follower: user._id, status: "accepted" })
        .populate("followee", PROFILE_FIELDS)
        .sort({ createdAt: -1 });

    return res.status(200).json({
        items: follows.map((f) => serializePublicUser(f.followee))
    })
});

const getMeController = asyncHandler(async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id);
    if (!user) {
        throw new NotFoundError("User not found");
    }
    return res.status(200).json({ user: serializeUser(user) })
});

const updateMeController = asyncHandler(async function updateMeController(req, res) {
    const { fullName, name, bio, profileImage, avatarUrl, isPrivate, username } = req.body;

    const update = {};
    if (name !== undefined) update.fullName = name;
    if (fullName !== undefined) update.fullName = fullName;
    if (bio !== undefined) update.bio = bio;
    if (avatarUrl !== undefined) update.profileImage = avatarUrl;
    if (profileImage !== undefined) update.profileImage = profileImage;
    if (isPrivate !== undefined) update.isPrivate = isPrivate;
    if (username !== undefined) update.username = username;

    let user;
    try {
        user = await userModel.findByIdAndUpdate(
            req.user.id,
            { $set: update },
            { returnDocument: "after", runValidators: true }
        );
    } catch (err) {
        if (err.code === 11000) {
            throw new ConflictError("Username already taken");
        }
        throw err;
    }

    return res.status(200).json({
        message: "Profile updated successfully",
        user: serializeUser(user),
    })
});

/**
 * PATCH /api/user/me/notifications [protected]
 * Sole notification preference the frontend settings UI could plausibly
 * offer today (push/email toggle isn't built in the UI yet, so this stores
 * a single flag rather than inventing a full preferences object).
 */
const updateNotificationPrefsController = asyncHandler(async function updateNotificationPrefsController(req, res) {
    const { activityNotifications } = req.body;
    if (activityNotifications !== undefined && typeof activityNotifications !== "boolean") {
        throw new ValidationError("activityNotifications must be true or false");
    }

    const user = await userModel.findByIdAndUpdate(
        req.user.id,
        { $set: { activityNotifications: activityNotifications ?? true } },
        { returnDocument: "after" }
    );

    return res.status(200).json({
        message: "Notification preferences updated",
        activityNotifications: user.activityNotifications,
    });
});

const listFollowRequestsController = asyncHandler(async function listFollowRequestsController(req, res) {
    const requests = await followModel
        .find({ followee: req.user.id, status: "pending" })
        .populate("follower", PROFILE_FIELDS)
        .sort({ createdAt: -1 });

    return res.status(200).json({
        items: requests.map((r) => ({
            id: r.follower._id,
            user: serializePublicUser(r.follower),
            createdAt: r.createdAt,
        }))
    })
});

const acceptFollowRequestController = asyncHandler(async function acceptFollowRequestController(req, res) {
    const followRecord = await followModel.findOne({
        follower: req.params.userId,
        followee: req.user.id,
        status: "pending",
    });

    if (!followRecord) {
        throw new NotFoundError("Follow request not found");
    }

    followRecord.status = "accepted";
    await followRecord.save();

    return res.status(200).json({ message: "Follow request accepted" })
});

const rejectFollowRequestController = asyncHandler(async function rejectFollowRequestController(req, res) {
    const followRecord = await followModel.findOneAndDelete({
        follower: req.params.userId,
        followee: req.user.id,
        status: "pending",
    });

    if (!followRecord) {
        throw new NotFoundError("Follow request not found");
    }

    return res.status(200).json({ message: "Follow request rejected" })
});

/**
 * GET /api/user/search?q= [protected]
 * Case-insensitive partial match on username or fullName. A regex scan is
 * fine at this scale — no Atlas Search/text-index infra for a learning project.
 */
const searchUsersController = asyncHandler(async function searchUsersController(req, res) {
    const q = (req.query.q || "").toString().trim();
    if (!q) {
        return res.status(200).json({ items: [] });
    }

    const pattern = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(pattern, "i");

    const users = await userModel
        .find({
            _id: { $ne: req.user.id },
            $or: [{ username: regex }, { fullName: regex }],
        })
        .select(PROFILE_FIELDS)
        .limit(20);

    return res.status(200).json({ items: users.map((u) => serializePublicUser(u)) });
});

module.exports = {
    followUserController,
    unFollowUserController,
    getPublicProfileController,
    getFollowersController,
    getFollowingController,
    getMeController,
    updateMeController,
    updateNotificationPrefsController,
    listFollowRequestsController,
    acceptFollowRequestController,
    rejectFollowRequestController,
    searchUsersController,
}

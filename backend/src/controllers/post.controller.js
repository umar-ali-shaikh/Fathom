const postModel = require("../model/post.model");
const ImageKit = require("@imagekit/nodejs");
const likeModel = require("../model/like.model");
const userModel = require("../model/user.model");
const followModel = require("../model/follow.model");
const imageKit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});


async function createPostController(req, res) {
    const uploadedFile = await imageKit.files.upload({
        file: `data:${req.file.mimetype};base64,${req.file.buffer.toString(
            "base64"
        )}`,
        fileName: "image",
        folder: "instagram-posts-images"
    });

    const post = await postModel.create({
        caption: req.body.caption,
        imgUrl: uploadedFile.url,
        user: req.user.id,
    });

    res.status(201).json(
        {
            message: "Post created successfully",
            post
        }
    );
}

async function getPostController(req, res) {
    try {
        const userId = req.user.id;

        const posts = await postModel.find({
            user: userId
        })

        res.status(200).json({
            message: "Post fetch successfully",
            posts
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

async function getPostDetailController(req, res) {
    try {
        const userId = req.user.id;
        const postId = req.params.postId

        const post = await postModel.findById(postId).populate("user").lean();

        if (!post) {
            return res.status(404).json({
                message: "Post not found."
            })
        }

        const isOwnPost = post.user._id.toString() === userId;

        if (post.user.isPrivate && !isOwnPost) {
            const followRecord = await followModel.findOne({
                follower: userId,
                followee: post.user._id,
                status: "accepted",
            });

            if (!followRecord) {
                return res.status(403).json({
                    message: "This account is private."
                })
            }
        }

        const [isLiked, likesCount] = await Promise.all([
            likeModel.findOne({ user: userId, post: post._id }),
            likeModel.countDocuments({ post: post._id }),
        ]);

        return res.status(200).json({
            message: "Post fetched successfully.",
            post: {
                ...post,
                isLiked: !!isLiked,
                likesCount,
            }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

async function likePostController(req, res) {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;

        // Check post exists
        const post = await postModel.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        // Check if already liked
        const existingLike = await likeModel.findOne({
            user: userId,
            post: postId,
        });

        if (existingLike) {
            return res.status(400).json({
                message: "Post already liked",
            });
        }

        // Create like
        await likeModel.create({
            user: userId,
            post: postId,
        });

        // Total likes
        const totalLikes = await likeModel.countDocuments({
            post: postId,
        });

        return res.status(200).json({
            success: true,
            message: "Post liked successfully",
            isLiked: true,
            likes: totalLikes,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

async function unlikePostController(req, res) {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;

        const post = await postModel.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        const existingLike = await likeModel.findOne({
            user: userId,
            post: postId,
        });

        if (!existingLike) {
            return res.status(400).json({
                message: "Post is not liked",
            });
        }

        await likeModel.findByIdAndDelete(existingLike._id);

        const totalLikes = await likeModel.countDocuments({
            post: postId,
        });

        return res.status(200).json({
            success: true,
            message: "Post unliked successfully",
            isLiked: false,
            likes: totalLikes,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

async function getFeedController(req, res) {
    try {
        const user = req.user;

        const posts = await postModel
            .find()
            .sort({ createdAt: -1 })
            .populate("user")
            .lean();

        const feed = await Promise.all(
            posts.map(async (post) => {
                const [isLiked, likesCount] = await Promise.all([
                    likeModel.findOne({
                        user: user.id,
                        post: post._id,
                    }),
                    likeModel.countDocuments({
                        post: post._id,
                    }),
                ]);

                return {
                    ...post,
                    isLiked: !!isLiked,
                    likesCount,
                };
            })
        );

        return res.status(200).json({
            message: "Posts fetched successfully.",
            posts: feed,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}


/**
 * GET /api/post/user/:username [protected]
 * Privacy-aware grid feed for a profile: 403s if the target account is
 * private and the requester isn't the owner or an accepted follower.
 */
async function getUserPostsController(req, res) {
    try {
        const requesterId = req.user.id;
        const { username } = req.params;

        const targetUser = await userModel.findOne({ username });

        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isOwnProfile = targetUser._id.toString() === requesterId;

        if (targetUser.isPrivate && !isOwnProfile) {
            const followRecord = await followModel.findOne({
                follower: requesterId,
                followee: targetUser._id,
                status: "accepted",
            });

            if (!followRecord) {
                return res.status(403).json({
                    message: "This account is private."
                });
            }
        }

        const posts = await postModel
            .find({ user: targetUser._id })
            .sort({ createdAt: -1 })
            .lean();

        const userSummary = {
            _id: targetUser._id,
            username: targetUser.username,
            profileImage: targetUser.profileImage,
        };

        const grid = await Promise.all(
            posts.map(async (post) => {
                const [isLiked, likesCount] = await Promise.all([
                    likeModel.findOne({ user: requesterId, post: post._id }),
                    likeModel.countDocuments({ post: post._id }),
                ]);

                return {
                    ...post,
                    user: userSummary,
                    isLiked: !!isLiked,
                    likesCount,
                };
            })
        );

        return res.status(200).json({
            message: "Posts fetched successfully.",
            posts: grid,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    createPostController,
    getPostController,
    getPostDetailController,
    likePostController,
    unlikePostController,
    getFeedController,
    getUserPostsController,
};
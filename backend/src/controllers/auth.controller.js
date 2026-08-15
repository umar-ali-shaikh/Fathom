const userModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");




/**
 * Register Controller
 */
async function registerController(req, res) {
    try {
        const { email, username, password, bio, profileImage } = req.body;

        // Check if user already exists
        const isUserAlreadyExist = await userModel.findOne({
            $or: [
                { email },
                { username }
            ]
        });

        if (isUserAlreadyExist) {
            return res.status(409).json({
                message:
                    isUserAlreadyExist.email === email
                        ? "Email already exists"
                        : "Username already exists"
            });
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10)

        // Create user
        const user = await userModel.create({
            username,
            email,
            password: hash,
            bio,
            profileImage
        });

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Save token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(201).json({
            message: "User Registered Successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                bio: user.bio,
                profileImage: user.profileImage,
                isPrivate: user.isPrivate
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}


/**
 * Login Controller
 */
async function loginController(req, res) {
    try {
        const { username, email, password } = req.body;

        const user = await userModel.findOne({
            $or: [
                {
                    username: username
                }, {
                    email: email
                }
            ]
        }).select("+password");

        if (!user) {
            return res.status(409).json({
                message: "User not found"
            })
        }

        // password compare
        const isPasswordValid = await bcrypt.compare(password, user.password);


        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Password invalid"
            })
        }


        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        res.status(200).json({
            message: "User loggedIn successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                bio: user.bio,
                profileImage: user.profileImage,
                isPrivate: user.isPrivate
            }
        })
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

/**
 * Get-me Controller
 */

async function getMeController(req, res) {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                bio: user.bio,
                profileImage: user.profileImage,
                isPrivate: user.isPrivate
            }
        })
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

/**
 * Logout Controller
 */

async function logoutController(req, res) {
    res.clearCookie("token");

    res.status(200).json({
        message: "Logged out successfully"
    })
}


module.exports = {
    loginController,
    registerController,
    getMeController,
    logoutController,
}
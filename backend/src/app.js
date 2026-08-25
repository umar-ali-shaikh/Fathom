const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const authRouter = require("./routes/auth.routes");
const postRouter = require("./routes/post.routes");
const userRouter = require("./routes/user.routes");
const commentRouter = require("./routes/comment.routes");
const uploadRouter = require("./routes/upload.routes");
const storyRouter = require("./routes/story.routes");
const reelRouter = require("./routes/reel.routes");
const activityRouter = require("./routes/activity.routes");
const { errorMiddleware, notFoundMiddleware } = require("./middleware/error.middleware");

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cookieParser());

// Allowlisted origins only — reflecting arbitrary origins while
// `credentials: true` is effectively wildcard-with-cookies. fathom-navigator
// (the actual frontend) defaults to 8080 via @lovable.dev/vite-tanstack-config's
// sandbox port detection; 5173-5175 are kept too in case that changes.
// CLIENT_URL covers the deployed frontend.
const DEV_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
];
const allowedOrigins = process.env.CLIENT_URL
    ? [...DEV_ORIGINS, process.env.CLIENT_URL]
    : DEV_ORIGINS;

app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        // Same-origin/non-browser requests (curl, server-to-server) send no origin header.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
}))

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/api/user", userRouter)
app.use("/api/comment", commentRouter)
app.use("/api/upload", uploadRouter)
app.use("/api/story", storyRouter)
app.use("/api/reel", reelRouter)
app.use("/api/activity", activityRouter)

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
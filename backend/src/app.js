const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");
const postRouter = require("./routes/post.routes");
const userRouter = require("./routes/user.routes");
const commentRouter = require("./routes/comment.routes");
// const cors = require("cors");



const app = express();
app.use(express.json());
app.use(cookieParser());
// app.use(cors({
//     credentials: true,
//     // Reflects any localhost origin so the Vite dev server can run on
//     // whichever port is free (5173, 5174, 5175, ...) without editing this file.
//     origin: (origin, callback) => callback(null, true),
// }))

// Routes
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/api/user", userRouter)
app.use("/api/comment", commentRouter)

module.exports = app;
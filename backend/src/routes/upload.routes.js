const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/upload.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { ValidationError } = require("../utils/errors");

const uploadRouter = express.Router();

const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_TYPES.has(file.mimetype)) {
            return cb(new ValidationError("Unsupported file type"));
        }
        cb(null, true);
    },
});

/**
 * @route POST /api/upload [protected]
 * @description body: multipart/form-data with a single "file" field. Returns { url, fileId }.
 */
uploadRouter.post("/", authMiddleware, upload.single("file"), uploadController.uploadFileController);

module.exports = uploadRouter;

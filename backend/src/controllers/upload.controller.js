const imageKit = require("../utils/imagekit");
const asyncHandler = require("../utils/asyncHandler");
const { ValidationError } = require("../utils/errors");

/**
 * POST /api/upload [protected]
 * Generic single-file upload used anywhere media needs a URL before it's
 * attached to a resource (avatar, story image, reel video) — post creation
 * uses this same endpoint too, so the create flow is upload-then-create
 * everywhere instead of multipart-per-resource.
 */
const uploadFileController = asyncHandler(async function uploadFileController(req, res) {
    if (!req.file) {
        throw new ValidationError("A file is required");
    }

    const uploadedFile = await imageKit.files.upload({
        file: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        fileName: req.file.originalname || "upload",
        folder: "fathom-uploads",
    });

    res.status(201).json({
        url: uploadedFile.url,
        fileId: uploadedFile.fileId,
    });
});

module.exports = { uploadFileController };

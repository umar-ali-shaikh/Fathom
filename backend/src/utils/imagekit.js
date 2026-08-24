const ImageKit = require("@imagekit/nodejs");

// Single shared client — every controller that uploads/deletes media
// (posts, the generic upload endpoint) goes through this instance.
const imageKit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

module.exports = imageKit;

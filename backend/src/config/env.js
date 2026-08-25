const REQUIRED_VARS = [
    "MONGO_URI",
    "JWT_SECRET",
    "IMAGEKIT_PRIVATE_KEY",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "CLIENT_URL",
];

function validateEnv() {
    const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error(
            `Missing required environment variable(s): ${missing.join(", ")}. ` +
            `Copy backend/.env.example to backend/.env and fill in the values.`
        );
        process.exit(1);
    }

    if (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32) {
        console.error("JWT_SECRET must be at least 32 characters in production.");
        process.exit(1);
    }
}

module.exports = validateEnv;

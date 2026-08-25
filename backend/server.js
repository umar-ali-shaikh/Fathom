require("dotenv").config();

const validateEnv = require("./src/config/env");
validateEnv();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const mongoose = require("mongoose");
const connectToDatabase = require("./src/config/database");
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

async function start() {
    await connectToDatabase();

    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

    const shutdown = async (signal) => {
        console.log(`${signal} received, shutting down gracefully`);
        server.close(async () => {
            await mongoose.connection.close();
            process.exit(0);
        });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}

start();
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectDatabase } from "./config/db.js";
import { syncDatabase } from "./models/index.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());

// CORS
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(morgan("dev"));

// Health Check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hand Band API is running",
        version: "1.0.0",
        environment: process.env.NODE_ENV,
    });
});

// Routes
import familyRoutes from "./modules/family/family.routes.js";
import healthRoutes from "./modules/health/health.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/health", healthRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
    try {
        await connectDatabase();
        await syncDatabase();

        app.listen(PORT, () => {
            console.log(`✓ Hand Band API running on port ${PORT}`);
            console.log(`✓ http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("✗ Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
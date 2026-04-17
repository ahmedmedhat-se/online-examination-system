/// Main App Imports
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";

// API Routes Imports
import { authRouter } from "./apis/authRoutes.js";

// Main App Configs/Vars
dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Global App Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    helmet({
        contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
);
app.use(morgan(process.env.NODE_ENV == "production" ? "combined" : "dev"));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: process.env.CORS_CREDENTIALS,
    credentials: process.env.CORS_CREDENTIALS === "true",
    optionsSuccessStatus: 200,
    exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

// Rate Limiters applied for APIs
const createLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            message,
            success: false
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next, options) => {
            res.status(options.statusCode || 429).json(options.message);
        },
        skip: process.env.DISABLE_RATE_LIMIT === 'true' ? () => true : undefined
    });
};

const authLimiter = createLimiter(
    15 * 60 * 1000,
    50,
    "Too many authentication requests. Please try again in 15 minutes."
);

// System Rate Limiters
app.use("/api/auth", authLimiter);

// System APIs
app.use("/api/auth", authRouter);

// Health Check Endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// App Initialization
app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
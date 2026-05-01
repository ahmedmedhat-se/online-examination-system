import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { authRouter } from "./apis/authRoutes.js";
import { studentRouter } from "./apis/studentRoutes.js";
import { instructorRouter } from "./apis/instructorRoutes.js";
import { adminRouter } from "./apis/adminRoutes.js";

dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Session-Token",
    "x-session-token"
  ],
  exposedHeaders: ["X-Session-Token", "x-session-token"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(morgan("dev"));

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { message, success: false },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      res.status(options.statusCode || 429).json(options.message);
    },
    skip: process.env.DISABLE_RATE_LIMIT === "true" ? () => true : undefined,
  });

const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many authentication requests. Please try again in 15 minutes."
);

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/student", studentRouter);
app.use("/api/instructor", instructorRouter);
app.use("/api/admin", adminRouter);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use((err, req, res, next) => {
  console.error("Route Error:", err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`
- Server is running on: http://localhost:${PORT}
- Environment: ${process.env.NODE_ENV || "development"}
- Started: ${new Date().toLocaleString()}
- Frontend: ${process.env.FRONTEND_URL || "http://localhost:5000"}
`);
});
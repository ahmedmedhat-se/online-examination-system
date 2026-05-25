// Importing Dependencies
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { sequelize } from "./database/mysql.js";

// Importing API Routers
import { authRouter } from "./apis/auth.routes.js";
import { userRouter } from "./apis/user.routes.js";
import { studentRouter } from "./apis/student.routes.js";
import { instructorRouter } from "./apis/instructor.routes.js";
import { adminRouter } from "./apis/admin.routes.js";
import { courseRouter } from "./apis/course.routes.js";
import { categoryRouter } from "./apis/category.routes.js";
import { examRouter } from "./apis/exam.routes.js";
import { questionRouter } from "./apis/question.routes.js";
import { examAttemptRouter } from "./apis/exam-attempt.routes.js";

dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

const app = express();
const PORT = process.env.PORT || 8080;

// Global Application Middleware
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

// Application Rate-Limiters
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

const generalLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  "Too many requests. Please try again in 15 minutes."
);

// APIs
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/user", generalLimiter, userRouter);
app.use("/api/v1/student", generalLimiter, studentRouter);
app.use("/api/v1/instructor", generalLimiter, instructorRouter);
app.use("/api/v1/admin", generalLimiter, adminRouter);
app.use("/api/v1/courses", generalLimiter, courseRouter);
app.use("/api/v1/categories", generalLimiter, categoryRouter);
app.use("/api/v1/exams", generalLimiter, examRouter);
app.use("/api/v1/questions", generalLimiter, questionRouter);
app.use("/api/v1/attempts", generalLimiter, examAttemptRouter);

// Health Checker
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Route Error:", err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Application Initialization
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize connection established successfully.');

    app.listen(PORT, () => {
      console.log(`
- Server is running on: http://localhost:${PORT}
- Environment: ${process.env.NODE_ENV || "development"}
- Started: ${new Date().toLocaleString()}
- Frontend: ${process.env.FRONTEND_URL || "http://localhost:5000"}
`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
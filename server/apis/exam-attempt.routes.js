import express from "express";
import { examAttemptController } from "../app/controllers/examAttemptController.js";
import { authenticate } from "../app/middlewares/authMiddleware.js";
import { authorize } from "../app/middlewares/roleMiddleware.js";

export const examAttemptRouter = express.Router();

examAttemptRouter.post("/start", authenticate, authorize("student"), examAttemptController.startExam);
examAttemptRouter.post("/submit", authenticate, authorize("student"), examAttemptController.submitExam);
examAttemptRouter.get("/mine", authenticate, authorize("student"), examAttemptController.getStudentAttempts);
examAttemptRouter.get("/exam/:examId", authenticate, authorize("instructor", "admin"), examAttemptController.getExamAttempts);
examAttemptRouter.get("/:id", authenticate, examAttemptController.getAttemptById);
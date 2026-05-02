import { Router } from "express";
import { authenticate } from "../app/middlewares/authMiddleware.js";
import { authorize } from "../app/middlewares/roleMiddleware.js";
import { instructorController } from "../app/controllers/instructorController.js";

const router = Router();

router.get("/profile", authenticate, authorize("instructor"), instructorController.getProfile);
router.put("/profile", authenticate, authorize("instructor"), instructorController.updateProfile);
router.get("/courses", authenticate, authorize("instructor"), instructorController.getCourses);
router.get("/exams", authenticate, authorize("instructor"), instructorController.getExams);
router.post("/exams", authenticate, authorize("instructor"), instructorController.createExam);
router.put("/exams/:id", authenticate, authorize("instructor"), instructorController.updateExam);
router.delete("/exams/:id", authenticate, authorize("instructor"), instructorController.deleteExam);
router.get("/exams/:examId/questions", authenticate, authorize("instructor"), instructorController.getQuestions);
router.post("/exams/:examId/questions", authenticate, authorize("instructor"), instructorController.createQuestion);
router.put("/questions/:id", authenticate, authorize("instructor"), instructorController.updateQuestion);
router.delete("/questions/:id", authenticate, authorize("instructor"), instructorController.deleteQuestion);
router.get("/exams/:examId/students", authenticate, authorize("instructor"), instructorController.getExamStudents);

export { router as instructorRouter };
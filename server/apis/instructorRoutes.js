import { Router } from "express";
import { authenticate } from "../app/middlewares/authMiddleware.js";
import { authorize } from "../app/middlewares/roleMiddleware.js";
import { instructorController } from "../app/controllers/instructorController.js";

const router = Router();

router.get("/profile", authenticate, authorize("instructor"), instructorController.getProfile);
router.put("/profile", authenticate, authorize("instructor"), instructorController.updateProfile);
router.get("/courses", authenticate, authorize("instructor"), instructorController.getCourses);
router.get("/exams", authenticate, authorize("instructor"), instructorController.getExams);

export { router as instructorRouter };
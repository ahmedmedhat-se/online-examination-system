import { Router } from "express";
import { authenticate } from "../app/middlewares/authMiddleware.js";
import { authorize } from "../app/middlewares/roleMiddleware.js";
import { studentController } from "../app/controllers/studentController.js";

const router = Router();

router.get("/profile", authenticate, authorize("student"), studentController.getProfile);
router.put("/profile", authenticate, authorize("student"), studentController.updateProfile);
router.get("/enrollments", authenticate, authorize("student"), studentController.getEnrollments);
router.get("/attempts", authenticate, authorize("student"), studentController.getAttempts);

export { router as studentRouter };
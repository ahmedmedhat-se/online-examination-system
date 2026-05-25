import { Router } from "express";
import { authenticate } from "../app/middlewares/authMiddleware.js";
import { authorize } from "../app/middlewares/roleMiddleware.js";
import { studentController } from "../app/controllers/studentController.js";

const studentRouter = Router();

studentRouter.get("/profile", authenticate, authorize("student"), studentController.getProfile);
studentRouter.put("/profile", authenticate, authorize("student"), studentController.updateProfile);
studentRouter.get("/enrollments", authenticate, authorize("student"), studentController.getEnrollments);
studentRouter.get("/attempts", authenticate, authorize("student"), studentController.getAttempts);

export { studentRouter };
import { Router } from "express";
import { authenticate } from "../app/middlewares/authMiddleware.js";
import { authorize } from "../app/middlewares/roleMiddleware.js";
import { adminController } from "../app/controllers/adminController.js";

const router = Router();

router.get("/profile", authenticate, authorize("admin"), adminController.getProfile);
router.get("/stats", authenticate, authorize("admin"), adminController.getStats);
router.get("/users", authenticate, authorize("admin"), adminController.getAllUsers);
router.get("/students", authenticate, authorize("admin"), adminController.getAllStudents);
router.get("/instructors", authenticate, authorize("admin"), adminController.getAllInstructors);
router.get("/admins", authenticate, authorize("admin"), adminController.getAllAdmins);

export { router as adminRouter };
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
router.put("/users/:id", authenticate, authorize("admin"), adminController.updateUser);
router.delete("/users/:id", authenticate, authorize("admin"), adminController.deleteUser);

export { router as adminRouter };
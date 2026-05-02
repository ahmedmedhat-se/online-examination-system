import express from "express";
import { examController } from "../app/controllers/examController.js";
import { authenticate, attachRoleDetails } from "../app/middlewares/authMiddleware.js";
import { authorize } from "../app/middlewares/roleMiddleware.js";

export const examRouter = express.Router();

examRouter.get("/", examController.getAll);
examRouter.get("/:id", examController.getById);
examRouter.post("/", authenticate, attachRoleDetails, authorize("instructor", "admin"), examController.create);
examRouter.put("/:id", authenticate, attachRoleDetails, authorize("instructor", "admin"), examController.update);
examRouter.delete("/:id", authenticate, authorize("admin"), examController.delete);
examRouter.get("/instructor/mine", authenticate, attachRoleDetails, authorize("instructor"), examController.getByInstructor);
examRouter.get("/course/:courseId", examController.getByCourse);
examRouter.get("/student/mine", authenticate, authorize("student"), examController.getStudentExams);
examRouter.post("/:id/enroll", authenticate, authorize("instructor", "admin"), examController.enrollStudent);
examRouter.get("/:id/students", authenticate, authorize("instructor", "admin"), examController.getEnrolledStudents);
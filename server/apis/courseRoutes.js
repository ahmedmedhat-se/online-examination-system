import express from "express";
import { courseController } from "../app/controllers/courseController.js";
import { authenticate } from "../app/middlewares/authMiddleware.js";
import { authorize } from "../app/middlewares/roleMiddleware.js";

export const courseRouter = express.Router();

courseRouter.get("/", courseController.getAll);
courseRouter.get("/:id", courseController.getById);
courseRouter.post("/", authenticate, authorize("admin", "instructor"), courseController.create);
courseRouter.put("/:id", authenticate, authorize("admin", "instructor"), courseController.update);
courseRouter.delete("/:id", authenticate, authorize("admin", "instructor"), courseController.delete);
courseRouter.post("/:id/instructors", authenticate, authorize("admin"), courseController.assignInstructor);
courseRouter.delete("/:id/instructors", authenticate, authorize("admin"), courseController.removeInstructor);
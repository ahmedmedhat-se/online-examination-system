import express from "express";
import { questionController } from "../app/controllers/questionController.js";
import { authenticate } from "../app/middlewares/authMiddleware.js";
import { authorize } from "../app/middlewares/roleMiddleware.js";

export const questionRouter = express.Router();

questionRouter.get("/exam/:examId", questionController.getByExamId);
questionRouter.get("/:id", questionController.getById);
questionRouter.post("/", authenticate, authorize("instructor", "admin"), questionController.create);
questionRouter.put("/:id", authenticate, authorize("instructor", "admin"), questionController.update);
questionRouter.delete("/:id", authenticate, authorize("instructor", "admin"), questionController.delete);
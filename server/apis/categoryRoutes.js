import express from "express";
import { categoryController } from "../app/controllers/categoryController.js";
import { authenticate } from "../app/middlewares/authMiddleware.js";
import { authorize } from "../app/middlewares/roleMiddleware.js";

export const categoryRouter = express.Router();

categoryRouter.get("/", categoryController.getAll);
categoryRouter.get("/:id", categoryController.getById);
categoryRouter.post("/", authenticate, authorize("admin"), categoryController.create);
categoryRouter.put("/:id", authenticate, authorize("admin"), categoryController.update);
categoryRouter.delete("/:id", authenticate, authorize("admin"), categoryController.delete);
import express from "express";
import { userController } from "../app/controllers/userController.js";
import { authenticate } from "../app/middlewares/authMiddleware.js";
import { authorize } from "../app/middlewares/roleMiddleware.js";

export const userRouter = express.Router();

userRouter.get("/", authenticate, authorize("admin"), userController.getAll);
userRouter.get("/:id", authenticate, authorize("admin"), userController.getById);
userRouter.put("/:id", authenticate, authorize("admin"), userController.update);
userRouter.delete("/:id", authenticate, authorize("admin"), userController.delete);
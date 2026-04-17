import express from "express";
import { authController } from "../app/controllers/authController.js";
import { authValidation } from "../app/validations/authValidation.js";
import { authenticate } from "../app/middlewares/authMiddleware.js";

export const authRouter = express.Router();

authRouter.post("/register", authValidation.register, authController.register);
authRouter.post("/login", authValidation.login, authController.login);
authRouter.post("/logout", authenticate, authController.logout);
authRouter.get("/current-user", authenticate, authController.getCurrentUser);
authRouter.put("/profile", authenticate, authValidation.updateProfile, authController.updateProfile);
authRouter.put("/change-password", authenticate, authValidation.changePassword, authController.changePassword);
authRouter.delete("/account", authenticate, authController.deactivateAccount);
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { Instructor } from "../models/Instructor.js";
import { Admin } from "../models/Admin.js";
import { generateTokens } from "../../utils/jwt.js";
import { setAuthCookies } from "../../utils/cookieHelper.js";

export const authController = {
    register: async (req, res) => {
        try {
            const { email, password, first_name, last_name, role } = req.body;
            const userRole = role || "student";

            const existingUser = await User.readUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    message: "User with this email already exists",
                    success: false
                });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const userId = await User.create({
                email,
                password_hash: hashedPassword,
                first_name,
                last_name,
                role: userRole
            });

            if (userRole === "student") {
                await Student.create({ user_id: userId });
            } else if (userRole === "instructor") {
                await Instructor.create({ user_id: userId });
            } else if (userRole === "admin") {
                await Admin.create({ user_id: userId });
            }

            const user = await User.readUserById(userId);

            const { accessToken, refreshToken } = generateTokens({ user_id: user.user_id, user_role: user.role });

            setAuthCookies(res, accessToken, refreshToken);

            await User.updateLastLogin(user.user_id);

            const { password_hash: _, ...userWithoutPassword } = user;

            return res.status(201).json({
                message: "User registered successfully",
                success: true,
                data: { user: userWithoutPassword }
            });
        } catch (error) {
            console.error(`Registration error: ${error.message}`);
            return res.status(500).json({
                message: "Internal server error",
                success: false
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.readUserByEmail(email);
            if (!user) {
                return res.status(401).json({
                    message: "Invalid email or password",
                    success: false
                });
            }

            if (!user.is_active) {
                return res.status(403).json({
                    message: "Account is deactivated",
                    success: false
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: "Invalid email or password",
                    success: false
                });
            }

            const { accessToken, refreshToken } = generateTokens({ user_id: user.user_id, user_role: user.role });

            setAuthCookies(res, accessToken, refreshToken);

            await User.updateLastLogin(user.user_id);

            const { password_hash: _, ...userWithoutPassword } = user;

            return res.status(200).json({
                message: "Login successful",
                success: true,
                data: { user: userWithoutPassword },
                tokens: { access_token: accessToken, refresh_token: refreshToken }
            });
        } catch (error) {
            console.error(`Login error: ${error.message}`);
            return res.status(500).json({
                message: "Internal server error",
                success: false
            });
        }
    },

    logout: async (req, res) => {
        try {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            return res.status(200).json({
                message: "Logout successful",
                success: true
            });
        } catch (error) {
            console.error(`Logout error: ${error.message}`);
            return res.status(500).json({
                message: "Internal server error",
                success: false
            });
        }
    },

    getCurrentUser: async (req, res) => {
        try {
            const user = await User.readUserById(req.user.user_id);
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }

            const { password_hash: _, ...userWithoutPassword } = user;

            return res.status(200).json({
                message: "User fetched successfully",
                success: true,
                data: { user: userWithoutPassword }
            });
        } catch (error) {
            console.error(`Get current user error: ${error.message}`);
            return res.status(500).json({
                message: "Internal server error",
                success: false
            });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { first_name, last_name } = req.body;
            const userId = req.user.user_id;

            const updates = {};
            if (first_name) updates.first_name = first_name;
            if (last_name) updates.last_name = last_name;

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    message: "No fields to update",
                    success: false
                });
            }

            const affectedRows = await User.update(userId, updates);
            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }

            const updatedUser = await User.readUserById(userId);
            const { password_hash: _, ...userWithoutPassword } = updatedUser;

            return res.status(200).json({
                message: "Profile updated successfully",
                success: true,
                data: { user: userWithoutPassword }
            });
        } catch (error) {
            console.error(`Update profile error: ${error.message}`);
            return res.status(500).json({
                message: "Internal server error",
                success: false
            });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { current_password, new_password } = req.body;
            const userId = req.user.user_id;

            const user = await User.readUserById(userId);
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }

            const fullUser = await User.readUserByEmail(user.email);
            const isPasswordValid = await bcrypt.compare(current_password, fullUser.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: "Current password is incorrect",
                    success: false
                });
            }

            const hashedPassword = await bcrypt.hash(new_password, 12);
            await User.update(userId, { password_hash: hashedPassword });

            return res.status(200).json({
                message: "Password changed successfully",
                success: true
            });
        } catch (error) {
            console.error(`Change password error: ${error.message}`);
            return res.status(500).json({
                message: "Internal server error",
                success: false
            });
        }
    },

    deactivateAccount: async (req, res) => {
        try {
            const userId = req.user.user_id;

            const affectedRows = await User.softDelete(userId);
            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }

            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            return res.status(200).json({
                message: "Account deactivated successfully",
                success: true
            });
        } catch (error) {
            console.error(`Deactivate account error: ${error.message}`);
            return res.status(500).json({
                message: "Internal server error",
                success: false
            });
        }
    }
};
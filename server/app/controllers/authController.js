import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { generateTokens } from "../../utils/jwt.js";
import { setAuthCookies } from "../../utils/cookieHelper.js";

export const authController = {
    register: async (req, res) => {
        try {
            const { user_email, user_password, user_first_name, user_last_name, user_date_of_birth, user_role } = req.body;

            const existingUser = await User.readUserByEmail(user_email);
            if (existingUser) {
                return res.status(409).json({
                    message: "User with this email already exists",
                    success: false
                });
            }

            const hashedPassword = await bcrypt.hash(user_password, 12);

            const userId = await User.create({
                user_email,
                user_password: hashedPassword,
                user_first_name,
                user_last_name,
                user_date_of_birth,
                user_role: user_role || "user"
            });

            const user = await User.readUserById(userId);

            const { accessToken, refreshToken } = generateTokens({ user_id: user.user_id, user_role: user.user_role });

            setAuthCookies(res, accessToken, refreshToken);

            await User.updateLastLogin(user.user_id);

            const { user_password: _, ...userWithoutPassword } = user;

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
            const { user_email, user_password } = req.body;

            const user = await User.readUserByEmail(user_email);
            if (!user) {
                return res.status(401).json({
                    message: "Invalid email or password",
                    success: false
                });
            }

            if (!user.user_is_active) {
                return res.status(403).json({
                    message: "Account is deactivated",
                    success: false
                });
            }

            const isPasswordValid = await bcrypt.compare(user_password, user.user_password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: "Invalid email or password",
                    success: false
                });
            }

            const { accessToken, refreshToken } = generateTokens({ user_id: user.user_id, user_role: user.user_role });

            setAuthCookies(res, accessToken, refreshToken);

            await User.updateLastLogin(user.user_id);

            const { user_password: _, ...userWithoutPassword } = user;

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

            const { user_password: _, ...userWithoutPassword } = user;

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
            const { user_first_name, user_last_name, user_date_of_birth } = req.body;
            const userId = req.user.user_id;

            const updates = {};
            if (user_first_name) updates.user_first_name = user_first_name;
            if (user_last_name) updates.user_last_name = user_last_name;
            if (user_date_of_birth) updates.user_date_of_birth = user_date_of_birth;

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
            const { user_password: _, ...userWithoutPassword } = updatedUser;

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

            const fullUser = await User.readUserByEmail(user.user_email);
            const isPasswordValid = await bcrypt.compare(current_password, fullUser.user_password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: "Current password is incorrect",
                    success: false
                });
            }

            const hashedPassword = await bcrypt.hash(new_password, 12);
            await User.update(userId, { user_password: hashedPassword });

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
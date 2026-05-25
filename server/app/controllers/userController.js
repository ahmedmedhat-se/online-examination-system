import { UserModel } from "../models/User.js";

export const userController = {
    getAll: async (req, res) => {
        try {
            const users = await UserModel.readAllUsers();
            return res.status(200).json({ 
                success: true, 
                data: { users } 
            });
        } catch (error) {
            console.error(`Get users error: ${error.message}`);
            return res.status(500).json({ 
                success: false, 
                message: "Internal server error" 
            });
        }
    },

    getById: async (req, res) => {
        try {
            const user = await UserModel.readUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }
            return res.status(200).json({ 
                success: true, 
                data: { user } 
            });
        } catch (error) {
            console.error(`Get user error: ${error.message}`);
            return res.status(500).json({ 
                success: false, 
                message: "Internal server error" 
            });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { first_name, last_name, role, is_active } = req.body;
            
            const existingUser = await UserModel.readUserById(id);
            if (!existingUser) {
                return res.status(404).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }

            const updateData = {};
            if (first_name !== undefined) updateData.first_name = first_name;
            if (last_name !== undefined) updateData.last_name = last_name;
            if (role !== undefined) updateData.role = role;
            if (is_active !== undefined) updateData.is_active = is_active;
            
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "No fields to update" 
                });
            }

            const affected = await UserModel.update(id, updateData);
            if (!affected) {
                return res.status(404).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }
            
            const user = await UserModel.readUserById(id);
            return res.status(200).json({ 
                success: true, 
                message: "User updated successfully", 
                data: { user } 
            });
        } catch (error) {
            console.error(`Update user error: ${error.message}`);
            return res.status(500).json({ 
                success: false, 
                message: "Internal server error" 
            });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            
            const existingUser = await UserModel.readUserById(id);
            if (!existingUser) {
                return res.status(404).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }

            const affected = await UserModel.softDelete(id);
            if (!affected) {
                return res.status(404).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }
            
            return res.status(200).json({ 
                success: true, 
                message: "User deleted successfully" 
            });
        } catch (error) {
            console.error(`Delete user error: ${error.message}`);
            return res.status(500).json({ 
                success: false, 
                message: "Internal server error" 
            });
        }
    }
};
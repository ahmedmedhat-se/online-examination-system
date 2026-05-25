import { AdminModel } from "../models/Admin.js";
import { UserModel } from "../models/User.js";
import { StudentModel } from "../models/Student.js";
import { InstructorModel } from "../models/Instructor.js";

export const adminController = {
    getProfile: async (req, res) => {
        try {
            const admin = await AdminModel.readByUserId(req.user.user_id);
            if (!admin) return res.status(404).json({ message: "Admin not found", success: false });
            const { password_hash: _, ...userData } = await UserModel.readUserById(req.user.user_id);
            return res.status(200).json({ message: "Profile fetched", success: true, data: { admin: { ...admin, ...userData } } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },
    getStats: async (req, res) => {
        try {
            const stats = await AdminModel.readStats();
            return res.status(200).json({ message: "Stats fetched", success: true, data: { stats } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },
    getAllStudents: async (req, res) => {
        try {
            const students = await StudentModel.readAll();
            return res.status(200).json({ message: "Students fetched", success: true, data: { students } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },
    getAllInstructors: async (req, res) => {
        try {
            const instructors = await InstructorModel.readAll();
            return res.status(200).json({ message: "Instructors fetched", success: true, data: { instructors } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },
    getAllAdmins: async (req, res) => {
        try {
            const admins = await AdminModel.readAll();
            return res.status(200).json({ message: "Admins fetched", success: true, data: { admins } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const users = await UserModel.readAllUsers();
            const safeUsers = users.map(({ password_hash, ...rest }) => rest);
            return res.status(200).json({ message: "Users fetched", success: true, data: { users: safeUsers } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { is_active, role, first_name, last_name, email } = req.body;
            const updates = {};
            if (is_active !== undefined) updates.is_active = is_active;
            if (role !== undefined) updates.role = role;
            if (first_name !== undefined) updates.first_name = first_name;
            if (last_name !== undefined) updates.last_name = last_name;
            if (email !== undefined) updates.email = email;

            const affected = await UserModel.update(id, updates);
            if (!affected) return res.status(404).json({ message: "User not found", success: false });
            const user = await UserModel.readUserById(id);
            const { password_hash: _, ...safeUser } = user;
            return res.status(200).json({ message: "User updated", success: true, data: { user: safeUser } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const affected = await UserModel.hardDelete(id);
            if (!affected) return res.status(404).json({ message: "User not found", success: false });
            return res.status(200).json({ message: "User deleted", success: true });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    }
};
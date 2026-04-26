import { Admin } from "../models/Admin.js";
import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { Instructor } from "../models/Instructor.js";

export const adminController = {
    getProfile: async (req, res) => {
        try {
            const admin = await Admin.readByUserId(req.user.user_id);
            if (!admin) return res.status(404).json({ message: "Admin not found", success: false });
            const { password_hash: _, ...userData } = await User.readUserById(req.user.user_id);
            return res.status(200).json({ message: "Profile fetched", success: true, data: { admin: { ...admin, ...userData } } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getStats: async (req, res) => {
        try {
            const stats = await Admin.readStats();
            return res.status(200).json({ message: "Stats fetched", success: true, data: { stats } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getAllStudents: async (req, res) => {
        try {
            const students = await Student.readAll();
            return res.status(200).json({ message: "Students fetched", success: true, data: { students } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getAllInstructors: async (req, res) => {
        try {
            const instructors = await Instructor.readAll();
            return res.status(200).json({ message: "Instructors fetched", success: true, data: { instructors } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getAllAdmins: async (req, res) => {
        try {
            const admins = await Admin.readAll();
            return res.status(200).json({ message: "Admins fetched", success: true, data: { admins } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const users = await User.readAllUsers();
            const safeUsers = users.map(({ password_hash, ...rest }) => rest);
            return res.status(200).json({ message: "Users fetched", success: true, data: { users: safeUsers } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    }
};
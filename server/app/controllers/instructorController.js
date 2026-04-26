import { Instructor } from "../models/Instructor.js";
import { User } from "../models/User.js";

export const instructorController = {
    getProfile: async (req, res) => {
        try {
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (!instructor) return res.status(404).json({ message: "Instructor profile not found", success: false });
            const { password_hash: _, ...userData } = await User.readUserById(req.user.user_id);
            return res.status(200).json({ message: "Profile fetched", success: true, data: { instructor: { ...instructor, ...userData } } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (!instructor) return res.status(404).json({ message: "Instructor not found", success: false });
            const { department, office } = req.body;
            const affected = await Instructor.update(instructor.instructor_id, { department, office });
            if (!affected) return res.status(400).json({ message: "No changes made", success: false });
            const updated = await Instructor.readById(instructor.instructor_id);
            return res.status(200).json({ message: "Profile updated", success: true, data: { instructor: updated } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getCourses: async (req, res) => {
        try {
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (!instructor) return res.status(404).json({ message: "Instructor not found", success: false });
            const courses = await Instructor.readCourses(instructor.instructor_id);
            return res.status(200).json({ message: "Courses fetched", success: true, data: { courses } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getExams: async (req, res) => {
        try {
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (!instructor) return res.status(404).json({ message: "Instructor not found", success: false });
            const exams = await Instructor.readExams(instructor.instructor_id);
            return res.status(200).json({ message: "Exams fetched", success: true, data: { exams } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    }
};
import { Student } from "../models/Student.js";
import { User } from "../models/User.js";

export const studentController = {
    getProfile: async (req, res) => {
        try {
            const student = await Student.readByUserId(req.user.user_id);
            if (!student) {
                return res.status(404).json({ message: "Student profile not found", success: false });
            }
            const userData = await User.readUserById(req.user.user_id);
            const { password_hash, ...rest } = userData;
            return res.status(200).json({ message: "Profile fetched", success: true, data: { student: { ...student, ...rest } } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const student = await Student.readByUserId(req.user.user_id);
            if (!student) {
                return res.status(404).json({ message: "Student not found", success: false });
            }
            const { phone, address_street, address_city, address_zip } = req.body;
            await Student.update(student.student_id, { phone, address_street, address_city, address_zip });
            const updated = await Student.readById(student.student_id);
            return res.status(200).json({ message: "Profile updated", success: true, data: { student: updated } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getEnrollments: async (req, res) => {
        try {
            const student = await Student.readByUserId(req.user.user_id);
            if (!student) {
                return res.status(404).json({ message: "Student not found", success: false });
            }
            const enrollments = await Student.readEnrollments(student.student_id);
            return res.status(200).json({ message: "Enrollments fetched", success: true, data: { enrollments } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getAttempts: async (req, res) => {
        try {
            const student = await Student.readByUserId(req.user.user_id);
            if (!student) {
                return res.status(404).json({ message: "Student not found", success: false });
            }
            const attempts = await Student.readAttempts(student.student_id);
            return res.status(200).json({ message: "Attempts fetched", success: true, data: { attempts } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    }
};